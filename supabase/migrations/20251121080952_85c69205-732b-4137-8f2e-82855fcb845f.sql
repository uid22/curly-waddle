-- Create link_clicks table for analytics
CREATE TABLE IF NOT EXISTS public.link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  clicked_at timestamp with time zone NOT NULL DEFAULT now(),
  referrer text,
  user_agent text,
  country text,
  city text
);

-- Enable RLS
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own link analytics
CREATE POLICY "Users can view their own link clicks"
  ON public.link_clicks
  FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM public.links WHERE id = link_clicks.link_id
    )
  );

-- Allow anyone to insert click data (for public link tracking)
CREATE POLICY "Anyone can insert link clicks"
  ON public.link_clicks
  FOR INSERT
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_user_id ON public.link_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON public.link_clicks(clicked_at DESC);