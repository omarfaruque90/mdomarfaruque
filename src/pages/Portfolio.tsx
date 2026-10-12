import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { Button } from '@/components/ui/button';
import { supabase, PortfolioWork } from '@/lib/supabase';
import { PortfolioGridSkeleton } from '@/components/ui/video-skeleton';
import { ProjectCard } from '@/components/sections/ProjectCard';
import { defaultProjects, projectCategories } from '@/data/projects';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { ParticleBackground, GradientOrbs } from '@/components/animations/ParticleBackground';

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [works, setWorks] = useState<PortfolioWork[]>(defaultProjects);
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

      if (!error && data && data.length > 0) {
        setWorks(data);
      } else {
        setWorks(defaultProjects);
      }
    } catch (error) {
      console.error('Error fetching portfolio works:', error);
      setWorks(defaultProjects);
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
      <ScrollProgress />
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
              Real projects I've designed and built — from mobile apps to
              e-commerce platforms and AI tools.
            </p>
          </AnimatedSection>

          {/* Category Filter */}
          <AnimatedSection delay={0.2} className="flex flex-wrap gap-3 mb-12">
            {projectCategories.map((category) => (
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
                  <ProjectCard key={work.id} work={work} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
