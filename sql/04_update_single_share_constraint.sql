-- Update shared_maps table to enforce one share per user
-- Run this in Supabase SQL Editor

-- Create unique partial index to ensure one active share per user
-- This prevents users from having multiple active shares simultaneously
-- PostgreSQL partial indexes are more flexible than table constraints for conditional uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_maps_unique_active_user 
ON shared_maps (user_id) 
WHERE is_active = true;

-- Update RLS policies to be more specific for single share model
DROP POLICY IF EXISTS "Users can create shared maps" ON shared_maps;

CREATE POLICY "Users can create shared maps" ON shared_maps
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    -- Ensure user doesn't already have an active share
    NOT EXISTS (
      SELECT 1 FROM shared_maps 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Add comment for documentation
COMMENT ON INDEX idx_shared_maps_unique_active_user IS 'Ensures each user can only have one active shared map at a time';