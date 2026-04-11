
-- Create resume_data table
CREATE TABLE public.resume_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resume_data ENABLE ROW LEVEL SECURITY;

-- Public can view
CREATE POLICY "Public can view resume data"
ON public.resume_data
FOR SELECT
USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage resume data"
ON public.resume_data
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial data
INSERT INTO public.resume_data (category, title, subtitle, description, display_order) VALUES
('Personal', 'Phone', '+880 1234-567890', NULL, 1),
('Personal', 'Email', 'mdomarfaruque595@gmail.com', NULL, 2),
('Personal', 'Location', 'Bangladesh', NULL, 3),
('Personal', 'Website', 'mdomarfaruque.lovable.app', NULL, 4),
('Experience', 'Freelance Web Developer', 'Self-Employed | 2023 - Present', 'Building modern web applications using React, TypeScript, and Supabase. Delivering full-stack solutions for clients worldwide.', 1),
('Experience', 'Frontend Developer', 'Freelancer | 2022 - 2023', 'Developed responsive websites and web applications. Worked with HTML, CSS, JavaScript, and React.', 2),
('Education', 'Computer Science & Engineering', 'University | 2020 - Present', 'Studying core CS fundamentals including algorithms, data structures, and software engineering.', 1),
('Education', 'Higher Secondary Certificate (HSC)', 'College | 2018 - 2020', 'Completed higher secondary education with a focus on science.', 2),
('Skill', 'React & TypeScript', NULL, 'Building modern, type-safe web applications', 1),
('Skill', 'Tailwind CSS', NULL, 'Responsive and utility-first styling', 2),
('Skill', 'Node.js & Express', NULL, 'Backend API development', 3),
('Skill', 'Supabase & PostgreSQL', NULL, 'Database design and management', 4),
('Skill', 'Git & GitHub', NULL, 'Version control and collaboration', 5);
