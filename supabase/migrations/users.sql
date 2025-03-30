create table public.users (
  id uuid not null,
  username text not null,
  avatar_url text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  bio text null,
  nickname text null,
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint nickname_format check ((nickname ~ '^[a-zA-Z0-9\s_-]+$'::text)),
  constraint nickname_length check (
    (
      (char_length(nickname) >= 1)
      and (char_length(nickname) <= 50)
    )
  )
) TABLESPACE pg_default;