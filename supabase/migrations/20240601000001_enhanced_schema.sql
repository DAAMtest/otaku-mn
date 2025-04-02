-- Enhanced schema for anime streaming app

-- Create genres table
create table if not exists public.genres (
  id uuid not null default gen_random_uuid(),
  name text not null,
  description text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint genres_pkey primary key (id),
  constraint genres_name_key unique (name)
) TABLESPACE pg_default;

-- Create anime table with enhanced fields
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
  episode_count integer null default 0,
  is_featured boolean null default false,
  average_duration text null,
  constraint anime_pkey primary key (id)
) TABLESPACE pg_default;

-- Create anime_genres junction table
create table if not exists public.anime_genres (
  id uuid not null default gen_random_uuid(),
  anime_id uuid not null,
  genre_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint anime_genres_pkey primary key (id),
  constraint anime_genres_anime_id_genre_id_key unique (anime_id, genre_id),
  constraint anime_genres_anime_id_fkey foreign key (anime_id) references public.anime(id) on delete cascade,
  constraint anime_genres_genre_id_fkey foreign key (genre_id) references public.genres(id) on delete cascade
) TABLESPACE pg_default;

-- Create anime_relations table for related anime
create table if not exists public.anime_relations (
  id uuid not null default gen_random_uuid(),
  anime_id uuid not null,
  related_anime_id uuid not null,
  relation_type text not null,
  created_at timestamp with time zone null default now(),
  constraint anime_relations_pkey primary key (id),
  constraint anime_relations_anime_related_key unique (anime_id, related_anime_id),
  constraint anime_relations_anime_id_fkey foreign key (anime_id) references public.anime(id) on delete cascade,
  constraint anime_relations_related_anime_id_fkey foreign key (related_anime_id) references public.anime(id) on delete cascade
) TABLESPACE pg_default;

-- Create episodes table with enhanced fields
create table if not exists public.episodes (
  id uuid not null default gen_random_uuid(),
  anime_id uuid not null,
  title text not null,
  description text null,
  thumbnail_url text null,
  video_url text not null,
  duration text null,
  episode_number integer not null,
  season_number integer null default 1,
  air_date date null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint episodes_pkey primary key (id),
  constraint episodes_anime_id_episode_number_key unique (anime_id, episode_number),
  constraint episodes_anime_id_fkey foreign key (anime_id) references public.anime(id) on delete cascade
) TABLESPACE pg_default;

-- Create users table with enhanced fields
create table if not exists public.users (
  id uuid not null,
  username text not null,
  email text null,
  avatar_url text null,
  bio text null,
  nickname text null,
  preferences jsonb null default '{}'::jsonb,
  last_active timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username),
  constraint users_id_fkey foreign key (id) references auth.users (id) on delete cascade,
  constraint nickname_format check ((nickname ~ '^[a-zA-Z0-9\s_-]+$'::text)),
  constraint nickname_length check ((char_length(nickname) >= 1) and (char_length(nickname) <= 50))
) TABLESPACE pg_default;

-- Create user_anime_lists table with enhanced fields
create table if not exists public.user_anime_lists (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  anime_id uuid not null,
  list_type text not null,
  progress integer null default 0,
  score numeric(3, 1) null,
  notes text null,
  added_date timestamp with time zone null default now(),
  last_updated timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  constraint user_anime_lists_pkey primary key (id),
  constraint user_anime_lists_user_id_anime_id_list_type_key unique (user_id, anime_id, list_type),
  constraint user_anime_lists_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade,
  constraint user_anime_lists_anime_id_fkey foreign key (anime_id) references public.anime(id) on delete cascade,
  constraint user_anime_lists_list_type_check check (list_type in ('watchlist', 'favorites', 'completed', 'watching', 'on_hold', 'dropped'))
) TABLESPACE pg_default;

-- Create watch_history table with enhanced fields
create table if not exists public.watch_history (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  anime_id uuid not null,
  episode_id uuid not null,
  watched_at timestamp with time zone null default now(),
  progress_seconds integer null default 0,
  completed boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint watch_history_pkey primary key (id),
  constraint watch_history_user_id_episode_id_key unique (user_id, episode_id),
  constraint watch_history_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade,
  constraint watch_history_anime_id_fkey foreign key (anime_id) references public.anime(id) on delete cascade,
  constraint watch_history_episode_id_fkey foreign key (episode_id) references public.episodes(id) on delete cascade
) TABLESPACE pg_default;

-- Create downloads table for offline viewing
create table if not exists public.downloads (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  episode_id uuid not null,
  anime_id uuid not null,
  download_path text null,
  download_size_bytes bigint null,
  download_date timestamp with time zone null default now(),
  expires_at timestamp with time zone null,
  is_expired boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint downloads_pkey primary key (id),
  constraint downloads_user_id_episode_id_key unique (user_id, episode_id),
  constraint downloads_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade,
  constraint downloads_episode_id_fkey foreign key (episode_id) references public.episodes(id) on delete cascade,
  constraint downloads_anime_id_fkey foreign key (anime_id) references public.anime(id) on delete cascade
) TABLESPACE pg_default;

-- Create user_notifications table
create table if not exists public.user_notifications (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  message text not null,
  type text null,
  related_id uuid null,
  is_read boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint user_notifications_pkey primary key (id),
  constraint user_notifications_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade
) TABLESPACE pg_default;

-- Create indexes for better performance
create index if not exists anime_title_idx on public.anime using btree (title);
create index if not exists anime_rating_idx on public.anime using btree (rating);
create index if not exists anime_popularity_idx on public.anime using btree (popularity);
create index if not exists anime_release_year_idx on public.anime using btree (release_year);
create index if not exists anime_is_featured_idx on public.anime using btree (is_featured);

create index if not exists anime_genres_anime_id_idx on public.anime_genres using btree (anime_id);
create index if not exists anime_genres_genre_id_idx on public.anime_genres using btree (genre_id);

create index if not exists anime_relations_anime_id_idx on public.anime_relations using btree (anime_id);
create index if not exists anime_relations_related_anime_id_idx on public.anime_relations using btree (related_anime_id);

create index if not exists episodes_anime_id_idx on public.episodes using btree (anime_id);
create index if not exists episodes_episode_number_idx on public.episodes using btree (episode_number);

create index if not exists user_anime_lists_user_id_idx on public.user_anime_lists using btree (user_id);
create index if not exists user_anime_lists_anime_id_idx on public.user_anime_lists using btree (anime_id);
create index if not exists user_anime_lists_list_type_idx on public.user_anime_lists using btree (list_type);

create index if not exists watch_history_user_id_idx on public.watch_history using btree (user_id);
create index if not exists watch_history_anime_id_idx on public.watch_history using btree (anime_id);
create index if not exists watch_history_episode_id_idx on public.watch_history using btree (episode_id);
create index if not exists watch_history_watched_at_idx on public.watch_history using btree (watched_at);

create index if not exists downloads_user_id_idx on public.downloads using btree (user_id);
create index if not exists downloads_episode_id_idx on public.downloads using btree (episode_id);
create index if not exists downloads_anime_id_idx on public.downloads using btree (anime_id);
create index if not exists downloads_is_expired_idx on public.downloads using btree (is_expired);

create index if not exists user_notifications_user_id_idx on public.user_notifications using btree (user_id);
create index if not exists user_notifications_is_read_idx on public.user_notifications using btree (is_read);

-- Enable realtime for all tables
alter publication supabase_realtime add table anime;
alter publication supabase_realtime add table anime_genres;
alter publication supabase_realtime add table anime_relations;
alter publication supabase_realtime add table episodes;
alter publication supabase_realtime add table genres;
alter publication supabase_realtime add table user_anime_lists;
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table watch_history;
alter publication supabase_realtime add table downloads;
alter publication supabase_realtime add table user_notifications;
