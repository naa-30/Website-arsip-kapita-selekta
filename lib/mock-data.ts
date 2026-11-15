import { Material, UserProfile, AccessLogItem } from './types';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-guru-4',
    loginId: 'guru4',
    fullName: 'Guru Kelas 4',
    role: 'guru',
    grade: 4,
    email: 'guru4@sdn5waygalih.sch.id',
  },
  {
    id: 'user-siswa-001',
    loginId: 'siswa001',
    fullName: 'Siswa Kelas 4',
    role: 'siswa',
    grade: 4,
    email: 'siswa001@sdn5waygalih.sch.id',
  },
  {
    id: 'user-admin-1',
    loginId: 'admin',
    fullName: 'Admin Sekolah',
    role: 'admin',
    email: 'admin@sdn5waygalih.sch.id',
  }
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    ownerId: 'user-guru-4',
    ownerName: 'Guru Kelas 4',
    title: 'Pecahan dan Penjumlahannya',
    subject: 'Matematika',
    grade: 4,
    kind: 'pdf',
    description: 'Ringkasan materi pecahan biasa dan desimal disertai contoh soal bergambar dan cara penyelesaian praktis untuk siswa kelas 4.',
    pageCount: 14,
    fileName: 'Modul_Ajar_Pecahan_Kelas4.pdf',
    fileSize: '2.4 MB',
    allowDownload: true,
    status: 'terbit',
    publishedAt: '2026-11-03',
    createdAt: '2026-11-03T08:00:00Z',
    previewContent: {
      pages: [
        {
          pageNumber: 1,
          title: 'Mengenal Konsep Pecahan',
          subtitle: 'Matematika Kelas 4 — Bab Pecahan Sederhana',
          content: [
            'Pecahan menyatakan bagian dari suatu keseluruhan.',
            'Jika sebuah pizza dipotong menjadi 4 bagian sama besar, satu potong bernilai 1/4 (seperempat).',
            'Angka di atas disebut Pembilang (numerator), angka di bawah disebut Penyebut (denominator).'
          ],
          diagramType: 'fractions',
          points: [
            '1/2 = Satu dari dua bagian (setengah)',
            '1/4 = Satu dari empat bagian (seperempat)',
            '3/4 = Tiga dari empat bagian'
          ],
          exercise: 'Latihan: Ibu memotong semangka jadi 8 potong. Andi makan 2 potong. Berapa bagian yang dimakan Andi? (Jawab: 2/8 = 1/4)'
        },
        {
          pageNumber: 2,
          title: 'Penjumlahan Pecahan Berpenyebut Sama',
          subtitle: 'Langkah mudah menjumlahkan pembilang',
          content: [
            'Aturan utama: jika penyebutnya sudah sama, cukup jumlahkan pembilang di bagian atas!',
            'Contoh 1: 1/4 + 2/4 = (1 + 2) / 4 = 3/4',
            'Contoh 2: 2/5 + 1/5 = 3/5',
            'Ingat: Penyebut di bawah TIDAK BOLEH dijumlahkan!'
          ],
          points: [
            'Langkah 1: Periksa apakah penyebut sudah sama.',
            'Langkah 2: Jumlahkan angka pembilang.',
            'Langkah 3: Tuliskan hasilnya dengan penyebut yang sama.'
          ],
          exercise: 'Hitunglah: 3/7 + 2/7 = ... (Jawab: 5/7)'
        },
        {
          pageNumber: 3,
          title: 'Penjumlahan Pecahan Beda Penyebut',
          subtitle: 'Menyamakan penyebut dengan KPK',
          content: [
            'Jika penyebut tidak sama, samakan terlebih dahulu penyebutnya menggunakan Kelipatan Persekutuan Terkecil (KPK).',
            'Contoh: 1/2 + 1/4',
            'KPK dari 2 dan 4 adalah 4. Ubah 1/2 menjadi 2/4.',
            'Maka: 2/4 + 1/4 = 3/4.'
          ],
          points: [
            'Cari KPK penyebut',
            'Sesuaikan nilai pembilang',
            'Sederhanakan hasil akhir jika bisa'
          ],
          exercise: 'Hitunglah: 1/3 + 1/6 = ... (Jawab: 2/6 + 1/6 = 3/6 = 1/2)'
        }
      ]
    }
  },
  {
    id: 'mat-2',
    ownerId: 'user-guru-5',
    ownerName: 'Guru Kelas 5',
    title: 'Ekosistem di Sekitar Kita',
    subject: 'IPAS',
    grade: 5,
    kind: 'ppt',
    description: 'Slide interaktif pengenalan rantai makanan, jaring-jaring makanan, dan interaksi biotik-abiotik di lingkungan sawah dan hutan Lampung.',
    pageCount: 22,
    fileName: 'Ekosistem_di_Sekitar_Kita.pptx',
    fileSize: '5.8 MB',
    allowDownload: false, // Intentionally false to demo disabled download!
    status: 'terbit',
    publishedAt: '2026-11-02',
    createdAt: '2026-11-02T09:30:00Z',
    previewContent: {
      pages: [
        {
          pageNumber: 1,
          title: 'Slide 1: Apa itu Ekosistem?',
          subtitle: 'IPAS Kelas 5 — Harmoni dalam Ekosistem',
          content: [
            'Ekosistem adalah hubungan timbal balik antara makhluk hidup dengan lingkungannya.',
            'Komponen Ekosistem dibagi menjadi dua:',
            '1. Biotik: Mahluk hidup (tumbuhan, hewan, manusia, bakteri)',
            '2. Abiotik: Benda tak hidup (air, tanah, udara, cahaya matahari)'
          ],
          diagramType: 'ecosystem',
          points: [
            'Produsen: Tumbuhan hijau yang menghasilkan makanan sendiri melalui fotosintesis',
            'Konsumen I: Herbivora pemakan produsen (belalang, kelinci, ulat)',
            'Konsumen II & III: Karnivora / Omnivora (katak, burung, ular)',
            'Pengurai (Dekomposer): Jamur dan cacing'
          ],
          exercise: 'Sebutkan 3 komponen abiotik yang ada di halaman SDN 5 Way Galih!'
        },
        {
          pageNumber: 2,
          title: 'Slide 2: Rantai Makanan di Sawah',
          subtitle: 'Aliran energi dari produsen ke konsumen puncak',
          content: [
            'Padi (Produsen) dimakan oleh Belalang (Konsumen 1).',
            'Belalang dimakan oleh Katak (Konsumen 2).',
            'Katak dimakan oleh Ular Sawah (Konsumen 3).',
            'Ular dimakan oleh Burung Elang (Konsumen Puncak).',
            'Saat elang mati, tubuhnya diurai oleh jamur pengurai menjadi humus tanah.'
          ],
          points: [
            'Padi ➔ Belalang ➔ Katak ➔ Ular ➔ Elang ➔ Pengurai'
          ]
        }
      ]
    }
  },
  {
    id: 'mat-3',
    ownerId: 'user-guru-5',
    ownerName: 'Guru Kelas 5',
    title: 'Peta Konsep Siklus Air',
    subject: 'IPAS',
    grade: 5,
    kind: 'canvas',
    description: 'Papan konsep visual Canva yang menjelaskan proses evaporasi, kondensasi, presipitasi, dan infiltrasi dalam siklus hidrologi bumi.',
    pageCount: 1,
    canvasUrl: 'https://www.canva.com/design/DAGSiklusAirWayGalih/view',
    allowDownload: false,
    status: 'terbit',
    publishedAt: '2026-10-30',
    createdAt: '2026-10-30T11:15:00Z',
    previewContent: {
      pages: [
        {
          pageNumber: 1,
          title: 'Papan Visual Canva: Siklus Air Bumi',
          subtitle: 'Tautan Desain Interaktif Canva',
          content: [
            '1. Evaporasi: Penguapan air laut dan sungai akibat panas matahari.',
            '2. Transpirasi: Penguapan uap air dari tumbuhan.',
            '3. Kondensasi: Uap air mendingin menjadi awan di atmosfer.',
            '4. Presipitasi: Butiran air jatuh ke bumi sebagai hujan.',
            '5. Infiltrasi: Air hujan meresap ke dalam tanah dan mengalir kembali ke laut.'
          ],
          diagramType: 'watercycle',
          points: [
            'Mengapa air di bumi tidak pernah habis? Karena mengalami siklus daur ulang alami terus-menerus.'
          ]
        }
      ]
    }
  },
  {
    id: 'mat-4',
    ownerId: 'user-guru-3',
    ownerName: 'Guru Kelas 3',
    title: 'Teks Narasi Pendek',
    subject: 'Bahasa Indonesia',
    grade: 3,
    kind: 'pdf',
    description: 'Kumpulan cerita fabel dan dongeng nusantara pendek beserta panduan menemukan ide pokok, latar, dan pesan moral.',
    pageCount: 10,
    fileName: 'Teks_Narasi_Pendek_K3.pdf',
    fileSize: '1.9 MB',
    allowDownload: true,
    status: 'terbit',
    publishedAt: '2026-10-28',
    createdAt: '2026-10-28T14:00:00Z',
    previewContent: {
      pages: [
        {
          pageNumber: 1,
          title: 'Kancil dan Buaya yang Jujur',
          subtitle: 'Cerita Fabel Edukatif Kelas 3',
          content: [
            'Di sebuah hutan lebat di tepi Sungai Way Galih, hidurlah seekor kancil yang cerdik.',
            'Suatu hari kancil ingin menyeberang sungai untuk memetik mentimun manis di seberang.',
            'Namun kancil tidak membohongi buaya, melainkan meminta tolong dengan sopan.',
            'Pesan Moral: Kecerdikan terbaik adalah kejujuran dan tutur kata yang santun.'
          ],
          diagramType: 'story',
          points: [
            'Tokoh: Kancil dan Buaya',
            'Latar Tempat: Tepi Sungai Way Galih',
            'Amanat: Menghormati sesama teman'
          ],
          exercise: 'Siapakah tokoh utama dalam cerita di atas? Apa pelajaran yang kamu petik?'
        }
      ]
    }
  },
  {
    id: 'mat-5',
    ownerId: 'user-guru-3',
    ownerName: 'Guru Kelas 3',
    title: 'Lembar Kerja Perkalian',
    subject: 'Matematika',
    grade: 3,
    kind: 'pdf',
    description: 'Latihan soal perkalian berulang 1 sampai 10 dengan pola tabel dan permainan teka-teki berhitung cepat.',
    pageCount: 8,
    fileName: 'Lembar_Kerja_Perkalian_K3.pdf',
    fileSize: '1.2 MB',
    allowDownload: true,
    status: 'terbit',
    publishedAt: '2026-10-25',
    createdAt: '2026-10-25T10:00:00Z',
    previewContent: {
      pages: [
        {
          pageNumber: 1,
          title: 'Perkalian Sebagai Penjumlahan Berulang',
          subtitle: 'Lembar Kerja Matematika Kelas 3',
          content: [
            'Perkalian adalah penjumlahan berulang dari bilangan yang sama.',
            '3 x 4 artinya 4 + 4 + 4 = 12',
            '5 x 2 artinya 2 + 2 + 2 + 2 + 2 = 10'
          ],
          diagramType: 'multiplication',
          points: [
            'Tabel Perkalian 2, 3, 4, dan 5',
            'Tips cepat: Menghitung lompat (skip counting)'
          ],
          exercise: 'Ubahlah ke bentuk penjumlahan berulang: 4 x 6 = ... + ... + ... + ... = ...'
        }
      ]
    }
  },
  {
    id: 'mat-6',
    ownerId: 'user-guru-6',
    ownerName: 'Guru Kelas 6',
    title: 'Keberagaman Budaya Lampung',
    subject: 'Pendidikan Pancasila',
    grade: 6,
    kind: 'canvas',
    description: 'Papan presentasi Canva tentang adat Saibatin dan Pepadun, rumah Nuwou Sesat, kain Tapis, dan semboyan Sang Bumi Ruwa Jurai.',
    pageCount: 1,
    canvasUrl: 'https://www.canva.com/design/DAGBudayaLampungSDN5/view',
    allowDownload: false,
    status: 'terbit',
    publishedAt: '2026-10-20',
    createdAt: '2026-10-20T13:20:00Z',
    previewContent: {
      pages: [
        {
          pageNumber: 1,
          title: 'Mengenal Budaya Tanah Kelahiran: Lampung',
          subtitle: 'Pendidikan Pancasila Kelas 6',
          content: [
            'Provinsi Lampung memiliki falsafah hidup Piil Pesenggiri yang menjunjung kehormatan dan persaudaraan.',
            'Masyarakat adat Lampung terdiri dari dua jurai utama: Jurai Saibatin (pesisir) dan Jurai Pepadun (pedalaman).',
            'Rumah adat Lampung disebut Nuwou Sesat, tempat musyawarah para tetua adat.',
            'Kain Tapis Lampung ditenun secara tradisional dengan benang emas yang megah.'
          ],
          diagramType: 'culture',
          points: [
            'Semboyan: Sang Bumi Ruwa Jurai (Satu bumi yang didiami dua jurai adat)',
            'Nilai Pancasila: Persatuan Indonesia (Sila ke-3) dan Musyawarah Mufakat (Sila ke-4)'
          ],
          exercise: 'Sebutkan nama rumah adat dan kain tradisional khas Provinsi Lampung!'
        }
      ]
    }
  }
];

export const INITIAL_ACCESS_LOGS: AccessLogItem[] = [
  {
    id: 'log-1',
    moduleId: 'mat-1',
    moduleTitle: 'Pecahan dan Penjumlahannya',
    subject: 'Matematika',
    grade: 4,
    kind: 'pdf',
    teacherName: 'Guru Kelas 4',
    userId: 'user-siswa-001',
    action: 'dibaca',
    timestamp: '4 Nov 2026, 10:15 WIB'
  },
  {
    id: 'log-2',
    moduleId: 'mat-2',
    moduleTitle: 'Ekosistem di Sekitar Kita',
    subject: 'IPAS',
    grade: 5,
    kind: 'ppt',
    teacherName: 'Guru Kelas 5',
    userId: 'user-siswa-001',
    action: 'diunduh',
    timestamp: '3 Nov 2026, 14:20 WIB'
  },
  {
    id: 'log-3',
    moduleId: 'mat-3',
    moduleTitle: 'Peta Konsep Siklus Air',
    subject: 'IPAS',
    grade: 5,
    kind: 'canvas',
    teacherName: 'Guru Kelas 5',
    userId: 'user-siswa-001',
    action: 'dibaca',
    timestamp: '2 Nov 2026, 09:05 WIB'
  },
  {
    id: 'log-4',
    moduleId: 'mat-4',
    moduleTitle: 'Teks Narasi Pendek',
    subject: 'Bahasa Indonesia',
    grade: 3,
    kind: 'pdf',
    teacherName: 'Guru Kelas 3',
    userId: 'user-siswa-001',
    action: 'baru',
    timestamp: 'Belum dibuka'
  }
];
