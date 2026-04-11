-- Create profiles table for admin profile
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resumes table
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_works table
CREATE TABLE public.portfolio_works (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies (admin only)
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Resumes policies
CREATE POLICY "Admins can manage resumes" ON public.resumes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view resumes" ON public.resumes
  FOR SELECT USING (true);

-- Portfolio works policies
CREATE POLICY "Admins can manage portfolio" ON public.portfolio_works
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view portfolio" ON public.portfolio_works
  FOR SELECT USING (true);

-- Contact messages policies
CREATE POLICY "Anyone can send messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view messages" ON public.contact_messages
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update messages" ON public.contact_messages
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete messages" ON public.contact_messages
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for assets
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

-- Storage policies for assets bucket
CREATE POLICY "Anyone can view assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets');

CREATE POLICY "Admins can upload assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'assets' AND public.has_role(auth.uid(), 'admin'));