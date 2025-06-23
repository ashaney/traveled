-- Remove length_of_stay column from visits table as it's no longer used

ALTER TABLE visits DROP COLUMN IF EXISTS length_of_stay;