import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Sun, Moon, Home, User, Briefcase, FileText, Youtube, BookOpen, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About', href: '#about', icon: User },
  { name: 'Portfolio', href: '/portfolio', isPage: true, icon: Briefcase },
  { name: 'Resume', href: '#resume', icon: FileText },
  { name: 'YouTube', href: '/youtube', isPage: true, icon: Youtube },
  { name: 'Blog', href: '/blog', isPage: true, icon: BookOpen },
  { name: 'Book a Call', href: '#meeting', icon: CalendarCheck, openMeeting: true },
];

const SWIPE_THRESHOLD = 100;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const scrollToSection = (href: string, isPage?: boolean, openMeeting?: boolean) => {
    setIsOpen(false);
    if (openMeeting) {
      window.dispatchEvent(new Event('open-meeting-dialog'));
      return;
    }
    if (isPage) {
      window.location.href = href;
      return;
    }
    if (href === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle swipe gesture to close menu
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 500) {
      setIsOpen(false);
    }
  };

  // Animation variants for mobile menu
  const menuVariants = {
    closed: {
      opacity: 0,
      x: '100%',
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 50 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    }),
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              to="/"
              className="font-display text-xl md:text-2xl font-bold gradient-text"
            >
              Omar Faruque
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href, (link as any).isPage, (link as any).openMeeting)}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="ml-2"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
                className="relative z-[60]"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Menu Panel with Swipe Support */}
            <motion.div
              ref={menuRef}
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.5 }}
              onDragEnd={handleDragEnd}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-background border-l border-border shadow-2xl z-50 md:hidden touch-pan-y"
            >
              <div className="flex flex-col h-full pt-20 pb-8 px-6">
                {/* Navigation Links */}
                <nav className="flex-1" role="navigation" aria-label="Mobile navigation">
                  <ul className="space-y-2">
                    {navLinks.map((link, i) => {
                      const Icon = link.icon;
                      return (
                        <motion.li
                          key={link.name}
                          custom={i}
                          variants={itemVariants}
                          initial="closed"
                          animate="open"
                        >
                          <button
                            onClick={() => scrollToSection(link.href, (link as any).isPage, (link as any).openMeeting)}
                            className="flex items-center gap-4 w-full px-4 py-4 text-lg font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 active:scale-[0.98]"
                          >
                            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-5 w-5" />
                            </span>
                            <span>{link.name}</span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Footer */}
                <motion.div
                  custom={navLinks.length + 1}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  className="pt-6 border-t border-border"
                >
                  <div className="flex items-center justify-between px-4">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleTheme}
                      className="gap-2"
                    >
                      {isDark ? (
                        <>
                          <Sun className="h-4 w-4" />
                          Light
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4" />
                          Dark
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-6">
                    © 2024 Omar Faruque
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
