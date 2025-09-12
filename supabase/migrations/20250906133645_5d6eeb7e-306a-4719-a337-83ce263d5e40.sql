BEGIN;
        

-- Create user role enum
CREATE TYPE user_role AS ENUM ('user', 'vip', 'moderator', 'admin');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role user_role DEFAULT 'user',
  is_banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL,
  subcategory text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  images text[] DEFAULT '{}',
  discord_contact text,
  telegram_contact text,
  is_vip boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Enable insert for registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for users based on user_id" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on id" ON users
  FOR UPDATE USING (id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Enable delete for admins only" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id::text = current_setting('app.current_user_id', true) 
      AND u.role = 'admin'
    )
  );

-- Advertisements policies
CREATE POLICY "Anyone can read advertisements" ON advertisements
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own advertisements" ON advertisements
  FOR INSERT WITH CHECK (user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own advertisements" ON advertisements
  FOR UPDATE USING (user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete their own advertisements" ON advertisements
  FOR DELETE USING (user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Moderators and admins can manage all advertisements" ON advertisements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('app.current_user_id', true) 
      AND role IN ('admin', 'moderator')
    )
  );

-- Admin logs policies
CREATE POLICY "Only admins can read logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('app.current_user_id', true) 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins and moderators can create logs" ON admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('app.current_user_id', true) 
      AND role IN ('admin', 'moderator')
    )
  );

-- Create default admin user (password: admin123)
INSERT INTO users (nickname, password_hash, role) 
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin')
ON CONFLICT (nickname) DO NOTHING;
      /**/ COMMIT;