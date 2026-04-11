import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParticleBackground, GradientOrbs } from '@/components/animations/ParticleBackground';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/animations/AnimatedSection';
import { supabase, Blog } from '@/lib/supabase';
import { format } from 'date-fns';

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();

    // Real-time subscription
    const channel = supabase
      .channel('blogs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blogs',
        },
        () => {
          fetchBlogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <GradientOrbs />
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mb-12">
            <Link to="/">
              <Button variant="ghost" className="mb-6 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              My <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Insights, tutorials, and thoughts on design, development, and AI.
            </p>
          </AnimatedSection>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : blogs.length === 0 ? (
            <AnimatedSection>
              <div className="text-center py-20 glass rounded-3xl">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No blog posts yet.</p>
                <p className="text-muted-foreground mt-2">Check back soon for new articles!</p>
              </div>
            </AnimatedSection>
          ) : (
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <StaggerItem key={blog.id}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass rounded-2xl overflow-hidden group h-full flex flex-col"
                  >
                    {blog.cover_image_url && (
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={blog.cover_image_url}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        {blog.published_at && format(new Date(blog.published_at), 'MMM d, yyyy')}
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-2 line-clamp-2">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                          {blog.excerpt}
                        </p>
                      )}
                      <Link to={`/blog/${blog.slug}`}>
                        <Button variant="outline" className="w-full gap-2 group/btn">
                          Read More
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
