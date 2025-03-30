create table public.genres (
  id uuid not null default gen_random_uuid (),
  name text not null,
  created_at timestamp with time zone null default now(),
  constraint genres_pkey primary key (id),
  constraint genres_name_key unique (name)
) TABLESPACE pg_default;