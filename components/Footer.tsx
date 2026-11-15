import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#050914] text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-white font-medium">
            Arsip Materi Tambahan SDN 5 Way Galih
          </p>
          <p className="text-xs text-slate-500">
            Kecamatan Tanjung Bintang, Kabupaten Lampung Selatan, Lampung.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span>Khusus guru dan siswa terdaftar</span>
          <span>•</span>
          <span>Versi Demo 1.0 (Next.js + Tailwind)</span>
          <span>•</span>
          <Link href="/#katalog" className="hover:text-blue-400 transition-colors">
            Katalog Kelas 1–6
          </Link>
        </div>
      </div>
    </footer>
  );
}
