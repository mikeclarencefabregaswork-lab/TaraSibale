-- The imported image URL no longer serves an image. Replace only that known
-- fixture value, preserving all other content and later administrator edits.
UPDATE resources
SET data = replace(data::text,
  'https://images.unsplash.com/photo-1548625361-1854c60f25e7?w=800&auto=format&fit=crop&q=80',
  '/assets/photo-unavailable.svg')::jsonb
WHERE data::text LIKE '%https://images.unsplash.com/photo-1548625361-1854c60f25e7?w=800&auto=format&fit=crop&q=80%';
