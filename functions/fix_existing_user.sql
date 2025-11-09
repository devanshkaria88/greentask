-- Insert the existing user profile that was missing
INSERT INTO public.users (id, name, email, phone_number, role, region_name, location, lat, lng)
VALUES (
  '81ecab5c-a9fd-43e0-95c5-5986061acafc',
  'Devansh Karia',
  'devansh88karia@gmail.com',
  '+919409105881',
  'GramPanchayat',
  'Gujarat',
  'Dhrol',
  0,
  0
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone_number = EXCLUDED.phone_number,
  region_name = EXCLUDED.region_name,
  location = EXCLUDED.location,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng;
