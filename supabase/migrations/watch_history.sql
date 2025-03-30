create table public.watch_history (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  anime_id uuid not null,
  watched_at timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  constraint watch_history_pkey primary key (id),
  constraint watch_history_anime_id_fkey foreign KEY (anime_id) references anime (id) on delete CASCADE
) TABLESPACE pg_default;