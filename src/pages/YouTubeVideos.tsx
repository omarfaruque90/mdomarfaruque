import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParticleBackground, GradientOrbs } from '@/components/animations/ParticleBackground';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/animations/AnimatedSection';
import { supabase, YouTubeVideo } from '@/lib/supabase';
import { VideoGridSkeleton } from '@/components/ui/video-skeleton';

const YouTubeVideos = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();

    // Real-time subscription
    const channel = supabase
      .channel('youtube-videos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_videos',
        },
        () => {
          fetchVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
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
              Watch My <span className="gradient-text">YouTube Videos</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Explore my collection of tutorials, showcases, and creative content on YouTube.
            </p>
          </AnimatedSection>

          {loading ? (
            <VideoGridSkeleton count={6} />
          ) : videos.length === 0 ? (
            <AnimatedSection>
              <div className="text-center py-20 glass rounded-3xl">
                <Play className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No videos yet.</p>
                <p className="text-muted-foreground mt-2">Check back soon for new content!</p>
              </div>
            </AnimatedSection>
          ) : (
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <StaggerItem key={video.id}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass rounded-2xl overflow-hidden group"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary-foreground ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-lg font-semibold mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      {video.caption && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {video.caption}
                        </p>
                      )}
                      <a
                        href={video.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full gap-2 group/btn">
                          <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          Watch This Video
                        </Button>
                      </a>
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

export default YouTubeVideos;
