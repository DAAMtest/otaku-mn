-- Create genres table
create table if not exists public.genres (
  id uuid not null default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone null default now(),
  constraint genres_pkey primary key (id),
  constraint genres_name_key unique (name)
) TABLESPACE pg_default;

-- Create anime table
create table if not exists public.anime (
  id uuid not null default gen_random_uuid(),
  title text not null,
  image_url text not null,
  rating numeric(3, 1) null,
  description text null,
  release_date date null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  alternative_titles text[] null default '{}'::text[],
  cover_image_url text null,
  release_year integer null,
  season text null,
  status text null,
  popularity integer null,
  constraint anime_pkey primary key (id)
) TABLESPACE pg_default;

-- Create anime_genres junction table
create table if not exists public.anime_genres (
  anime_id uuid not null,
  genre_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint anime_genres_pkey primary key (anime_id, genre_id),
  constraint anime_genres_anime_id_fkey foreign key (anime_id) references public.anime(id),
  constraint anime_genres_genre_id_fkey foreign key (genre_id) references public.genres(id)
) TABLESPACE pg_default;

-- Create indexes for better performance
create index if not exists anime_genres_anime_id_idx on public.anime_genres(anime_id);
create index if not exists anime_genres_genre_id_idx on public.anime_genres(genre_id);
create index if not exists anime_title_idx on public.anime(title);
create index if not exists anime_rating_idx on public.anime(rating);
create index if not exists anime_popularity_idx on public.anime(popularity);
