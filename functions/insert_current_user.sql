-- Insert the current user profile
INSERT INTO public.users (id, name, email, phone_number, role, region_name, location, lat, lng)
VALUES (
  '5040bf20-88b3-41c6-8821-7b1e9781441c',
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
  role = EXCLUDED.role,
  region_name = EXCLUDED.region_name,
  location = EXCLUDED.location,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng;
