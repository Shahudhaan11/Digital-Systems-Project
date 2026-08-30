-- Seatflick schema: bookings + favourites, scoped per user via RLS.
-- Run this once in the Supabase Dashboard -> SQL Editor.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null,
  movie_title text not null,
  show_date text not null,
  show_time text not null,
  seats text not null,
  total text not null,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "Users can view their own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own bookings"
  on public.bookings for delete
  using (auth.uid() = user_id);

grant select, insert, delete on public.bookings to authenticated;

-- Narrow, non-sensitive view so anyone (including guests browsing seat
-- selection) can check seat availability for a showing without seeing
-- other users' reference codes, totals, etc. Created with
-- security_invoker = false so it runs as the view owner and bypasses the
-- bookings table's RLS, which is the point: it's an intentional, narrow
-- public read of just the availability-relevant columns.
create or replace view public.taken_seats
  with (security_invoker = false) as
  select movie_title, show_date, show_time, seats
  from public.bookings;

grant select on public.taken_seats to anon, authenticated;

create table if not exists public.favourites (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null,
  title text not null,
  poster_path text,
  vote_average numeric,
  created_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

alter table public.favourites enable row level security;

create policy "Users can view their own favourites"
  on public.favourites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favourites"
  on public.favourites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favourites"
  on public.favourites for delete
  using (auth.uid() = user_id);

grant select, insert, delete on public.favourites to authenticated;

-- Profiles: enforces unique usernames. auth.users.raw_user_meta_data has no
-- uniqueness support, so a real username row + unique index is the only
-- reliable way to enforce this at the database level. A trigger inserts a
-- row here whenever a new auth user is created; if the username is already
-- taken, the insert (and therefore the whole signup) fails atomically.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null
);

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Usernames are meant to be shown/checked publicly (e.g. availability
-- checks before signup), so SELECT is open to everyone.
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

grant select on public.profiles to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
