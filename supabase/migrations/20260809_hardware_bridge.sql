-- REFINT: sensor readings and frontend-to-laptop scan command queue.
create extension if not exists pgcrypto;

create table if not exists public.temperature_readings (
  id uuid primary key default gen_random_uuid(),
  refrigerator_id uuid not null references public.refrigerators(id) on delete cascade,
  temperature_c numeric(5, 2) not null,
  recorded_at timestamptz not null default now()
);

create index if not exists temperature_readings_fridge_recorded_idx
  on public.temperature_readings (refrigerator_id, recorded_at desc);

create table if not exists public.hardware_commands (
  id uuid primary key default gen_random_uuid(),
  refrigerator_id uuid not null references public.refrigerators(id) on delete cascade,
  command text not null check (command in ('scan')),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  requested_by uuid not null references auth.users(id) on delete cascade,
  scan_id uuid references public.scans(id) on delete set null,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists hardware_commands_pending_idx
  on public.hardware_commands (refrigerator_id, created_at)
  where status = 'pending';

alter table public.temperature_readings enable row level security;
alter table public.hardware_commands enable row level security;

drop policy if exists "owners read refrigerator temperatures" on public.temperature_readings;
create policy "owners read refrigerator temperatures"
on public.temperature_readings for select to authenticated
using (exists (
  select 1 from public.refrigerators r
  where r.id = refrigerator_id and r.owner_id = auth.uid()
));

drop policy if exists "owners read hardware commands" on public.hardware_commands;
create policy "owners read hardware commands"
on public.hardware_commands for select to authenticated
using (exists (
  select 1 from public.refrigerators r
  where r.id = refrigerator_id and r.owner_id = auth.uid()
));

drop policy if exists "owners request scans" on public.hardware_commands;
create policy "owners request scans"
on public.hardware_commands for insert to authenticated
with check (
  requested_by = auth.uid()
  and exists (
    select 1 from public.refrigerators r
    where r.id = refrigerator_id and r.owner_id = auth.uid()
  )
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'temperature_readings'
  ) then
    alter publication supabase_realtime add table public.temperature_readings;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'hardware_commands'
  ) then
    alter publication supabase_realtime add table public.hardware_commands;
  end if;
end $$;
