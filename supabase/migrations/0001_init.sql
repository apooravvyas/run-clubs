-- RunClubs.in — initial schema
create extension if not exists "uuid-ossp";

create type pace_band as enum ('easy', 'moderate', 'fast', 'all');
create type club_status as enum ('live', 'pending', 'archived');
create type review_status as enum ('pending', 'approved', 'rejected');

create table clubs (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  city text not null,
  area text not null,
  lat double precision not null,
  lng double precision not null,
  gmaps_url text not null default '',
  meeting_point text not null,
  days text[] not null default '{}',
  time_local text not null,
  avg_attendance int not null default 0,
  pace_band pace_band not null default 'all',
  pace_detail text default '',
  distance_min_km numeric default 5,
  distance_max_km numeric default 10,
  beginner_friendly boolean not null default true,
  women_friendly boolean not null default true,
  competitive boolean not null default false,
  social boolean not null default true,
  coffee_after boolean not null default false,
  is_free boolean not null default true,
  fee_detail text,
  instagram text,
  strava text,
  whatsapp text,
  website text,
  organizer_name text,
  organizer_contact text,
  photo text not null default '',
  description text not null default '',
  how_to_join text not null default '',
  verified boolean not null default false,
  status club_status not null default 'live',
  submitted_by_email text,
  last_updated timestamptz not null default now()
);

create index clubs_city_idx on clubs (city);
create index clubs_status_idx on clubs (status);

create table submissions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text not null,
  area text not null,
  meeting_point text not null,
  days text[] not null default '{}',
  time_local text not null,
  pace_band pace_band not null default 'all',
  beginner_friendly boolean not null default true,
  is_free boolean not null default true,
  instagram text,
  whatsapp text,
  description text not null,
  how_to_join text not null,
  submitter_email text not null,
  status review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table edit_suggestions (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid references clubs (id) on delete cascade,
  field text not null,
  suggested_value text not null,
  note text,
  email text,
  status review_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- Row-level security: public reads live clubs; writes go through the service role.
alter table clubs enable row level security;
alter table submissions enable row level security;
alter table edit_suggestions enable row level security;

create policy "public read live clubs"
  on clubs for select
  using (status = 'live');
