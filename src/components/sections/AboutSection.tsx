import { motion } from 'framer-motion';
import { Palette, Globe, Play, Code } from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/animations/AnimatedSection';

const skills = [
  {
    icon: Play,
    title: 'AI Music & Video',
    description: 'Producing captivating AI-powered videos, original music compositions, and stunning generative visuals using cutting-edge tools.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Palette,
    title: 'Graphic Design',
    description: 'Creating professional visual identities, YouTube thumbnails, digital posters, and branding assets that captivate audiences.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Code,
    title: 'Web Development',
    description: 'Building modern, responsive, and high-performance websites with clean UI/UX and robust functionality.',
    color: 'from-cyan-500 to-blue-500',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A multi-disciplinary creative professional passionate about bringing ideas to life
            through design and technology.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Bio */}
          <AnimatedSection delay={0.2}>
          <div className="space-y-6">
              <h3 className="font-display text-2xl font-semibold">
                Creative Professional with a Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                I'm MD Omar Faruque, a passionate creative professional based in Bangladesh.
                With expertise spanning Generative AI music & video composition, creative graphic design,
                and professional web development, I bring a unique, multi-disciplinary perspective to every project.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                My journey in the creative industry is driven by a relentless curiosity to master new technologies.
                Whether I am composing AI-powered music and video, crafting a stunning brand identity,
                or building a high-performance interactive website, I approach each task with enthusiasm and precision.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I believe in the power of blending human creativity with modern technology to transform ideas into impactful experiences.
                Let's collaborate and create something extraordinary together.
              </p>
            </div>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection delay={0.3}>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '30+', label: 'Projects Completed' },
                { value: '2+', label: 'Years Experience' },
                { value: '20+', label: 'Happy Clients' },
                { value: '4+', label: 'Skills' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="glass rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Skills */}
        <AnimatedSection>
          <h3 className="font-display text-2xl font-semibold text-center mb-10">
            What I Do
          </h3>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <StaggerItem key={skill.title}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass rounded-2xl p-6 h-full group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <skill.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-display text-lg font-semibold mb-2">{skill.title}</h4>
                <p className="text-sm text-muted-foreground">{skill.description}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
