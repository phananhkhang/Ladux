UPDATE reviews SET rating = GREATEST(LEAST(rating, 5), 1);

ALTER TABLE reviews 
ADD CONSTRAINT chk_reviews_rating 
CHECK (rating BETWEEN 1 AND 5);