/*
  # Create users and advertisements system

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `nickname` (text, unique)
      - `password_hash` (text)
      - `role` (enum: user, vip, moderator, admin)
      - `is_banned` (boolean)
      - `created_at` (timestamp)
    - `advertisements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `category` (text)
      - `subcategory` (text)
      - `title` (text)
      - `description` (text)
      - `images` (text array)
      - `discord_contact` (text)
      - `telegram_contact` (text)
      - `is_vip` (boolean)
      - `created_at` (timestamp)
    - `admin_logs`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key)
      - `action` (text)
      - `target_user_id` (uuid)
      - `details` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for different user roles
*/

-- Create enum for user roles
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
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text OR role IN ('admin', 'moderator'));

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Advertisements policies
CREATE POLICY "Anyone can read advertisements"
  ON advertisements
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create their own advertisements"
  ON advertisements
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own advertisements"
  ON advertisements
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own advertisements"
  ON advertisements
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Moderators and admins can manage all advertisements"
  ON advertisements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'moderator')
    )
  );

-- Admin logs policies
CREATE POLICY "Only admins can read logs"
  ON admin_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins and moderators can create logs"
  ON admin_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'moderator')
    )
  );