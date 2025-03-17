-- Create a function to get genre counts
create or replace function public.get_genre_counts()
returns table (
  genre_id uuid,
  count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select ag.genre_id, count(*)::bigint
    from public.anime_genres ag
    group by ag.genre_id;
end;
$$;
