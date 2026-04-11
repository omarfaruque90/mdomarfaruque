import { Facebook, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/OmarthebhaiJan' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/omar_the_bhaijan' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/mdomarfaruque595' },
  { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@omar-the-bhaijan' },
  { name: 'Email', icon: Mail, href: 'mailto:mdomarfaruque595@gmail.com' },
];

export function Footer() {
  return (
    <footer className="relative py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6"
        >
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all hover:scale-110"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Copyright - Secret admin link */}
          <div className="text-sm text-muted-foreground">
            <Link
              to="/admin"
              className="hover:no-underline"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              © 2024 MD Omar Faruque. All rights reserved.
            </Link>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <span>•</span>
            <a href="#portfolio" className="hover:text-primary transition-colors">Portfolio</a>
            <span>•</span>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
