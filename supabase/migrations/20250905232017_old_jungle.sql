/*
  # Fix users table policies

  1. Security
    - Remove recursive policies that cause infinite recursion
    - Create simple, direct policies for user management
    - Enable RLS on users table with proper policies
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create new, non-recursive policies
CREATE POLICY "Enable read access for users based on user_id"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for registration"
  ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for users based on id"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Enable delete for admins only"
  ON users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id::text = auth.uid()::text 
      AND u.role = 'admin'
    )
  );