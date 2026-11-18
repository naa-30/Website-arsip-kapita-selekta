-- Demo migration for the browser-login version of this project.
-- Run this in Supabase SQL Editor after schema.sql.

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.modules
  add column if not exists owner_name text,
  add column if not exists file_name text,
  add column if not exists file_size text,
  add column if not exists canvas_url text,
  add column if not exists preview_content jsonb;

insert into public.profiles (id, login_id, full_name, role, grade, email)
values
  ('11111111-1111-1111-1111-111111111111', 'guru4', 'Guru Kelas 4', 'guru', 4, 'guru4@sdn5waygalih.sch.id'),
  ('22222222-2222-2222-2222-222222222222', 'siswa001', 'Siswa Kelas 4', 'siswa', 4, 'siswa001@sdn5waygalih.sch.id')
  on conflict (id) do update set
    login_id = excluded.login_id,
    full_name = excluded.full_name,
    role = excluded.role,
    grade = excluded.grade,
    email = excluded.email;

-- Demo mode policies: this allows the publishable key to read/write demo data.
-- Do not use these permissive policies for production or private data.
alter table public.profiles enable row level security;
drop policy if exists "Profil dapat dibaca oleh pengguna login" on public.profiles;
drop policy if exists "Pengguna hanya dapat mengubah profil sendiri" on public.profiles;
create policy "Demo profiles are public" on public.profiles for all using (true) with check (true);

alter table public.modules enable row level security;
drop policy if exists "Materi terbit dapat dibaca oleh publik atau user login" on public.modules;
drop policy if exists "Guru dapat menambah materi" on public.modules;
drop policy if exists "Guru dapat mengubah materi miliknya" on public.modules;
drop policy if exists "Guru dapat menghapus materi miliknya" on public.modules;
create policy "Demo modules are public" on public.modules for all using (true) with check (true);

alter table public.ratings enable row level security;
drop policy if exists "Pengguna dapat mengelola penilaian miliknya" on public.ratings;
create policy "Demo ratings are public" on public.ratings for all using (true) with check (true);

alter table public.access_log enable row level security;
drop policy if exists "Siswa dapat mencatat dan melihat riwayat akses" on public.access_log;
create policy "Demo access logs are public" on public.access_log for all using (true) with check (true);

create unique index if not exists access_log_user_module_unique
  on public.access_log (module_id, user_id);

insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do update set public = true;

drop policy if exists "Demo material files are public" on storage.objects;
create policy "Demo material files are public"
  on storage.objects for all
  using (bucket_id = 'materials')
  with check (bucket_id = 'materials');
