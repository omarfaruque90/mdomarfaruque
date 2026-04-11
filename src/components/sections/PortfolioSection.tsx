import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ExternalLink } from 'lucide-react';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { Button } from '@/components/ui/button';
import { supabase, PortfolioWork } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PortfolioGridSkeleton } from '@/components/ui/video-skeleton';

const categories = ['All', 'AI Music & Video', 'Graphic Design', 'Web Development'];

// Sample data to use when Supabase is not connected or has no data
const sampleWorks: PortfolioWork[] = [
  {
    id: '1',
    title: 'AI Music Composition',
    description: 'Original AI-generated music track combining electronic beats with orchestral elements for a cinematic experience.',
    image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop',
    project_url: null,
    category: 'AI Music & Video',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'E-commerce Website',
    description: 'Modern e-commerce platform with seamless checkout experience and responsive design.',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    project_url: null,
    category: 'Web Development',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Brand Identity Design',
    description: 'Complete brand identity package including logo, color palette, and typography guidelines for a tech startup.',
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
    project_url: null,
    category: 'Graphic Design',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'AI Video Production',
    description: 'AI-powered video creation with dynamic visuals and synchronized audio for promotional content.',
    image_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&h=400&fit=crop',
    project_url: null,
    category: 'AI Music & Video',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Marketing Poster Series',
    description: 'Eye-catching poster designs for digital and print marketing campaigns with bold typography.',
    image_url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=400&fit=crop',
    project_url: null,
    category: 'Graphic Design',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Corporate Website Redesign',
    description: 'Complete website overhaul focusing on user experience and modern aesthetics.',
    image_url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
    project_url: null,
    category: 'Web Development',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [works, setWorks] = useState<PortfolioWork[]>(sampleWorks);
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

      if (error) {
        console.log('Using sample data - Supabase not configured or table not found');
        setWorks(sampleWorks);
      } else if (data && data.length > 0) {
        setWorks(data);
      } else {
        setWorks(sampleWorks);
      }
    } catch (error) {
      console.log('Using sample data - Supabase connection error');
      setWorks(sampleWorks);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorks = activeCategory === 'All'
    ? works
    : works.filter((work) => work.category === activeCategory);

  return (
    <section id="portfolio" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            My <span className="gradient-text">Portfolio</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore my recent projects showcasing creativity and technical expertise 
            across various domains.
          </p>
        </AnimatedSection>

        {/* Category Filter */}
        <AnimatedSection delay={0.2} className="flex flex-wrap justify-center gap-3 mb-12">
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
          <PortfolioGridSkeleton count={6} />
        ) : (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
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
                
                {/* Overlay */}
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
                  <img
                    src={selectedWork.image_url || ''}
                    alt={selectedWork.title}
                    className="w-full rounded-lg"
                  />
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {selectedWork.category}
                    </span>
                    {selectedWork.project_url && (
                      <Button
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a
                          href={selectedWork.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
    </section>
  );
}