-- Create profiles table to store user profile information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Create links table to store user's links
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT title_length CHECK (char_length(title) > 0 AND char_length(title) <= 100),
  CONSTRAINT url_length CHECK (char_length(url) > 0 AND char_length(url) <= 500)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for links table
CREATE POLICY "Public active links are viewable by everyone"
  ON public.links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view all their own links"
  ON public.links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own links"
  ON public.links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links"
  ON public.links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links"
  ON public.links FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_links_user_id ON public.links(user_id);
CREATE INDEX idx_links_position ON public.links(user_id, position);

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();