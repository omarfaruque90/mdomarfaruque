import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParticleBackground, GradientOrbs } from '@/components/animations/ParticleBackground';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { supabase, Blog } from '@/lib/supabase';
import { format } from 'date-fns';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-3xl font-bold mb-4">Blog post not found</h1>
            <Link to="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <GradientOrbs />
      <Navbar />
      
      <main className="pt-24 pb-20">
        <article className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <Link to="/blog">
              <Button variant="ghost" className="mb-6 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
            </Link>

            {blog.cover_image_url && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-8">
                <img
                  src={blog.cover_image_url}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="w-4 h-4" />
              {blog.published_at && format(new Date(blog.published_at), 'MMMM d, yyyy')}
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
              {blog.title}
            </h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div 
                className="whitespace-pre-wrap text-foreground/90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }}
              />
            </div>
          </AnimatedSection>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
