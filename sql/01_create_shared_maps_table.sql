-- Create shared_maps table for map sharing functionality
-- Run this in Supabase SQL Editor

CREATE TABLE shared_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_code VARCHAR(8) UNIQUE NOT NULL,
  image_url TEXT NOT NULL, -- Supabase Storage URL
  title TEXT DEFAULT 'My Travel Map',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX idx_shared_maps_share_code ON shared_maps(share_code);
CREATE INDEX idx_shared_maps_user_id ON shared_maps(user_id);
CREATE INDEX idx_shared_maps_active ON shared_maps(is_active) WHERE is_active = true;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shared_maps_updated_at 
    BEFORE UPDATE ON shared_maps 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE shared_maps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Users can view their own shared maps" ON shared_maps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create shared maps" ON shared_maps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared maps" ON shared_maps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared maps" ON shared_maps
  FOR DELETE USING (auth.uid() = user_id);

-- Public access for viewing active shared maps (no auth required)
CREATE POLICY "Anyone can view active shared maps" ON shared_maps
  FOR SELECT USING (is_active = true);

-- Add comment for documentation
COMMENT ON TABLE shared_maps IS 'Stores metadata for shared travel maps with public access links';
COMMENT ON COLUMN shared_maps.share_code IS 'Unique 8-character code for public access';
COMMENT ON COLUMN shared_maps.image_url IS 'URL to the map image in Supabase Storage';
COMMENT ON COLUMN shared_maps.view_count IS 'Number of times this shared map has been viewed';