'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MaterialService, AuthService } from '@/lib/storage';
import { INITIAL_MATERIALS } from '@/lib/mock-data';
import { Material, UserProfile } from '@/lib/types';
import MaterialCard from '@/components/MaterialCard';
import ContactModal from '@/components/ContactModal';
import {
  Search,
  Upload,
  Download,
  BookOpen,
  ArrowRight,
  FileText,
  Presentation,
  Layout,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>(() =>
    INITIAL_MATERIALS.filter((m) => m.status === 'terbit')
  );
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadData = async () => {
    const list = await MaterialService.getAll();
    // Only show published materials on the public catalog
    setMaterials(list.filter((m) => m.status === 'terbit'));
    setCurrentUser(AuthService.getCurrentUser());
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('arsip_storage_update', handleUpdate);
    window.addEventListener('arsip_auth_change', handleUpdate);
    return () => {
      window.removeEventListener('arsip_storage_update', handleUpdate);
      window.removeEventListener('arsip_auth_change', handleUpdate);
    };
  }, []);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesGrade = selectedGrade === 'all' || m.grade === selectedGrade;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        m.title.toLowerCase().includes(query) ||
        m.subject.toLowerCase().includes(query) ||
        m.ownerName.toLowerCase().includes(query);
      return matchesGrade && matchesQuery;
    });
  }, [materials, selectedGrade, searchQuery]);

  // Unggahan terbaru (top 3)
  const recentUploads = useMemo(() => {
    return [...materials].slice(0, 3);
  }, [materials]);

  const handleHeroAction = (path: string) => {
    router.push(path);
  };

  const getKindLabel = (kind: string) => {
    if (kind === 'pdf') return <span className="text-rose-400 font-medium">PDF</span>;
    if (kind === 'ppt') return <span className="text-orange-400 font-medium">PPT</span>;
    return <span className="text-amber-400 font-medium">Canvas</span>;
  };

  const getPageCountLabel = (m: Material) => {
    if (m.kind === 'canvas') return '1 papan';
    if (m.kind === 'ppt') return `${m.pageCount || 10} slide`;
    return `${m.pageCount || 8} hal`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
      
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="pt-6 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left (Text & CTAs) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              Arsip Digital Sekolah
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight leading-[1.15]">
              Semua materi belajar, tersimpan rapi di satu tempat.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Guru SDN 5 Way Galih mengunggah materi pendukung, berkas PDF, presentasi PPT, dan papan Canvas. Siswa tinggal masuk, mencari, lalu membuka atau mengunduhnya kapan saja.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#katalog"
                className="btn-primary px-6 py-3.5 text-sm sm:text-base flex items-center gap-2 font-semibold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Jelajahi Materi</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {currentUser?.role === 'guru' ? (
                <Link
                  href="/guru"
                  className="btn-glass px-6 py-3.5 text-sm sm:text-base flex items-center gap-2 font-medium"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  Dashboard Guru
                </Link>
              ) : (
                <Link
                  href="/masuk?tab=guru"
                  className="btn-glass px-6 py-3.5 text-sm sm:text-base flex items-center gap-2 font-medium"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  Unggah Materi (Guru)
                </Link>
              )}
            </div>
          </div>

          {/* Hero Right (Card Unggahan Terbaru) */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-white">Unggahan terbaru</h3>
                  <p className="text-xs text-slate-400">PDF, PPT, dan tautan Canva dari para guru</p>
                </div>
              </div>

              {/* Table / List of recent materials */}
              <div className="divide-y divide-white/5 text-sm">
                <div className="grid grid-cols-12 py-2.5 text-xs text-slate-400 font-medium">
                  <div className="col-span-6">Judul</div>
                  <div className="col-span-3 text-center">Jenis</div>
                  <div className="col-span-3 text-right">Halaman</div>
                </div>

                {recentUploads.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (currentUser) {
                        router.push(`/materi/${item.id}`);
                      } else {
                        router.push(`/masuk?redirect=/materi/${item.id}`);
                      }
                    }}
                    className="grid grid-cols-12 py-3.5 items-center hover:bg-white/5 px-2 -mx-2 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="col-span-6 pr-2">
                      <p className="font-semibold text-slate-200 group-hover:text-blue-300 transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.subject} · Kelas {item.grade}
                      </p>
                    </div>
                    <div className="col-span-3 text-center text-xs">
                      {getKindLabel(item.kind)}
                    </div>
                    <div className="col-span-3 text-right text-xs text-slate-400 font-mono">
                      {getPageCountLabel(item)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>{materials.length} materi tambahan aktif</span>
                <a href="#katalog" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                  Lihat semua <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          KATALOG MATERI (FILTER KELAS 1-6 & SEARCH)
          ========================================================================= */}
      <section id="katalog" className="scroll-mt-28 space-y-8">
        
        {/* Katalog Header & Search */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-2">
              Katalog Materi
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Cari berdasarkan judul atau mata pelajaran, atau saring menurut kelas.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi atau mata pelajaran..."
              className="w-full glass-input pl-10 pr-9 py-2.5 rounded-xl text-sm placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Grade Filter Chips: Semua, Kelas 1, 2, 3, 4, 5, 6 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedGrade('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedGrade === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'btn-glass text-slate-300 hover:text-white'
            }`}
          >
            Semua Kelas
          </button>

          {[1, 2, 3, 4, 5, 6].map((gradeNum) => {
            const count = materials.filter((m) => m.grade === gradeNum).length;
            const isSelected = selectedGrade === gradeNum;

            return (
              <button
                key={gradeNum}
                onClick={() => setSelectedGrade(gradeNum)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'btn-glass text-slate-300 hover:text-white'
                }`}
              >
                <span>Kelas {gradeNum}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Material Cards Grid */}
        {filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => (
              <MaterialCard key={item.id} material={item} currentUser={currentUser} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto border border-white/5">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-heading text-white">Materi Tidak Ditemukan</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tidak ada materi yang sesuai dengan saringan kelas atau kata kunci pencarian Anda. Coba kata kunci lain atau pilih saringan kelas yang berbeda.
            </p>
            <button
              onClick={() => {
                setSelectedGrade('all');
                setSearchQuery('');
              }}
              className="btn-glass px-4 py-2 text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              Reset Saringan
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION: DUA PERAN, SATU ARSIP
          ========================================================================= */}
      <section id="cara-akses" className="scroll-mt-28 space-y-8 pt-6">
        <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
          Dua peran, satu arsip
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Guru Card */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-white mb-3">Guru</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Masuk, lalu unggah modul ajar, berkas PDF, atau tautan canvas buatan sendiri. Atur mata pelajaran, kelas, dan siapa yang boleh mengaksesnya. Modul yang sudah terbit bisa diperbarui kapan saja.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href={currentUser?.role === 'guru' ? '/guru' : '/masuk?tab=guru'}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
              >
                <span>Buka dashboard guru</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Siswa Card (Replaced Mahasiswa with Siswa!) */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-white mb-6">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-white mb-3">Siswa</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Masuk dengan akun siswa, cari modul menurut kelas atau mata pelajaran, lalu baca langsung di halaman atau unduh. Siswa hanya dapat melihat, tidak dapat mengubah isi arsip.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href={
                  currentUser?.role === 'siswa'
                    ? (materials[0] ? `/materi/${materials[0].id}` : '/#katalog')
                    : '/masuk?tab=siswa'
                }
                className="btn-glass inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
              >
                <span>Lihat contoh akses modul</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION: BUTUH BANTUAN? (CONTACT PERSON CARD)
          ========================================================================= */}
      <section className="pt-4">
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-blue-900/60 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white text-blue-900 flex items-center justify-center font-bold text-2xl shadow-xl shrink-0">
              ?
            </div>
            <div>
              <h3 className="text-2xl font-bold font-heading text-white mb-1">Butuh Bantuan?</h3>
              <p className="text-sm text-blue-200">
                Lupa kata sandi atau modul tidak bisa dibuka? Hubungi admin arsip sekolah.
              </p>
            </div>
          </div>

          <button
            onClick={() => setContactOpen(true)}
            className="btn-glass px-6 py-3 text-sm font-semibold text-white whitespace-nowrap hover:bg-white/10 hover:border-white/30 shrink-0"
          >
            Contact Person
          </button>
        </div>
      </section>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
