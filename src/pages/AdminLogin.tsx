import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { GradientOrbs } from '@/components/animations/ParticleBackground';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const checkBanned = async (emailToCheck: string): Promise<{ is_banned: boolean; reason?: string }> => {
    try {
      const response = await supabase.functions.invoke('admin-users', {
        body: { action: 'check_banned', email: emailToCheck },
      });
      
      if (response.error) {
        console.error('Error checking ban status:', response.error);
        return { is_banned: false };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error checking ban status:', error);
      return { is_banned: false };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is banned before proceeding
      const banCheck = await checkBanned(email);
      if (banCheck.is_banned) {
        toast({
          title: 'Access Denied',
          description: banCheck.reason 
            ? `Your account has been banned: ${banCheck.reason}` 
            : 'Your account has been banned. Contact support for assistance.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: 'Sign Up Failed',
            description: error.message || 'Could not create account.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account Created!',
            description: 'Please check your email to confirm your account, then sign in. Note: Admin access requires manual approval.',
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message || 'Invalid credentials. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'Redirecting to dashboard...',
          });
          // Navigate immediately after successful login
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 500);
        }
      }
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      <GradientOrbs />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to website
        </Link>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
              {isSignUp ? <UserPlus className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />}
            </div>
            <h1 className="font-display text-2xl font-bold">
              {isSignUp ? 'Create Account' : 'Admin Login'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isSignUp ? 'Sign up to request admin access' : 'Sign in to access the dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (isSignUp ? 'Creating...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {isSignUp 
              ? 'After signing up, admin access must be granted manually.'
              : 'Protected area. Unauthorized access prohibited.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
