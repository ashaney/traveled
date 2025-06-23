-- Add separate star rating field for visit quality (distinct from visit type)
-- This allows users to rate how much they enjoyed visits of type 3+ (Day visit, Multi-day stay, Lived there)

ALTER TABLE visits 
ADD COLUMN star_rating INTEGER CHECK (star_rating >= 0 AND star_rating <= 5);

-- Add helpful comment
COMMENT ON COLUMN visits.star_rating IS 'Star rating (0-5) for how much the user enjoyed this visit - separate from visit type';
COMMENT ON COLUMN visits.rating IS 'Visit type: 0=Never been, 1=Passed through, 2=Brief stop, 3=Day visit, 4=Multi-day stay, 5=Lived there';