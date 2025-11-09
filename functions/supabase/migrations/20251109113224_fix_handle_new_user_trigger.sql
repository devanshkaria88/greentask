-- Fix the handle_new_user trigger function to match updated schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone_number, photo_url, region_name, location, lat, lng)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'photo_url',
    NEW.raw_user_meta_data->>'region_name',
    NEW.raw_user_meta_data->>'location',
    CASE 
      WHEN NEW.raw_user_meta_data->>'lat' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'lat')::DOUBLE PRECISION 
      ELSE NULL 
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'lng' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'lng')::DOUBLE PRECISION 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
