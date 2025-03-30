create table public.anime_genres (
  id uuid not null default gen_random_uuid (),
  anime_id uuid not null,
  genre_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint anime_genres_pkey primary key (id),
  constraint anime_genres_anime_id_genre_id_key unique (anime_id, genre_id),
  constraint anime_genres_anime_id_fkey foreign KEY (anime_id) references anime (id) on delete CASCADE,
  constraint anime_genres_genre_id_fkey foreign KEY (genre_id) references genres (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists anime_genres_anime_id_idx on public.anime_genres using btree (anime_id) TABLESPACE pg_default;

create index IF not exists anime_genres_genre_id_idx on public.anime_genres using btree (genre_id) TABLESPACE pg_default;