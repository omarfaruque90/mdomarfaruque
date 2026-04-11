import { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Image,
  MessageSquare,
  LogOut,
  Menu,
  X,
  User,
  BarChart3,
  Users,
  Youtube,
  BookOpen,
  Star,
  CalendarCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Import admin components directly to avoid lazy loading issues
import { AdminProfile } from '@/components/admin/AdminProfile';
import { AdminPortfolio } from '@/components/admin/AdminPortfolio';

import { AdminMessages } from '@/components/admin/AdminMessages';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminYouTube } from '@/components/admin/AdminYouTube';
import { AdminBlog } from '@/components/admin/AdminBlog';
import { AdminReviews } from '@/components/admin/AdminReviews';
import { AdminMeetings } from '@/components/admin/AdminMeetings';
import { AdminResumeData } from '@/components/admin/AdminResumeData';

const navItems = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'portfolio', label: 'Portfolio', icon: Image },
  { id: 'resume-data', label: 'Resume Data', icon: LayoutDashboard },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'blog', label: 'Blog', icon: BookOpen },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'meetings', label: 'Meetings', icon: CalendarCheck },
];

const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

const SidebarNav = memo(({ 
  activeTab, 
  setActiveTab, 
  setSidebarOpen 
}: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
  setSidebarOpen: (open: boolean) => void;
}) => (
  <nav className="flex-1 p-4 space-y-2">
    {navItems.map((item) => (
      <button
        key={item.id}
        onClick={() => {
          setActiveTab(item.id);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
          activeTab === item.id
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
      >
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
      </button>
    ))}
  </nav>
));

SidebarNav.displayName = 'SidebarNav';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/admin');
  }, [signOut, navigate]);

  const handleSetActiveTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleSetSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpen(open);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AdminAnalytics />;
      case 'users':
        return <AdminUsers />;
      case 'profile':
        return <AdminProfile />;
      case 'portfolio':
        return <AdminPortfolio />;
      case 'resume-data':
        return <AdminResumeData />;
      case 'youtube':
        return <AdminYouTube />;
      case 'blog':
        return <AdminBlog />;
      case 'messages':
        return <AdminMessages />;
      case 'reviews':
        return <AdminReviews />;
      case 'meetings':
        return <AdminMeetings />;
      default:
        return <AdminAnalytics />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-xl font-bold gradient-text">
                Admin Panel
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1 truncate">{user?.email}</p>
          </div>

          {/* Navigation */}
          <SidebarNav 
            activeTab={activeTab} 
            setActiveTab={handleSetActiveTab} 
            setSidebarOpen={handleSetSidebarOpen}
          />

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-secondary rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold capitalize">
                  {activeTab}
                </h2>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              View Site
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
