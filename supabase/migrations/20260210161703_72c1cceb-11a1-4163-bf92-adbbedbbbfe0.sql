
-- Create client_reviews table
CREATE TABLE public.client_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  company_name TEXT,
  review_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_approved BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a review
CREATE POLICY "Anyone can submit reviews"
  ON public.client_reviews FOR INSERT
  WITH CHECK (true);

-- Public can view approved reviews only
CREATE POLICY "Public can view approved reviews"
  ON public.client_reviews FOR SELECT
  USING (is_approved = true);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
  ON public.client_reviews FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update reviews (approve)
CREATE POLICY "Admins can update reviews"
  ON public.client_reviews FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
  ON public.client_reviews FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
