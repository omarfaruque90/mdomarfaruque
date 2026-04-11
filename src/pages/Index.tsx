import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { PortfolioSection } from '@/components/sections/PortfolioSection';
import { ResumeSection } from '@/components/sections/ResumeSection';

import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { MeetingSection } from '@/components/sections/MeetingSection';
import { ParticleBackground, GradientOrbs } from '@/components/animations/ParticleBackground';
import { useAnalyticsTracker } from '@/hooks/useAnalytics';

const Index = () => {
  // Track page views for analytics
  useAnalyticsTracker();

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <GradientOrbs />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <PortfolioSection />
        <ResumeSection />
        <TestimonialsSection />
        <MeetingSection />
        
      </main>
      <Footer />
    </div>
  );
};

export default Index;
