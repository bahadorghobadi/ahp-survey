-- Create participants table
create table if not exists public.participants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  org text,
  position text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create responses table
create table if not exists public.responses (
  id uuid default gen_random_uuid() primary key,
  participant_id uuid references public.participants(id) on delete cascade not null,
  section text not null,
  matrix jsonb not null,
  weights jsonb not null,
  cr numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.participants enable row level security;
alter table public.responses enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.participants
  for select using (true);

create policy "Enable insert access for all users" on public.participants
  for insert with check (true);

create policy "Enable read access for all users" on public.responses
  for select using (true);

create policy "Enable insert access for all users" on public.responses
  for insert with check (true);

-- Create indexes for better performance
create index if not exists idx_responses_participant_id on public.responses(participant_id);
create index if not exists idx_responses_section on public.responses(section);
create index if not exists idx_responses_created_at on public.responses(created_at);
create index if not exists idx_participants_created_at on public.participants(created_at);