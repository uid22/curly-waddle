-- Add display_id column to profiles
ALTER TABLE public.profiles ADD COLUMN display_id INTEGER;

-- Create a sequence for display_id
CREATE SEQUENCE IF NOT EXISTS profiles_display_id_seq START 1;

-- Create function to auto-assign display_id
CREATE OR REPLACE FUNCTION public.assign_display_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id = nextval('profiles_display_id_seq');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to assign display_id on insert
CREATE TRIGGER set_display_id_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_display_id();