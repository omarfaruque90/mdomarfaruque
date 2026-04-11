import { useState, useEffect, useMemo, memo } from 'react';
import { Users, Eye, Clock, MousePointerClick, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  viewsPerVisit: number;
  avgDuration: number;
  bounceRate: number;
  chartData: { date: string; visitors: number; pageViews: number }[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  suffix?: string;
}

const StatCard = memo(({ title, value, icon, trend, suffix }: StatCardProps) => (
  <Card className="bg-card border-border">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value}
        {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {Math.abs(trend).toFixed(1)}% from yesterday
        </div>
      )}
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

function AdminAnalyticsComponent() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeVisitors, setRealtimeVisitors] = useState(0);

  const fetchAnalytics = async () => {
    try {
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);

      // Fetch visits for the last 7 days
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('*')
        .gte('started_at', sevenDaysAgo.toISOString())
        .order('started_at', { ascending: true });

      if (visitsError) throw visitsError;

      // Fetch page views for the last 7 days
      const { data: pageViews, error: pageViewsError } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (pageViewsError) throw pageViewsError;

      // Calculate metrics
      const totalVisitors = visits?.length || 0;
      const totalPageViews = pageViews?.length || 0;
      const viewsPerVisit = totalVisitors > 0 ? totalPageViews / totalVisitors : 0;

      // Calculate average duration
      const durations = (visits || [])
        .filter((v) => v.ended_at)
        .map((v) => new Date(v.ended_at).getTime() - new Date(v.started_at).getTime());
      const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length / 1000 : 0;

      // Calculate bounce rate
      const bounces = (visits || []).filter((v) => v.is_bounce).length;
      const bounceRate = totalVisitors > 0 ? (bounces / totalVisitors) * 100 : 0;

      // Prepare chart data
      const chartData: { date: string; visitors: number; pageViews: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const dayVisitors = (visits || []).filter((v) => {
          const d = new Date(v.started_at);
          return d >= dayStart && d <= dayEnd;
        }).length;

        const dayPageViews = (pageViews || []).filter((pv) => {
          const d = new Date(pv.created_at);
          return d >= dayStart && d <= dayEnd;
        }).length;

        chartData.push({
          date: format(date, 'MMM dd'),
          visitors: dayVisitors,
          pageViews: dayPageViews,
        });
      }

      setAnalytics({
        totalVisitors,
        totalPageViews,
        viewsPerVisit,
        avgDuration,
        bounceRate,
        chartData,
      });

      // Calculate realtime visitors (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', fiveMinutesAgo);

      setRealtimeVisitors(count || 0);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Set up realtime subscription
    const channel = supabase
      .channel('analytics-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'page_views' },
        () => {
          fetchAnalytics();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visits' },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-semibold">Real-Time Analytics</h3>
        <p className="text-muted-foreground text-sm">
          Monitor your website traffic and engagement in real-time.
        </p>
      </div>

      {/* Realtime indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{realtimeVisitors}</span> active visitor
          {realtimeVisitors !== 1 ? 's' : ''} right now
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Visitors"
          value={analytics?.totalVisitors || 0}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          title="Page Views"
          value={analytics?.totalPageViews || 0}
          icon={<Eye className="w-4 h-4" />}
        />
        <StatCard
          title="Views / Visit"
          value={(analytics?.viewsPerVisit || 0).toFixed(1)}
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <StatCard
          title="Avg. Duration"
          value={formatDuration(analytics?.avgDuration || 0)}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          title="Bounce Rate"
          value={`${(analytics?.bounceRate || 0).toFixed(1)}%`}
          icon={<MousePointerClick className="w-4 h-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Visitors (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.chartData || []}>
                  <defs>
                    <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#visitorGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Page Views (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const AdminAnalytics = memo(AdminAnalyticsComponent);
