/*
  # Initial Schema Setup

  1. Tables
    - users (managed by Supabase Auth)
    - posts
      - id (uuid, primary key)
      - title (text)
      - slug (text, unique)
      - content (text)
      - excerpt (text)
      - author_id (uuid, references users)
      - published_at (timestamp)
      - created_at (timestamp)
      - updated_at (timestamp)
      - cover_image (text)
      - category (text)
      - tags (text[])
      - featured (boolean)
    - about_page
      - id (uuid, primary key)
      - content (text)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES auth.users(id),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  cover_image text,
  category text,
  tags text[],
  featured boolean DEFAULT false,
  read_time integer DEFAULT 5
);

-- About page content
CREATE TABLE IF NOT EXISTS about_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_page ENABLE ROW LEVEL SECURITY;

-- Policies for posts
CREATE POLICY "Public posts are viewable by everyone"
  ON posts
  FOR SELECT
  USING (published_at IS NOT NULL);

CREATE POLICY "Posts are editable by admin users"
  ON posts
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

-- Policies for about page
CREATE POLICY "About page is viewable by everyone"
  ON about_page
  FOR SELECT
  USING (true);

CREATE POLICY "About page is editable by admin users"
  ON about_page
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_page_updated_at
  BEFORE UPDATE ON about_page
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();