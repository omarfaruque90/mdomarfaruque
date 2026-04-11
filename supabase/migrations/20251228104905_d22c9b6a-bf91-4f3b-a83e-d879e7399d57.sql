-- Create youtube_videos table
CREATE TABLE public.youtube_videos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    caption TEXT,
    thumbnail_url TEXT NOT NULL,
    youtube_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on youtube_videos
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for youtube_videos
CREATE POLICY "Public can view youtube videos" 
ON public.youtube_videos 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage youtube videos" 
ON public.youtube_videos 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create blogs table
CREATE TABLE public.blogs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blogs
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- RLS policies for blogs
CREATE POLICY "Public can view published blogs" 
ON public.blogs 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage blogs" 
ON public.blogs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.youtube_videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_works;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resumes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;