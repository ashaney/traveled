-- Add initial visit year and most recent visit year columns to visits table
-- This allows tracking both the first time someone visited and their most recent visit

ALTER TABLE visits 
ADD COLUMN initial_visit_year INTEGER CHECK (initial_visit_year >= 1900 AND initial_visit_year <= 2100),
ADD COLUMN most_recent_visit_year INTEGER CHECK (most_recent_visit_year >= 1900 AND most_recent_visit_year <= 2100);

-- Update existing records to use visit_year as both initial and most recent
UPDATE visits 
SET initial_visit_year = visit_year,
    most_recent_visit_year = visit_year
WHERE visit_year IS NOT NULL;

-- Add check constraint to ensure most_recent_visit_year >= initial_visit_year
ALTER TABLE visits 
ADD CONSTRAINT check_visit_years 
CHECK (most_recent_visit_year IS NULL OR initial_visit_year IS NULL OR most_recent_visit_year >= initial_visit_year);

-- Update the unique constraint to allow multiple visits to same region in different years
-- First drop the old constraint
ALTER TABLE visits DROP CONSTRAINT visits_user_id_region_id_visit_year_key;

-- Add new constraint that allows one visit record per user per region (but tracks multiple years)
ALTER TABLE visits ADD CONSTRAINT visits_user_region_unique UNIQUE(user_id, region_id);

-- Add index for better query performance on the new columns
CREATE INDEX idx_visits_initial_year ON visits(initial_visit_year);
CREATE INDEX idx_visits_recent_year ON visits(most_recent_visit_year);

-- Add helpful comment
COMMENT ON COLUMN visits.initial_visit_year IS 'Year of first visit to this region';
COMMENT ON COLUMN visits.most_recent_visit_year IS 'Year of most recent visit to this region';
COMMENT ON COLUMN visits.visit_year IS 'Legacy column - use initial_visit_year and most_recent_visit_year instead';