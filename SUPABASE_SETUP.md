# Supabase Setup Guide

Run these SQL scripts in your Supabase SQL Editor (Dashboard > SQL Editor) in the order shown below.

---

## Step 1: Create User Roles System

```sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Users can read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Admins can manage all roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

---

## Step 2: Create Profiles Table

```sql
-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT,
    bio TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read profiles (public data)
CREATE POLICY "Public can read profiles"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Admins can manage profiles
CREATE POLICY "Admins can manage profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

---

## Step 3: Create Portfolio Works Table

```sql
-- Create portfolio_works table
CREATE TABLE public.portfolio_works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Graphics',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.portfolio_works ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read portfolio works (public data)
CREATE POLICY "Public can read portfolio works"
ON public.portfolio_works
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Admins can manage portfolio works
CREATE POLICY "Admins can manage portfolio works"
ON public.portfolio_works
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

---

## Step 4: Create Resumes Table

```sql
-- Create resumes table
CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read resumes (public data)
CREATE POLICY "Public can read resumes"
ON public.resumes
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Admins can manage resumes
CREATE POLICY "Admins can manage resumes"
ON public.resumes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

---

## Step 5: Create Contact Messages Table

```sql
-- Create contact_messages table
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    project_type TEXT,
    budget TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert contact messages (for contact form)
CREATE POLICY "Anyone can submit contact messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Admins can read and manage all messages
CREATE POLICY "Admins can manage messages"
ON public.contact_messages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for contact messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
```

---

## Step 6: Create Storage Bucket

```sql
-- Create storage bucket for assets (images, PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assets',
    'assets',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- Policy: Anyone can view public assets
CREATE POLICY "Public can view assets"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'assets');

-- Policy: Admins can upload assets
CREATE POLICY "Admins can upload assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'assets'
    AND public.has_role(auth.uid(), 'admin')
);

-- Policy: Admins can update assets
CREATE POLICY "Admins can update assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'assets'
    AND public.has_role(auth.uid(), 'admin')
);

-- Policy: Admins can delete assets
CREATE POLICY "Admins can delete assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'assets'
    AND public.has_role(auth.uid(), 'admin')
);
```

---

## Step 7: Create Admin User

First, go to **Authentication > Users** in your Supabase dashboard and create a new user:
- Email: `mdomarfaruque595@gmail.com`
- Password: `OmarFaruqe90*`

After creating the user, copy the user's UUID and run this SQL:

```sql
-- Replace 'YOUR_USER_UUID_HERE' with the actual UUID from the user you created
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_UUID_HERE', 'admin');
```

**OR** if you already signed up, you can find your user ID with:

```sql
-- Find user ID by email
SELECT id FROM auth.users WHERE email = 'mdomarfaruque595@gmail.com';
```

Then use that ID in the INSERT statement above.

---

## Step 8: Insert Sample Data (Optional)

```sql
-- Insert sample profile
INSERT INTO public.profiles (bio, image_url)
VALUES (
    'Passionate creative professional specializing in graphics design, web development, and AI-generated art. Transforming ideas into stunning visual experiences.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
);

-- Insert sample portfolio works
INSERT INTO public.portfolio_works (title, description, image_url, category) VALUES
(
    'Brand Identity Design',
    'Complete brand identity package including logo, color palette, and typography guidelines for a tech startup.',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
    'Graphics'
),
(
    'E-commerce Website',
    'Modern e-commerce platform with seamless checkout experience and responsive design.',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    'Web'
),
(
    'Cyberpunk City',
    'AI-generated artwork depicting a futuristic cyberpunk cityscape with neon lights.',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    'AI Art'
),
(
    'Social Media Campaign',
    'Engaging social media content strategy and visual assets for brand awareness.',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
    'Content'
),
(
    'Abstract Portrait',
    'Generative AI art creating unique abstract portraits with vibrant colors.',
    'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=400&fit=crop',
    'AI Art'
),
(
    'Corporate Website Redesign',
    'Complete website overhaul focusing on user experience and modern aesthetics.',
    'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
    'Web'
);
```

---

## Troubleshooting

### "Invalid API key" or connection errors
- Double check your `SUPABASE_URL` and `SUPABASE_ANON_KEY` secrets are correct
- Make sure you're using the **anon/public** key, not the service role key

### "Row level security policy violation"
- Make sure you've created the admin user and assigned the admin role
- Check that you're logged in with the correct admin email

### Images not uploading
- Verify the storage bucket was created with `public: true`
- Check that the RLS policies on `storage.objects` are in place

### Contact form not working
- Ensure the `contact_messages` table has the INSERT policy for anon users
- Check browser console for specific error messages

---

## URLs

- **Website**: Your deployed URL
- **Admin Panel**: `/admin`
- **Supabase Dashboard**: https://supabase.com/dashboard

---

That's it! Your portfolio website should now be fully functional with:
- ✅ Public portfolio display
- ✅ Contact form submissions
- ✅ Admin login (email/password)
- ✅ Admin dashboard for managing content
- ✅ Real-time message notifications
- ✅ File uploads for images and resume
