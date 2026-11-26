-- Run once in your Supabase project's SQL Editor.
-- Creates only the new planner table, policies, and version trigger.
begin;
create table public.planner_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('task','review')),
  day date not null,
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 250000),
  is_deleted boolean not null default false,
  version bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint review_starts_monday check (kind <> 'review' or extract(isodow from day) = 1)
);
create index planner_owner_day on public.planner_entries(user_id, day);
create unique index planner_one_review_per_week on public.planner_entries(user_id, day) where kind = 'review';
alter table public.planner_entries enable row level security;
revoke all on public.planner_entries from anon, authenticated;
grant select, insert, update on public.planner_entries to authenticated;
create policy planner_read_own on public.planner_entries for select to authenticated
  using ((select auth.uid()) = user_id);
create policy planner_insert_own on public.planner_entries for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy planner_update_own on public.planner_entries for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create function public.planner_stamp_version() returns trigger
language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'UPDATE' then
    if NEW.user_id <> OLD.user_id or NEW.id <> OLD.id or NEW.kind <> OLD.kind then
      raise exception 'Entry identity cannot be changed';
    end if;
    NEW.version := OLD.version + 1;
  else
    NEW.version := 1;
  end if;
  NEW.updated_at := now();
  return NEW;
end;
$$;
create trigger planner_stamp_before_write before insert or update on public.planner_entries
for each row execute function public.planner_stamp_version();
commit;
