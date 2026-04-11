import { motion } from 'framer-motion';
import { ArrowDown, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Typewriter } from '@/components/animations/Typewriter';
import { AnimatedSection } from '@/components/animations/AnimatedSection';

const professions = [
  'Generative AI Music & Video Composer',
  'Creative Graphic Designer',
  'Professional Web Developer',
];

// Hardcoded profile image URL for instant loading
const PROFILE_IMAGE_URL = 'https://lfplkumlwbieohlosvjk.supabase.co/storage/v1/object/public/assets/profiles/profile-1766920567285.jpg';

export function HeroSection() {
  const scrollToMeeting = () => {
    const element = document.querySelector('#meeting');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToResume = () => {
    const element = document.querySelector('#resume');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              {/* Animated border */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-spin-slow opacity-75" />
              <div className="absolute inset-1 rounded-full bg-background" />

              {/* Profile image - hardcoded with eager loading */}
              <div className="absolute inset-2 rounded-full overflow-hidden">
                <img
                  src={PROFILE_IMAGE_URL}
                  alt="MD Omar Faruque"
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-accent"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <AnimatedSection delay={0.2}>
              <p className="text-primary font-medium mb-2">Hello, I'm</p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                MD Omar <span className="gradient-text">Faruque</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className="text-xl md:text-2xl lg:text-3xl font-display text-muted-foreground mb-6 h-10">
                <Typewriter words={professions} />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.5}>
              <p className="text-muted-foreground max-w-lg mb-8 mx-auto lg:mx-0">
                Passionate creative professional specializing in Generative AI Music & Video,
                Graphic Design, and Web Development. Transforming ideas into stunning visual and auditory experiences.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.6}>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={scrollToResume}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all group"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  View Resume
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToMeeting}
                  className="group"
                >
                  <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Hire Me
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-sm">Scroll Down</span>
            <ArrowDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
