import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { Button } from '@/components/ui/button';
import { supabase, PortfolioWork } from '@/lib/supabase';
import { PortfolioGridSkeleton } from '@/components/ui/video-skeleton';
import { ProjectCard } from '@/components/sections/ProjectCard';
import { defaultProjects, projectCategories } from '@/data/projects';

export function PortfolioSection() {
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
        .eq('show_on_homepage', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Using default projects - Supabase not configured or table not found');
        setWorks(defaultProjects);
      } else if (data && data.length > 0) {
        setWorks(data);
      } else {
        setWorks(defaultProjects);
      }
    } catch (error) {
      console.log('Using default projects - Supabase connection error');
      setWorks(defaultProjects);
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
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            Real projects I've designed and built — from mobile apps to
            e-commerce platforms and AI tools.
          </p>
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            View All Projects <ExternalLink className="w-4 h-4" />
          </Link>
        </AnimatedSection>

        {/* Category Filter */}
        <AnimatedSection delay={0.2} className="flex flex-wrap justify-center gap-3 mb-12">
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
          <PortfolioGridSkeleton count={6} />
        ) : (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredWorks.map((work, index) => (
                <ProjectCard key={work.id} work={work} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
