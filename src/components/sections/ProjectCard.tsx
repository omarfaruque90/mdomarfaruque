import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioWork } from '@/lib/supabase';

interface ProjectCardProps {
  work: PortfolioWork;
  index?: number;
}

/**
 * Shared project card: thumbnail on top, content always visible
 * (works on touch devices — no hover required to read it).
 */
export function ProjectCard({ work, index = 0 }: ProjectCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shine"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={work.image_url || ''}
          alt={work.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {work.project_url && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-xs font-medium text-primary border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
          {work.category}
        </span>
        <h3 className="font-display text-lg font-semibold mb-2">{work.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {work.description}
        </p>

        {work.tech_stack && work.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {work.tech_stack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2">
          {work.github_url && (
            <Button size="sm" variant="outline" asChild className="gap-1.5">
              <a
                href={work.github_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${work.title} source code on GitHub`}
              >
                <Github className="w-4 h-4" />
                Code
              </a>
            </Button>
          )}
          {work.project_url && (
            <Button size="sm" asChild className="gap-1.5">
              <a
                href={work.project_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
