BEGIN;

-- Create a helper RPC to set the current app user id in the session
CREATE OR REPLACE FUNCTION public.set_app_user(user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT set_config('app.current_user_id', COALESCE(user_id::text, ''), true);
$$;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Recreate users policies to use session-based app.current_user_id
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
DROP POLICY IF EXISTS "Enable delete for admins only" ON public.users;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.users;

CREATE POLICY "Enable insert for registration" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for users based on user_id" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on id" ON public.users
  FOR UPDATE USING (id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Enable delete for admins only" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id::text = current_setting('app.current_user_id', true) 
      AND u.role = 'admin'
    )
  );

-- Recreate advertisements policies to use session-based app.current_user_id
DROP POLICY IF EXISTS "Anyone can read advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Users can create their own advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Users can update their own advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Users can delete their own advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Moderators and admins can manage all advertisements" ON public.advertisements;

CREATE POLICY "Anyone can read advertisements" ON public.advertisements
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own advertisements" ON public.advertisements
  FOR INSERT WITH CHECK (user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own advertisements" ON public.advertisements
  FOR UPDATE USING (user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete their own advertisements" ON public.advertisements
  FOR DELETE USING (user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Moderators and admins can manage all advertisements" ON public.advertisements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = current_setting('app.current_user_id', true) 
      AND role IN ('admin', 'moderator')
    )
  );

-- Recreate admin_logs policies to use session-based app.current_user_id
DROP POLICY IF EXISTS "Only admins can read logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins and moderators can create logs" ON public.admin_logs;

CREATE POLICY "Only admins can read logs" ON public.admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = current_setting('app.current_user_id', true) 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins and moderators can create logs" ON public.admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = current_setting('app.current_user_id', true) 
      AND role IN ('admin', 'moderator')
    )
  );

COMMIT;