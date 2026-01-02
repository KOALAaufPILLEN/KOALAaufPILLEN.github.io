-- Secure User System & Anti-Cheat
-- 1. Profiles Table (Syncs with Google Auth)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS: Public Read, Self Update
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. Trigger: Sync Auth User to Profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Anti-Cheat & Identity Enforcement Trigger
create or replace function public.validate_score_submission()
returns trigger as $$
declare
  max_possible_score bigint;
  profile_name text;
begin
  -- Anti-Cheat: Score Cap Logic
  -- Allow 30k per level + 150k base buffer (for combos/bonuses)
  max_possible_score := (NEW.level * 30000) + 150000;

  if NEW.score > max_possible_score then
    raise exception 'Score rejected: Exceeds maximum possible for this level.';
  end if;

  -- Identity Enforcement: If Logged In, Force Google Name
  if auth.role() = 'authenticated' then
    -- Verify user_id matches token
    if NEW.user_id != auth.uid()::text then
       raise exception 'Security Violation: User ID mismatch.';
    end if;

    -- Force Player Name from Profile (Prevents spoofing)
    select full_name into profile_name from public.profiles where id = auth.uid();
    if profile_name is not null then
      NEW.player_name := profile_name;
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists check_score_submission on public.luvvies_crush_scores;
create trigger check_score_submission
  before insert on public.luvvies_crush_scores
  for each row execute procedure public.validate_score_submission();
