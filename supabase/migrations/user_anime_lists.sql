create table public.user_anime_lists (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  anime_id uuid not null,
  list_type text not null,
  progress integer null,
  added_date timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_anime_lists_pkey primary key (id),
  constraint user_anime_lists_user_id_anime_id_list_type_key unique (user_id, anime_id, list_type),
  constraint user_anime_lists_anime_id_fkey foreign KEY (anime_id) references anime (id) on delete CASCADE
) TABLESPACE pg_default;