-- Hetty Global Academy: database foundation
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement checks before creating.

-- ─────────────────────────────────────────────────────────────
-- Roles and team
-- ─────────────────────────────────────────────────────────────
do $$ begin
  create type public.app_role as enum ('owner', 'admin', 'assistant', 'editor', 'viewer');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.app_role not null default 'viewer',
  status text not null default 'invited' check (status in ('invited', 'active', 'disabled')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

-- Role of the signed-in user (null when signed out or disabled).
create or replace function public.my_role()
returns public.app_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and status <> 'disabled'
$$;

create or replace function public.has_role(variadic roles public.app_role[])
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.my_role() = any (roles), false)
$$;

-- New auth user → profile. The very first user becomes the owner;
-- everyone after that gets the role chosen when they were invited.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  invited_role public.app_role;
begin
  if not exists (select 1 from public.profiles where role = 'owner') then
    invited_role := 'owner';
  else
    invited_role := coalesce(nullif(new.raw_user_meta_data ->> 'role', '')::public.app_role, 'viewer');
    if invited_role = 'owner' then invited_role := 'admin'; end if;
  end if;
  insert into public.profiles (id, email, full_name, role, status)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), invited_role,
          case when new.email_confirmed_at is null then 'invited' else 'active' end)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Invited person accepts → mark them active.
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles set status = 'active' where id = new.id and status = 'invited';
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users
  for each row execute function public.handle_user_confirmed();

-- Never leave the academy without an owner.
create or replace function public.protect_owner()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if (tg_op = 'DELETE' and old.role = 'owner')
     or (tg_op = 'UPDATE' and old.role = 'owner' and (new.role <> 'owner' or new.status = 'disabled')) then
    if (select count(*) from public.profiles where role = 'owner' and status <> 'disabled' and id <> old.id) = 0 then
      raise exception 'The academy must always have an active owner. Transfer ownership first.';
    end if;
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists profiles_protect_owner on public.profiles;
create trigger profiles_protect_owner before update or delete on public.profiles
  for each row execute function public.protect_owner();

-- ─────────────────────────────────────────────────────────────
-- Settings, content, media, connections
-- ─────────────────────────────────────────────────────────────
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  url text not null,
  alt text not null check (length(trim(alt)) > 0),
  width int,
  height int,
  size_bytes int,
  focal_x numeric not null default 50 check (focal_x between 0 and 100),
  focal_y numeric not null default 50 check (focal_y between 0 and 100),
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.site_images (
  slot text primary key,
  media_id uuid references public.media (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Connection status is visible to owners and admins; tokens live in a separate table
-- that only the server (service role) can read.
create table if not exists public.integrations (
  provider text primary key check (provider in ('google_calendar', 'zoom', 'stripe', 'email')),
  status text not null default 'not_connected' check (status in ('not_connected', 'connected', 'error')),
  account_label text,
  connected_at timestamptz,
  connected_by uuid references auth.users (id)
);

create table if not exists public.integration_secrets (
  provider text primary key references public.integrations (provider) on delete cascade,
  secret_ciphertext text not null,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Business records
-- ─────────────────────────────────────────────────────────────
create table if not exists public.services (
  id text primary key,
  name text not null,
  programme text,
  price numeric(10, 2) not null check (price >= 0),
  duration_min int not null check (duration_min >= 15),
  summary text,
  active boolean not null default true,
  sort int not null default 0
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  phone text,
  country text,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  ref text primary key,
  client_id uuid references public.clients (id) on delete set null,
  service_id text references public.services (id),
  starts_at timestamptz not null,
  duration_min int not null,
  amount numeric(10, 2) not null default 0,
  status text not null default 'pending' check (status in ('held', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'failed')),
  meeting_url text,
  client_note text,
  private_note text,
  held_until timestamptz,
  created_at timestamptz not null default now()
);
-- One active booking per time slot: the database itself prevents double-booking.
create unique index if not exists bookings_one_per_slot on public.bookings (starts_at)
  where status in ('held', 'pending', 'confirmed');

create table if not exists public.payments (
  ref text primary key,
  booking_ref text,
  client_id uuid references public.clients (id) on delete set null,
  description text not null,
  amount numeric(10, 2) not null,
  currency text not null default 'CAD',
  status text not null check (status in ('pending', 'paid', 'refunded', 'failed')),
  method text,
  stripe_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  title text not null,
  category text not null,
  starts_at timestamptz not null,
  duration_min int not null,
  format text not null default 'Online',
  price numeric(10, 2) not null default 0,
  capacity int not null check (capacity > 0),
  summary text,
  description text,
  cover_media_id uuid references public.media (id) on delete set null,
  status text not null default 'published' check (status in ('draft', 'published', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  ref text primary key,
  event_id text references public.events (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  amount numeric(10, 2) not null default 0,
  status text not null default 'registered' check (status in ('registered', 'waitlist', 'cancelled', 'attended')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  name text primary key
);

create table if not exists public.articles (
  slug text primary key,
  title text not null,
  category text references public.categories (name) on update cascade,
  excerpt text,
  body text[] not null default '{}',
  author text not null default 'Hetty',
  cover_media_id uuid references public.media (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_on date,
  read_minutes int,
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  slug text primary key,
  title text not null,
  author text not null default 'Hetty',
  price numeric(10, 2) not null,
  formats text[] not null default '{}',
  description text,
  contents text[] not null default '{}',
  cover_media_id uuid references public.media (id) on delete set null,
  file_url text,
  status text not null default 'available' check (status in ('available', 'hidden'))
);

create table if not exists public.orders (
  ref text primary key,
  book_slug text references public.books (slug),
  format text,
  client_id uuid references public.clients (id) on delete set null,
  full_name text not null,
  email text not null,
  address text,
  amount numeric(10, 2) not null,
  status text not null default 'processing' check (status in ('processing', 'delivered', 'refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'PDF',
  link text,
  status text not null default 'coming_soon' check (status in ('coming_soon', 'available', 'hidden')),
  sort int not null default 0
);

create table if not exists public.subscribers (
  email text primary key,
  full_name text,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  ref text primary key default ('MSG-' || upper(substr(md5(random()::text), 1, 6))),
  full_name text not null,
  email text not null,
  subject text not null,
  body text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Activity log: who changed what
-- ─────────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text,
  created_at timestamptz not null default now()
);

create or replace function public.log_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.audit_log (actor, action, entity, entity_id)
  values (auth.uid(), lower(tg_op), tg_table_name,
          coalesce(rec ->> 'id', rec ->> 'ref', rec ->> 'slug', rec ->> 'key', rec ->> 'slot', rec ->> 'provider', rec ->> 'email'));
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','settings','site_content','media','site_images','integrations','services',
                           'bookings','payments','events','articles','books','resources'] loop
    execute format('drop trigger if exists %I_audit on public.%I', t, t);
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function public.log_change()', t, t);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Row level security: permissions enforced by the database
-- ─────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['profiles','settings','site_content','media','site_images','integrations','integration_secrets',
                           'services','clients','bookings','payments','events','registrations','categories','articles',
                           'books','orders','resources','subscribers','messages','audit_log'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Helper to (re)create a policy idempotently.
create or replace function pg_temp.policy(name text, tbl text, cmd text, using_expr text, check_expr text default null)
returns void language plpgsql as $$
begin
  execute format('drop policy if exists %I on public.%I', name, tbl);
  if cmd = 'insert' then
    execute format('create policy %I on public.%I for insert with check (%s)', name, tbl, coalesce(check_expr, using_expr));
  else
    execute format('create policy %I on public.%I for %s using (%s)%s', name, tbl, cmd, using_expr,
                   case when check_expr is null then '' else format(' with check (%s)', check_expr) end);
  end if;
end $$;

-- Team: everyone on the team can see the team; changes go through the server (see /api/team).
select pg_temp.policy('team can read team', 'profiles', 'select', 'public.my_role() is not null');
select pg_temp.policy('users update own name', 'profiles', 'update', 'id = auth.uid()', 'id = auth.uid() and role = public.my_role()');

-- Public website content: anyone can read; editors and above can change.
select pg_temp.policy('public read content', 'site_content', 'select', 'true');
select pg_temp.policy('editors write content', 'site_content', 'all', 'public.has_role(''owner'',''admin'',''editor'')', 'public.has_role(''owner'',''admin'',''editor'')');
select pg_temp.policy('public read media', 'media', 'select', 'true');
select pg_temp.policy('editors write media', 'media', 'all', 'public.has_role(''owner'',''admin'',''editor'')', 'public.has_role(''owner'',''admin'',''editor'')');
select pg_temp.policy('public read site images', 'site_images', 'select', 'true');
select pg_temp.policy('editors write site images', 'site_images', 'all', 'public.has_role(''owner'',''admin'',''editor'')', 'public.has_role(''owner'',''admin'',''editor'')');
select pg_temp.policy('public read services', 'services', 'select', 'active or public.my_role() is not null');
select pg_temp.policy('admins write services', 'services', 'all', 'public.has_role(''owner'',''admin'')', 'public.has_role(''owner'',''admin'')');
select pg_temp.policy('public read categories', 'categories', 'select', 'true');
select pg_temp.policy('editors write categories', 'categories', 'all', 'public.has_role(''owner'',''admin'',''editor'')', 'public.has_role(''owner'',''admin'',''editor'')');
select pg_temp.policy('public read published articles', 'articles', 'select', 'status = ''published'' or public.my_role() is not null');
select pg_temp.policy('editors write articles', 'articles', 'all', 'public.has_role(''owner'',''admin'',''editor'')', 'public.has_role(''owner'',''admin'',''editor'')');
select pg_temp.policy('public read books', 'books', 'select', 'status = ''available'' or public.my_role() is not null');
select pg_temp.policy('editors write books', 'books', 'all', 'public.has_role(''owner'',''admin'',''editor'')', 'public.has_role(''owner'',''admin'',''editor'')');
select pg_temp.policy('public read resources', 'resources', 'select', 'status <> ''hidden'' or public.my_role() is not null');
select pg_temp.policy('editors write resources', 'resources', 'all', 'public.has_role(''owner'',''admin'',''editor'')', 'public.has_role(''owner'',''admin'',''editor'')');
select pg_temp.policy('public read events', 'events', 'select', 'status = ''published'' or public.my_role() is not null');
select pg_temp.policy('staff write events', 'events', 'all', 'public.has_role(''owner'',''admin'',''assistant'')', 'public.has_role(''owner'',''admin'',''assistant'')');

-- Private business records.
select pg_temp.policy('staff read clients', 'clients', 'select', 'public.has_role(''owner'',''admin'',''assistant'',''viewer'')');
select pg_temp.policy('staff write clients', 'clients', 'all', 'public.has_role(''owner'',''admin'',''assistant'')', 'public.has_role(''owner'',''admin'',''assistant'')');
select pg_temp.policy('staff read bookings', 'bookings', 'select', 'public.has_role(''owner'',''admin'',''assistant'',''viewer'')');
select pg_temp.policy('staff write bookings', 'bookings', 'all', 'public.has_role(''owner'',''admin'',''assistant'')', 'public.has_role(''owner'',''admin'',''assistant'')');
select pg_temp.policy('staff read registrations', 'registrations', 'select', 'public.has_role(''owner'',''admin'',''assistant'',''viewer'')');
select pg_temp.policy('staff write registrations', 'registrations', 'all', 'public.has_role(''owner'',''admin'',''assistant'')', 'public.has_role(''owner'',''admin'',''assistant'')');
select pg_temp.policy('finance read payments', 'payments', 'select', 'public.has_role(''owner'',''admin'')');
select pg_temp.policy('finance read orders', 'orders', 'select', 'public.has_role(''owner'',''admin'')');
select pg_temp.policy('admins read settings', 'settings', 'select', 'public.has_role(''owner'',''admin'')');
select pg_temp.policy('admins write settings', 'settings', 'all', 'public.has_role(''owner'',''admin'')', 'public.has_role(''owner'',''admin'')');
select pg_temp.policy('admins read integrations', 'integrations', 'select', 'public.has_role(''owner'',''admin'')');
select pg_temp.policy('owner read audit log', 'audit_log', 'select', 'public.has_role(''owner'',''admin'')');

-- Visitors may only add a message or subscribe; everything else they submit goes through the server.
select pg_temp.policy('anyone can send a message', 'messages', 'insert', 'true', 'status = ''new''');
select pg_temp.policy('staff read messages', 'messages', 'select', 'public.has_role(''owner'',''admin'',''assistant'')');
select pg_temp.policy('staff update messages', 'messages', 'update', 'public.has_role(''owner'',''admin'',''assistant'')', 'public.has_role(''owner'',''admin'',''assistant'')');
select pg_temp.policy('staff delete messages', 'messages', 'delete', 'public.has_role(''owner'',''admin'')');
select pg_temp.policy('anyone can subscribe', 'subscribers', 'insert', 'true', 'true');
select pg_temp.policy('staff read subscribers', 'subscribers', 'select', 'public.has_role(''owner'',''admin'',''editor'')');
select pg_temp.policy('admins remove subscribers', 'subscribers', 'delete', 'public.has_role(''owner'',''admin'')');
-- integration_secrets: no policies on purpose. Only the server (service role) can read or write it.

-- ─────────────────────────────────────────────────────────────
-- File storage for photos (public read, editors upload)
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read media files" on storage.objects;
create policy "public read media files" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "editors upload media files" on storage.objects;
create policy "editors upload media files" on storage.objects for insert
  with check (bucket_id = 'media' and public.has_role('owner', 'admin', 'editor'));
drop policy if exists "editors change media files" on storage.objects;
create policy "editors change media files" on storage.objects for update
  using (bucket_id = 'media' and public.has_role('owner', 'admin', 'editor'));
drop policy if exists "editors delete media files" on storage.objects;
create policy "editors delete media files" on storage.objects for delete
  using (bucket_id = 'media' and public.has_role('owner', 'admin', 'editor'));

-- ─────────────────────────────────────────────────────────────
-- Starting data
-- ─────────────────────────────────────────────────────────────
insert into public.integrations (provider) values ('google_calendar'), ('zoom'), ('stripe'), ('email')
on conflict (provider) do nothing;

insert into public.services (id, name, programme, price, duration_min, summary, sort) values
  ('nclex', 'NCLEX consultation', 'nursing-education', 75, 45, 'Readiness review, a personal study plan and exam strategy.', 1),
  ('career', 'Nursing career consultation', 'mentorship', 85, 45, 'Your next career step, registration routes and a clear plan.', 2),
  ('english', 'English language consultation', 'english-language', 65, 45, 'CELPIP readiness, speaking and writing feedback.', 3),
  ('mentorship', 'General mentorship', 'mentorship', 90, 60, 'An open hour with Hetty on whatever matters most to you now.', 4)
on conflict (id) do nothing;

insert into public.categories (name) values ('NCLEX'), ('Careers'), ('English'), ('Mentorship')
on conflict (name) do nothing;

insert into public.settings (key, value) values
  ('business', '{"name":"Hetty Global Academy","currency":"CAD","timezone":"America/Toronto","confirmed":false}'),
  ('availability', '{"days":[1,2,3,4,5],"start":"09:00","end":"17:00","slotMinutes":90,"minNoticeHours":24,"maxAdvanceDays":60}')
on conflict (key) do nothing;
