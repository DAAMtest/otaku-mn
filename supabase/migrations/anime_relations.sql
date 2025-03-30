create table public.anime_relations (
  id uuid not null default gen_random_uuid(),
  anime_id uuid null,
  related_anime_id uuid null,
  relation_type text null,
  created_at timestamp with time zone null default now(),
  constraint anime_relations_pkey primary key (id),
  constraint anime_relations_anime_id_fkey foreign KEY (anime_id) references anime (id),
  constraint anime_relations_related_anime_id_fkey foreign KEY (related_anime_id) references anime (id)
) TABLESPACE pg_default;