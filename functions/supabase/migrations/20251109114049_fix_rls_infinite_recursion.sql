-- Fix infinite recursion in RLS policies
-- The issue: Admin policies were checking the users table, causing infinite recursion

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.users;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;

-- Create a function to check if user is admin using auth.jwt()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate admin policies using the function (avoids recursion)
CREATE POLICY "Admins can view all profiles"
  ON public.users
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update any profile"
  ON public.users
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.users
  FOR DELETE
  USING (is_admin());
