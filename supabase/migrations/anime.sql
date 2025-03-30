create table public.anime (
  id uuid not null default gen_random_uuid (),
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

create index IF not exists anime_title_idx on public.anime using btree (title) TABLESPACE pg_default;

create index IF not exists anime_rating_idx on public.anime using btree (rating) TABLESPACE pg_default;

create index IF not exists anime_popularity_idx on public.anime using btree (popularity) TABLESPACE pg_default;