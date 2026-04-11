import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  user_id: string;
  image_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioWork {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  category: string | null;
  show_on_homepage: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  url: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PageView {
  id: string;
  session_id: string;
  page_path: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Visit {
  id: string;
  session_id: string;
  started_at: string;
  ended_at: string | null;
  page_count: number;
  is_bounce: boolean;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  caption: string | null;
  thumbnail_url: string;
  youtube_link: string;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeData {
  id: string;
  category: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}
