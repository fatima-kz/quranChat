-- Qur'an Chat — Supabase schema (run in the Supabase SQL editor)
-- Assumes auth.users is provided by Supabase Auth.

create extension if not exists "pgcrypto";

-- ============ profiles (mirrors auth.users + onboarding) ============
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  age         integer,
  gender      text check (gender in ('male','female','other','unspecified')),
  avatar_url  text,
  goal        text,
  topics      text[] default '{}',
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_upsert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ conversations ============
create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'New conversation',
  created_at  timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "conv_owner_all" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ messages ============
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null check (role in ('user','assistant','system')),
  content         text not null,
  citation        jsonb,
  created_at      timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "msg_owner_all" on public.messages
  for all using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

-- ============ bookmarks ============
create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  message_id  uuid not null references public.messages(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, message_id)
);

alter table public.bookmarks enable row level security;

create policy "bookmark_owner_all" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ storage: avatars bucket ============
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies: users can manage their own avatar folder
create policy "avatar_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatar_insert" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatar_update" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatar_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
