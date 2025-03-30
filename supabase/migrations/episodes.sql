create table public.episodes (
  id uuid not null,
  anime_id uuid null,
  title text null,
  description text null,
  thumbnail_url text null,
  video_url text null,
  duration text null,
  episode_number integer null,
  created_at timestamp with time zone null default now(),
  constraint episodes_pkey primary key (id),
  constraint episodes_anime_id_fkey foreign KEY (anime_id) references anime (id)
) TABLESPACE pg_default;