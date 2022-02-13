ALTER TABLE image
ADD COLUMN rarity text;
--;;
UPDATE image
set rarity = 'common';
--;;
ALTER TABLE image
ALTER COLUMN rarity SET NOT NULL;
