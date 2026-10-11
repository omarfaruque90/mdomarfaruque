import { PortfolioWork } from '@/lib/supabase';

export const projectCategories = [
  'All',
  'Web Development',
  'Mobile App',
  'Browser Extension',
  'AI Apps',
];

/**
 * Real projects from GitHub (omarfaruque90).
 * Used as the default portfolio content; rows from the Supabase
 * `portfolio_works` table take precedence when present.
 */
export const defaultProjects: PortfolioWork[] = [
  {
    id: 'kharcha',
    title: 'Kharcha — Daily Expense Tracker',
    description:
      'Offline-first daily expense tracker for Android with Bangla + English UI, smart reports, monthly charts, and payment-method tracking (cash, bKash, card). Local SQLite storage — no account needed.',
    image_url:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    project_url: null,
    github_url: 'https://github.com/omarfaruque90/Kharcha',
    category: 'Mobile App',
    tech_stack: ['Flutter', 'Dart', 'SQLite'],
    show_on_homepage: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'nayoori',
    title: 'Nayoori — Luxury Fashion E-commerce',
    description:
      'Premium fashion e-commerce platform with dynamic branding system, admin dashboard, Supabase auth & database, and Bangladesh-compliant legal pages. Clean, minimalist storefront.',
    image_url:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    project_url: null,
    github_url: 'https://github.com/omarfaruque90/Nayoori',
    category: 'Web Development',
    tech_stack: ['Next.js', 'Supabase', 'Tailwind CSS'],
    show_on_homepage: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cashskillbd',
    title: 'CashSkillBD — Productivity Extension',
    description:
      'Professional Chrome (Manifest V3) extension with human-like auto typing, auto language detection + translation, full-page screenshots, and screen-text OCR — docked as a native side panel.',
    image_url:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    project_url: null,
    github_url: 'https://github.com/omarfaruque90/CashSkillBD',
    category: 'Browser Extension',
    tech_stack: ['JavaScript', 'Chrome API', 'Manifest V3'],
    show_on_homepage: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'setup-wizard',
    title: 'Midnight Executive CRM',
    description:
      'Cinematic, dark-themed CRM with a multi-step setup wizard, real-time contact & deal sync via Supabase, and an interactive Kanban sales pipeline with weighted value calculations.',
    image_url:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    project_url: null,
    github_url: 'https://github.com/omarfaruque90/Setup-Wizard',
    category: 'Web Development',
    tech_stack: ['React', 'Supabase', 'Tailwind CSS'],
    show_on_homepage: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'onaayash',
    title: 'Onaayash — AI Media App',
    description:
      'AI-powered media application built on the Gemini API with a full-stack setup (Vite + Express server) and one-click Vercel deployment.',
    image_url:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    project_url: null,
    github_url: 'https://github.com/omarfaruque90/Onaayash',
    category: 'AI Apps',
    tech_stack: ['React', 'Vite', 'Gemini API'],
    show_on_homepage: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
