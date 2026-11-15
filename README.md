# Arsip Materi Tambahan SDN 5 Way Galih (Demo)

Website arsip digital materi pendukung dan materi tambahan (bukan buku paket utama) SDN 5 Way Galih, Kecamatan Tanjung Bintang, Lampung Selatan.

Dibangun dengan **Next.js (App Router)**, **Tailwind CSS**, **Lucide Icons**, dan font **Fraunces** + **Plus Jakarta Sans**.

---

## 🚀 Menjalankan Demo di Localhost

Server pengembangan Next.js sudah aktif di:
👉 **[http://localhost:3000](http://localhost:3000)**

Untuk menjalankan ulang jika server mati:
```bash
cd C:\Users\Acer\.gemini\antigravity\scratch\arsip-materi-sdn5
npm run dev
```

---

## 🔑 Akun Demo Resmi

| Peran | Login ID / NIS / NIP | Kata Sandi | Halaman Utama |
|---|---|---|---|
| **Guru** | `guru4` | `demo1234` | `/guru` (Dashboard Guru) |
| **Siswa** | `siswa001` | `demo1234` | `/` & `/materi/[id]` (Akses Siswa) |

> 💡 *Catatan:* Terdapat bilah bantuan **Mode Demo** di bagian paling atas layar untuk berpindah peran 1-klik (Guru / Siswa / Tamu) atau mereset data demo ke kondisi awal.

---

## 🎬 Panduan Uji Coba Alur Demo (5 Menit)

1. **Buka Beranda (`/`)**
   - Periksa Hero singkat dan kartu **Unggahan terbaru**.
   - Pada **Katalog Materi**, klik chip filter **Kelas 4**. Katalog akan menyaring materi kelas 4 (*Pecahan dan Penjumlahannya*).
   - Klik kartu materi (tombol *"🔒 Masuk untuk membuka"*). Anda akan diarahkan ke halaman login atau diberi pengingat akses.

2. **Masuk sebagai Guru (`/masuk?tab=guru`)**
   - Pilih tab **Guru**, masukkan `guru4` dan kata sandi `demo1234`.
   - Klik **Masuk sebagai Guru** → otomatis diarahkan ke **Dashboard Guru** (`/guru`).

3. **Unggah & Terbitkan Materi Baru di Dashboard Guru**
   - Lihat **Tabel Progres Unggahan** dan area **Seret berkas ke sini**.
   - Isi form detail materi:
     - Judul: *Soal Latihan Pecahan Senilai*
     - Deskripsi singkat: *Latihan mandiri mencari pecahan senilai.*
     - Mata pelajaran: *Matematika*
     - Kelas: *Kelas 4*
     - Jenis: *PDF* atau *PPT*
     - Saklar: **Boleh diunduh siswa** (bisa diaktifkan atau dimatikan)
   - Klik tombol biru **Terbitkan Materi**.
   - Materi baru langsung muncul di tabel **Materi Saya** dan tersinkronisasi ke Katalog publik.

4. **Keluar Akun Guru**
   - Klik tombol **Keluar** pada header atau Demo Bar.

5. **Masuk sebagai Siswa (`/masuk?tab=siswa`)**
   - Masuk dengan akun `siswa001` dan kata sandi `demo1234`.
   - Kembali ke Beranda / Katalog, buka materi yang baru saja diterbitkan atau buka *Pecahan dan Penjumlahannya*.

6. **Buka Halaman Akses Siswa (`/materi/[id]`)**
   - Jelajahi **Pratinjau Interaktif**: gunakan tombol panah `◀` dan `▶` untuk berpindah halaman materi.
   - Coba tombol **Nilai materi ini** (klik bintang 1-5).
   - Coba tombol **Unduh Materi**:
     - Jika materi diizinkan diunduh: tombol aktif, memicu berkas unduhan dan efek konfeti, serta status Riwayat Akses tercatat sebagai **Diunduh**.
     - Jika materi dilarang diunduh (contoh: *Ekosistem di Sekitar Kita*): tombol terkunci dengan keterangan *"Unduhan Dilarang Guru"*.
   - Periksa tabel **Riwayat Akses** di bagian bawah.
   - Klik kartu **Butuh Bantuan? (Contact Person)** untuk melihat kontak WhatsApp & email admin sekolah.

---

## 📦 Struktur Proyek & Kesiapan Supabase

```
arsip-materi-sdn5/
├── app/
│   ├── layout.tsx             # Root layout (Google Fonts Fraunces & Plus Jakarta Sans, Dark theme)
│   ├── globals.css            # Custom CSS (Glassmorphism, glow ambient, buttons)
│   ├── page.tsx               # Beranda (Hero, Unggahan Terbaru, Katalog Kelas 1-6, Dua Peran)
│   ├── masuk/page.tsx         # Sign In (Tab Siswa/Guru, akun demo 1-klik)
│   ├── guru/page.tsx          # Dashboard Guru (Dropzone, Progres bar, Form Terbitkan, Tabel Materi Saya)
│   └── materi/[id]/
│       ├── page.tsx           # Server dynamic page with generateStaticParams
│       └── AksesMateriClient.tsx # Pratinjau interaktif, rating, unduh bersyarat, Riwayat Akses
├── components/
│   ├── Navbar.tsx             # Navigasi responsif + pill profil
│   ├── Footer.tsx             # Identitas SDN 5 Way Galih
│   ├── DemoBanner.tsx         # Bilah pengalih akun demo 1-klik
│   ├── ContactModal.tsx       # Modal informasi Contact Person & WhatsApp
│   ├── MaterialCard.tsx       # Kartu materi kaca dengan label kecil (PDF, PPT, Canvas)
│   └── DocumentPreview.tsx    # Lembar pratinjau materi/slide/Canva
├── lib/
│   ├── types.ts               # Tipe data TypeScript (sesuai skema Supabase)
│   ├── mock-data.ts           # 6 data contoh materi awal
│   └── storage.ts             # Service layer (MaterialService, AccessLogService, RatingService, AuthService)
└── supabase/
    ├── schema.sql             # Skema tabel PostgreSQL & aturan Row Level Security (RLS)
    └── seed.sql               # Data awal siap eksekusi di Supabase SQL Editor
```

### Migrasi ke Supabase Nanti
Seluruh manipulasi data diisolasi rapi di `lib/storage.ts`. Saat backend Supabase siap:
1. Jalankan `supabase/schema.sql` dan `supabase/seed.sql` di Supabase SQL Editor.
2. Pasang `@supabase/supabase-js`.
3. Ganti pemanggilan `localStorage` di `lib/storage.ts` dengan query client Supabase. Tidak perlu membongkar kode komponen tampilan sama sekali.
