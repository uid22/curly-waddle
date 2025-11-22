-- Add storage buckets for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('videos', 'videos', true),
  ('audio', 'audio', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos
CREATE POLICY "Public videos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for audio
CREATE POLICY "Public audio are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

CREATE POLICY "Users can upload their own audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS background_video_url TEXT,
ADD COLUMN IF NOT EXISTS background_audio_url TEXT,
ADD COLUMN IF NOT EXISTS developer_badge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_badge BOOLEAN DEFAULT false;

-- Create social_links table
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on social_links
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for social_links
CREATE POLICY "Public active social links are viewable by everyone"
ON public.social_links FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can view all their own social links"
ON public.social_links FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social links"
ON public.social_links FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social links"
ON public.social_links FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social links"
ON public.social_links FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for social_links updated_at
CREATE TRIGGER update_social_links_updated_at
BEFORE UPDATE ON public.social_links
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();