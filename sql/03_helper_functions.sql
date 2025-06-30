-- Helper functions for map sharing functionality
-- Run this in Supabase SQL Editor

-- Function to generate unique share codes
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude confusing chars
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    -- Generate 8-character code
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM shared_maps WHERE share_code = result) INTO code_exists;
    
    -- If code doesn't exist, we can use it
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count atomically
CREATE OR REPLACE FUNCTION increment_share_view_count(share_code_param TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE shared_maps 
  SET view_count = view_count + 1 
  WHERE share_code = share_code_param AND is_active = true
  RETURNING view_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup inactive shares (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_inactive_shares()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete shares that have been inactive for more than 90 days
  DELETE FROM shared_maps 
  WHERE is_active = false 
    AND updated_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION generate_share_code() IS 'Generates a unique 8-character share code for map sharing';
COMMENT ON FUNCTION increment_share_view_count(TEXT) IS 'Atomically increments view count for a shared map';
COMMENT ON FUNCTION cleanup_inactive_shares() IS 'Removes inactive shared maps older than 90 days';