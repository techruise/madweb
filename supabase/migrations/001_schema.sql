-- Re-runnable schema. Apply in numeric order using the Supabase SQL editor or CLI.
begin;
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('admin','editor')), created_at timestamptz not null default now()
);
create table if not exists public.properties (
 id uuid primary key default gen_random_uuid(), title text not null check(char_length(title) between 3 and 160),
 slug text unique not null check(slug ~ '^[a-z0-9-]{1,100}$'), description text not null default '',
 area text not null check(area in ('Johar Town','Wapda Town','Valencia','DHA','Ittehad Town','Bahria Town')),
 type text not null check(type in ('sale','purchase','construction')), price numeric(16,2) check(price>=0),
 size numeric(10,2) check(size>0), size_unit text not null default 'marla' check(size_unit in ('marla','kanal')),
 bedrooms integer check(bedrooms between 0 and 100), bathrooms integer check(bathrooms between 0 and 100),
 status text not null default 'for sale' check(status in ('for sale','sold')), featured boolean not null default false,
 published boolean not null default false, is_sample boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(), title text not null check(char_length(title) between 3 and 160),
 slug text unique not null check(slug ~ '^[a-z0-9-]{1,100}$'), description text not null default '',
 area text not null check(area in ('Johar Town','Wapda Town','Valencia','DHA','Ittehad Town','Bahria Town')),
 scope text not null check(scope in ('grey structure','finishing')), year integer check(year between 1900 and 2100),
 status text not null default 'ongoing' check(status in ('ongoing','completed')), featured boolean not null default false,
 published boolean not null default false, is_sample boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.property_images (
 id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade,
 storage_path text not null unique check(storage_path ~ '^[a-f0-9-]+/[a-f0-9-]+\.(jpg|png|webp)$'),
 alt text not null check(char_length(alt) between 3 and 200), sort_order integer not null default 0 check(sort_order>=0)
);
create table if not exists public.project_images (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
 storage_path text not null unique check(storage_path ~ '^[a-f0-9-]+/[a-f0-9-]+\.(jpg|png|webp)$'),
 alt text not null check(char_length(alt) between 3 and 200), sort_order integer not null default 0 check(sort_order>=0),
 stage text not null default 'after' check(stage in ('before','after'))
);
create table if not exists public.testimonials (
 id uuid primary key default gen_random_uuid(), name text not null check(char_length(name) between 2 and 80),
 text text not null check(char_length(text) between 10 and 2000), rating integer not null check(rating between 1 and 5),
 approved boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.inquiries (
 id uuid primary key default gen_random_uuid(), name text not null check(char_length(name) between 2 and 80),
 phone text not null check(phone ~ '^\+923[0-9]{9}$'), email text,
 service text not null check(service in ('sale','purchase','construction')),
 area text not null check(area in ('Johar Town','Wapda Town','Valencia','DHA','Ittehad Town','Bahria Town')),
 message text not null check(char_length(message) between 10 and 2000), source_page text not null default '/',
 status text not null default 'new' check(status in ('new','contacted','closed')), notes text not null default '',
 consent_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create table if not exists public.faqs (
 id uuid primary key default gen_random_uuid(), question text not null check(char_length(question) between 5 and 200),
 answer text not null check(char_length(answer) between 10 and 3000), published boolean not null default false,
 sort_order integer not null default 0, created_at timestamptz not null default now()
);
-- No raw IP addresses; service-only rolling-window counters, cleaned on each request.
create table if not exists public.inquiry_rate_limits (key_hash text primary key, window_start timestamptz not null, hits integer not null);
create index if not exists properties_area_idx on public.properties(area);
create index if not exists properties_status_idx on public.properties(status);
create index if not exists properties_created_idx on public.properties(created_at desc);
create index if not exists projects_area_idx on public.projects(area);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_created_idx on public.projects(created_at desc);
create index if not exists property_images_parent_idx on public.property_images(property_id,sort_order);
create index if not exists project_images_parent_idx on public.project_images(project_id,sort_order);
create index if not exists inquiries_status_created_idx on public.inquiries(status,created_at desc);
create index if not exists inquiries_created_idx on public.inquiries(created_at desc);
create index if not exists testimonials_created_idx on public.testimonials(created_at desc);
create index if not exists rate_window_idx on public.inquiry_rate_limits(window_start);
-- Unique slug constraints already create indexed slugs.
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end$$;
drop trigger if exists properties_updated on public.properties;
create trigger properties_updated before update on public.properties for each row execute function public.touch_updated_at();
drop trigger if exists projects_updated on public.projects;
create trigger projects_updated before update on public.projects for each row execute function public.touch_updated_at();
commit;
