-- RunClubs.in — Sprint 1: richer, honest verification metadata.
-- Adds when and how each club was confirmed with its organizers so the
-- verified badge can carry a date and decay into a "recheck due" state.

create type verification_method as enum (
  'organizer-dm', 'whatsapp', 'instagram', 'website', 'in-person', 'phone', 'email'
);

alter table clubs
  add column if not exists verified_at timestamptz,
  add column if not exists verification_method verification_method,
  add column if not exists verification_source text;

-- Existing verified rows with no date are treated as "verified, date unknown".
-- Backfill to their last_updated so the freshness clock has a sensible start.
update clubs
  set verified_at = last_updated
  where verified = true and verified_at is null;

create index if not exists clubs_verified_at_idx on clubs (verified_at);
