-- ====================================================================
-- SEED DATA SUPABASE
-- Arsip Materi Tambahan SDN 5 Way Galih
-- ====================================================================

-- Catatan: UUID profil mengacu pada auth.users. 
-- Buat akun di Supabase Auth lebih dulu, lalu masukkan data profil ini:

-- Contoh Profil Guru & Siswa
-- Akun demo: guru4 / siswa001 (sandi: demo1234)

insert into public.profiles (id, login_id, full_name, role, grade, email)
values
  ('11111111-1111-1111-1111-111111111111', 'guru4', 'Guru Kelas 4', 'guru', 4, 'guru4@sdn5waygalih.sch.id'),
  ('22222222-2222-2222-2222-222222222222', 'siswa001', 'Siswa Kelas 4', 'siswa', 4, 'siswa001@sdn5waygalih.sch.id')
on conflict (login_id) do nothing;

-- 6 Materi Tambahan Contoh
insert into public.modules (id, owner_id, title, subject, grade, kind, description, page_count, allow_download, status, published_at)
values
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Pecahan dan Penjumlahannya',
    'Matematika',
    4,
    'pdf',
    'Ringkasan materi pecahan biasa dan desimal disertai contoh soal bergambar dan cara penyelesaian praktis untuk siswa kelas 4.',
    14,
    true,
    'terbit',
    '2026-11-03 08:00:00+07'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Ekosistem di Sekitar Kita',
    'IPAS',
    5,
    'ppt',
    'Slide interaktif pengenalan rantai makanan, jaring-jaring makanan, dan interaksi biotik-abiotik di lingkungan sawah dan hutan Lampung.',
    22,
    false,
    'terbit',
    '2026-11-02 09:30:00+07'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Peta Konsep Siklus Air',
    'IPAS',
    5,
    'canvas',
    'Papan konsep visual Canva yang menjelaskan proses evaporasi, kondensasi, presipitasi, dan infiltrasi dalam siklus hidrologi bumi.',
    1,
    false,
    'terbit',
    '2026-10-30 11:15:00+07'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Teks Narasi Pendek',
    'Bahasa Indonesia',
    3,
    'pdf',
    'Kumpulan cerita fabel dan dongeng nusantara pendek beserta panduan menemukan ide pokok, latar, dan pesan moral.',
    10,
    true,
    'terbit',
    '2026-10-28 14:00:00+07'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'Lembar Kerja Perkalian',
    'Matematika',
    3,
    'pdf',
    'Latihan soal perkalian berulang 1 sampai 10 dengan pola tabel dan permainan teka-teki berhitung cepat.',
    8,
    true,
    'terbit',
    '2026-10-25 10:00:00+07'
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'Keberagaman Budaya Lampung',
    'Pendidikan Pancasila',
    6,
    'canvas',
    'Papan presentasi Canva tentang adat Saibatin dan Pepadun, rumah Nuwou Sesat, kain Tapis, dan semboyan Sang Bumi Ruwa Jurai.',
    1,
    false,
    'terbit',
    '2026-10-20 13:20:00+07'
  )
on conflict (id) do nothing;
