import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { Button } from '@/components/ui/button';
import { supabase, PortfolioWork } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PortfolioGridSkeleton } from '@/components/ui/video-skeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParticleBackground, GradientOrbs } from '@/components/animations/ParticleBackground';

const categories = ['All', 'AI Music & Video', 'Graphic Design', 'Web Development'];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [works, setWorks] = useState<PortfolioWork[]>([]);
  const [selectedWork, setSelectedWork] = useState<PortfolioWork | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_works')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setWorks(data);
      }
    } catch (error) {
      console.error('Error fetching portfolio works:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorks = activeCategory === 'All'
    ? works
    : works.filter((work) => work.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <GradientOrbs />
      <Navbar />
      <main className="pt-20 pb-20 lg:pt-28 lg:pb-32">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              All <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Browse my complete portfolio of work across all categories.
            </p>
          </AnimatedSection>

          {/* Category Filter */}
          <AnimatedSection delay={0.2} className="flex flex-wrap gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={activeCategory === category ? 'glow' : ''}
              >
                {category}
              </Button>
            ))}
          </AnimatedSection>

          {/* Portfolio Grid */}
          {loading ? (
            <PortfolioGridSkeleton count={9} />
          ) : filteredWorks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No projects found in this category.</p>
            </div>
          ) : (
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredWorks.map((work, index) => (
                  <motion.div
                    key={work.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative overflow-hidden rounded-2xl bg-card shadow-lg cursor-pointer"
                    onClick={() => setSelectedWork(work)}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={work.image_url || ''}
                        alt={work.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <span className="text-xs font-medium text-primary mb-1">{work.category}</span>
                      <h3 className="font-display text-lg font-semibold mb-2">{work.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{work.description}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" variant="secondary">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Work Detail Modal */}
          <Dialog open={!!selectedWork} onOpenChange={() => setSelectedWork(null)}>
            <DialogContent className="max-w-3xl">
              {selectedWork && (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">{selectedWork.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <img src={selectedWork.image_url || ''} alt={selectedWork.title} className="w-full rounded-lg" />
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {selectedWork.category}
                      </span>
                      {selectedWork.project_url && (
                        <Button size="sm" asChild className="gap-2">
                          <a href={selectedWork.project_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                            Visit Live Site
                          </a>
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground">{selectedWork.description}</p>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}
