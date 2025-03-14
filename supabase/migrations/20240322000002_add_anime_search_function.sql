-- Create a function to search anime with various filters
CREATE OR REPLACE FUNCTION search_anime(
  search_query TEXT DEFAULT NULL,
  genre_filter TEXT[] DEFAULT NULL,
  min_rating NUMERIC DEFAULT NULL,
  sort_by TEXT DEFAULT 'rating',
  sort_direction TEXT DEFAULT 'desc',
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 10
) 
RETURNS TABLE (
  id UUID,
  title TEXT,
  image_url TEXT,
  rating NUMERIC,
  description TEXT,
  release_date DATE,
  genres TEXT[]
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH anime_with_genres AS (
    SELECT 
      a.id,
      a.title,
      a.image_url,
      a.rating,
      a.description,
      a.release_date,
      array_agg(g.name) AS genres
    FROM 
      anime a
    LEFT JOIN 
      anime_genres ag ON a.id = ag.anime_id
    LEFT JOIN 
      genres g ON ag.genre_id = g.id
    WHERE 
      (search_query IS NULL OR a.title ILIKE '%' || search_query || '%') AND
      (min_rating IS NULL OR a.rating >= min_rating)
    GROUP BY 
      a.id, a.title, a.image_url, a.rating, a.description, a.release_date
  )
  SELECT 
    awg.id,
    awg.title,
    awg.image_url,
    awg.rating,
    awg.description,
    awg.release_date,
    awg.genres
  FROM 
    anime_with_genres awg
  WHERE
    (genre_filter IS NULL OR awg.genres && genre_filter)
  ORDER BY
    CASE 
      WHEN sort_by = 'title' AND sort_direction = 'asc' THEN awg.title
    END ASC,
    CASE 
      WHEN sort_by = 'title' AND sort_direction = 'desc' THEN awg.title
    END DESC,
    CASE 
      WHEN sort_by = 'rating' AND sort_direction = 'asc' THEN awg.rating
    END ASC,
    CASE 
      WHEN sort_by = 'rating' AND sort_direction = 'desc' OR sort_by IS NULL THEN awg.rating
    END DESC,
    CASE 
      WHEN sort_by = 'release_date' AND sort_direction = 'asc' THEN awg.release_date
    END ASC,
    CASE 
      WHEN sort_by = 'release_date' AND sort_direction = 'desc' THEN awg.release_date
    END DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
  
END;
$$;
