-- Make rating column nullable for replies
ALTER TABLE comments MODIFY COLUMN rating INT NULL;