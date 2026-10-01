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

drop policy if exists "Users can view their own bookings" on public.bookings;
create policy "Users can view their own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own bookings" on public.bookings;
create policy "Users can insert their own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own bookings" on public.bookings;
create policy "Users can delete their own bookings"
  on public.bookings for delete
  using (auth.uid() = user_id);

grant select, insert, delete on public.bookings to authenticated;

-- One row per individual seat on a booking, with a unique constraint on
-- (movie_title, show_date, show_time, seat). This is what actually prevents
-- double-booking: two concurrent bookings for the same seat race to insert
-- here, and the loser gets a unique-violation instead of silently
-- succeeding. The old `taken_seats` view (a plain select over `bookings`,
-- with no constraint behind it) could never do this - it only reflected
-- whatever had already been written, after the fact.
create table if not exists public.booked_seats (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  movie_title text not null,
  show_date text not null,
  show_time text not null,
  seat text not null,
  unique (movie_title, show_date, show_time, seat)
);

alter table public.booked_seats enable row level security;

-- Same rationale as the old taken_seats view: anyone (including guests
-- browsing seat selection) can read which seats are taken for a showing.
-- Only non-sensitive columns live here, so an open read is fine.
drop policy if exists "Anyone can view booked seats" on public.booked_seats;
create policy "Anyone can view booked seats"
  on public.booked_seats for select
  using (true);

grant select on public.booked_seats to anon, authenticated;

-- One-off backfill: populate booked_seats from any bookings that were
-- written before this table existed. Safe to re-run (ON CONFLICT DO
-- NOTHING), and a no-op on a fresh project with no existing bookings.
insert into public.booked_seats (booking_id, movie_title, show_date, show_time, seat)
select b.id, b.movie_title, b.show_date, b.show_time, trim(seat)
from public.bookings b, unnest(string_to_array(b.seats, ',')) as seat
on conflict (movie_title, show_date, show_time, seat) do nothing;

-- Books a set of seats atomically: inserts the booking row and one
-- booked_seats row per seat in a single transaction. If any seat is already
-- taken, the unique constraint on booked_seats raises and the whole
-- transaction (including the bookings insert) rolls back - so a booking
-- can never be half-created, and two users racing for the same seat can
-- never both win.
create or replace function public.book_seats(
  p_movie_title text,
  p_show_date text,
  p_show_time text,
  p_seats text[],
  p_total text,
  p_reference text
) returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
  v_seat text;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in to book.';
  end if;

  if p_seats is null or array_length(p_seats, 1) is null then
    raise exception 'Select at least one seat.';
  end if;

  insert into public.bookings (user_id, reference, movie_title, show_date, show_time, seats, total)
  values (auth.uid(), p_reference, p_movie_title, p_show_date, p_show_time, array_to_string(p_seats, ', '), p_total)
  returning * into v_booking;

  foreach v_seat in array p_seats loop
    insert into public.booked_seats (booking_id, movie_title, show_date, show_time, seat)
    values (v_booking.id, p_movie_title, p_show_date, p_show_time, v_seat);
  end loop;

  return v_booking;
end;
$$;

grant execute on function public.book_seats(text, text, text, text[], text, text) to authenticated;

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

drop policy if exists "Users can view their own favourites" on public.favourites;
create policy "Users can view their own favourites"
  on public.favourites for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own favourites" on public.favourites;
create policy "Users can insert their own favourites"
  on public.favourites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own favourites" on public.favourites;
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
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
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
