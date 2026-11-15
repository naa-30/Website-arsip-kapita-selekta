-- ====================================================================
-- SKEMA BASIS DATA SUPABASE (PostgreSQL + RLS)
-- Arsip Materi Tambahan SDN 5 Way Galih
-- ====================================================================

-- 1. Tabel Profil Pengguna (Terhubung ke auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  login_id text unique not null,                -- 'guru4', 'siswa001', NIP, atau NISN
  full_name text not null,                      -- 'Guru Kelas 4', 'Siswa Kelas 4'
  role text not null check (role in ('guru', 'siswa', 'admin')),
  grade smallint check (grade between 1 and 6), -- Kelas binaan / kelas siswa
  email text,
  created_at timestamptz default now()
);

-- Aktifkan Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy RLS Profiles
create policy "Profil dapat dibaca oleh pengguna login" 
  on public.profiles for select 
  using (auth.role() = 'authenticated');

create policy "Pengguna hanya dapat mengubah profil sendiri" 
  on public.profiles for update 
  using (auth.uid() = id);

-- 2. Tabel Materi Tambahan (modules)
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  subject text not null,                        -- 'Matematika', 'IPAS', 'Bahasa Indonesia', dll
  grade smallint not null check (grade between 1 and 6),
  kind text not null check (kind in ('pdf', 'ppt', 'canvas')),
  description text,
  file_path text,                               -- path berkas di Supabase Storage
  canvas_url text,                              -- terisi jika kind = 'canvas'
  page_count int default 1,
  allow_download boolean not null default true, -- Saklar izin unduh
  status text not null default 'draf' check (status in ('draf', 'terbit')),
  published_at timestamptz,
  created_at timestamptz default now()
);

-- Index pencarian cepat
create index if not exists idx_modules_grade_status on public.modules (grade, status);
create index if not exists idx_modules_subject on public.modules (subject);

-- Aktifkan RLS
alter table public.modules enable row level security;

-- Policy RLS Modules:
-- Siswa & Guru dapat membaca materi yang status = 'terbit'
create policy "Materi terbit dapat dibaca oleh publik atau user login"
  on public.modules for select
  using (status = 'terbit' or auth.uid() = owner_id);

-- Guru hanya dapat menambah, mengubah, atau menghapus materi miliknya sendiri
create policy "Guru dapat menambah materi"
  on public.modules for insert
  with check (auth.uid() = owner_id);

create policy "Guru dapat mengubah materi miliknya"
  on public.modules for update
  using (auth.uid() = owner_id);

create policy "Guru dapat menghapus materi miliknya"
  on public.modules for delete
  using (auth.uid() = owner_id);

-- 3. View Katalog Publik (tanpa file_path untuk keamanan)
create or replace view public.public_catalog as
  select 
    m.id,
    m.title,
    m.subject,
    m.grade,
    m.kind,
    m.description,
    m.page_count,
    m.allow_download,
    m.published_at,
    p.full_name as owner_name
  from public.modules m
  join public.profiles p on m.owner_id = p.id
  where m.status = 'terbit';

-- 4. Tabel Penilaian Bintang (ratings)
create table if not exists public.ratings (
  module_id uuid not null references public.modules(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz default now(),
  primary key (module_id, user_id)
);

alter table public.ratings enable row level security;

create policy "Pengguna dapat mengelola penilaian miliknya"
  on public.ratings for all
  using (auth.uid() = user_id);

-- 5. Tabel Riwayat Akses Siswa (access_log)
create table if not exists public.access_log (
  id bigint generated always as identity primary key,
  module_id uuid not null references public.modules(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('dibaca', 'diunduh')),
  created_at timestamptz default now()
);

alter table public.access_log enable row level security;

create policy "Siswa dapat mencatat dan melihat riwayat aksesnya"
  on public.access_log for all
  using (auth.uid() = user_id);
