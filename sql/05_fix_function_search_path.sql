-- Fix Function Search Path Mutable warnings
-- This migration adds explicit search_path settings to all database functions
-- to comply with PostgreSQL security best practices

-- 1. Update the update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 2. Update the generate_share_code function
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- 3. Update the increment_share_view_count function
CREATE OR REPLACE FUNCTION increment_share_view_count(share_code_param TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE shared_maps
  SET view_count = view_count + 1
  WHERE share_code = share_code_param AND is_active = true
  RETURNING view_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

-- 4. Update the cleanup_inactive_shares function
CREATE OR REPLACE FUNCTION cleanup_inactive_shares()
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;
