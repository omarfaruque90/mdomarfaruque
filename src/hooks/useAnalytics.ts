import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'analytics_session_id';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

const getOrCreateSession = () => {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    const { sessionId, lastActivity } = JSON.parse(stored);
    // Check if session is still valid (within timeout)
    if (Date.now() - lastActivity < SESSION_TIMEOUT) {
      return { sessionId, isNew: false };
    }
  }
  const sessionId = generateSessionId();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId, lastActivity: Date.now() }));
  return { sessionId, isNew: true };
};

const updateSessionActivity = (sessionId: string) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId, lastActivity: Date.now() }));
};

export function useAnalyticsTracker() {
  const tracked = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const trackPageView = async () => {
      try {
        const { sessionId, isNew } = getOrCreateSession();
        sessionIdRef.current = sessionId;
        const pagePath = window.location.pathname;
        const referrer = document.referrer || null;
        const userAgent = navigator.userAgent || null;

        // Insert page view
        await supabase.from('page_views').insert({
          session_id: sessionId,
          page_path: pagePath,
          referrer,
          user_agent: userAgent,
        });

        if (isNew) {
          // Create new visit
          await supabase.from('visits').insert({
            session_id: sessionId,
            is_bounce: true,
            page_count: 1,
          });
        } else {
          // Update existing visit
          await supabase
            .from('visits')
            .update({
              ended_at: new Date().toISOString(),
              is_bounce: false,
              page_count: await getPageCount(sessionId),
            })
            .eq('session_id', sessionId);
        }

        updateSessionActivity(sessionId);
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug('Analytics tracking error:', error);
      }
    };

    const getPageCount = async (sessionId: string): Promise<number> => {
      const { count } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);
      return (count || 0) + 1;
    };

    trackPageView();

    // Track page visibility changes for duration
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionIdRef.current) {
        supabase
          .from('visits')
          .update({ ended_at: new Date().toISOString() })
          .eq('session_id', sessionIdRef.current)
          .then(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

export function useAnalyticsTrackerOnRoute() {
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // Skip if same path or admin routes
    if (lastPath.current === currentPath || currentPath.startsWith('/admin')) {
      return;
    }
    
    lastPath.current = currentPath;

    const trackPageView = async () => {
      try {
        const { sessionId, isNew } = getOrCreateSession();
        const pagePath = currentPath;
        const referrer = document.referrer || null;
        const userAgent = navigator.userAgent || null;

        await supabase.from('page_views').insert({
          session_id: sessionId,
          page_path: pagePath,
          referrer,
          user_agent: userAgent,
        });

        if (!isNew) {
          const { count } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', sessionId);

          await supabase
            .from('visits')
            .update({
              ended_at: new Date().toISOString(),
              is_bounce: false,
              page_count: count || 1,
            })
            .eq('session_id', sessionId);
        }

        updateSessionActivity(sessionId);
      } catch (error) {
        console.debug('Analytics tracking error:', error);
      }
    };

    trackPageView();
  }, []);
}
