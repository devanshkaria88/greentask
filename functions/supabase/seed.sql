-- Seed data for Greenmatch development environment
-- This file is used to populate the database with test data

-- Note: You'll need to create auth users first through Supabase Auth
-- Then manually insert their UUIDs here or use the handle_new_user trigger

-- Sample users (these would be created through Supabase Auth)
-- For testing, you can manually insert users after creating them in auth.users

-- Example: Insert sample tasks (after creating users)
-- Uncomment and update UUIDs after creating auth users

/*
-- Sample Gram Panchayat user tasks
INSERT INTO public.tasks (
  title,
  description,
  category,
  compensation_amount,
  location,
  lat,
  long,
  estimated_duration_hours,
  required_participants,
  verification_required,
  created_by
) VALUES
(
  'Plant 50 Saplings in Village Commons',
  'We need community members to help plant 50 native tree saplings in the village common area. All materials will be provided. Training on proper planting techniques will be given.',
  'tree_planting',
  500.00,
  'Village Commons, Gram Panchayat Area',
  28.6139,
  77.2090,
  4,
  5,
  true,
  'REPLACE_WITH_GRAM_PANCHAYAT_USER_UUID'
),
(
  'Waste Segregation Awareness Campaign',
  'Conduct door-to-door awareness campaign about waste segregation. Distribute pamphlets and explain the importance of separating wet and dry waste.',
  'awareness',
  300.00,
  'Residential Area, Ward 3',
  28.6140,
  77.2095,
  3,
  2,
  true,
  'REPLACE_WITH_GRAM_PANCHAYAT_USER_UUID'
),
(
  'Clean Village Pond',
  'Help clean the village pond by removing plastic waste and debris. Gloves and bags will be provided.',
  'water_conservation',
  400.00,
  'Village Pond, Near Temple',
  28.6135,
  77.2085,
  5,
  10,
  true,
  'REPLACE_WITH_GRAM_PANCHAYAT_USER_UUID'
),
(
  'Install Solar Street Lights',
  'Assist in installing solar-powered street lights in the village. Technical guidance will be provided.',
  'renewable_energy',
  800.00,
  'Main Village Road',
  28.6145,
  77.2100,
  6,
  3,
  true,
  'REPLACE_WITH_GRAM_PANCHAYAT_USER_UUID'
),
(
  'Organize Community Composting Workshop',
  'Help organize and conduct a workshop on home composting techniques for villagers.',
  'waste_management',
  350.00,
  'Community Center',
  28.6138,
  77.2088,
  2,
  1,
  true,
  'REPLACE_WITH_GRAM_PANCHAYAT_USER_UUID'
);
*/

-- Instructions for seeding:
-- 1. Start Supabase: supabase start
-- 2. Create test users through Supabase Studio (http://localhost:54323)
--    - Go to Authentication > Users > Add User
--    - Create at least one Gram Panchayat user and one Community Member
-- 3. Update the role for Gram Panchayat user:
--    UPDATE public.users SET role = 'GramPanchayat' WHERE email = 'gp@example.com';
-- 4. Get the UUIDs from public.users table
-- 5. Replace 'REPLACE_WITH_GRAM_PANCHAYAT_USER_UUID' with actual UUID
-- 6. Uncomment the INSERT statements above
-- 7. Run: supabase db reset
