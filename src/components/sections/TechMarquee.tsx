import { AnimatedSection } from '@/components/animations/AnimatedSection';

const technologies = [
  'React',
  'Next.js',
  'TypeScript',
  'Flutter',
  'Dart',
  'Tailwind CSS',
  'Supabase',
  'JavaScript',
  'Chrome Extensions',
  'SQLite',
  'Firebase',
  'Vite',
  'Git',
  'Gemini API',
];

export function TechMarquee() {
  const row = [...technologies, ...technologies];

  return (
    <section aria-label="Tech stack" className="py-10 border-y border-border bg-secondary/30 overflow-hidden">
      <AnimatedSection>
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
          Tech I work with
        </p>
      </AnimatedSection>
      <div className="relative">
        <div className="flex w-max animate-marquee gap-4 pr-4">
          {row.map((tech, i) => (
            <span
              key={`${tech}-${i}`}
              aria-hidden={i >= technologies.length}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border text-sm font-medium whitespace-nowrap shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent" />
              {tech}
            </span>
          ))}
        </div>
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
