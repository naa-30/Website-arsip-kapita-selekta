'use client';

import React, { useState, useEffect } from 'react';
import { AuthService, MaterialService } from '@/lib/storage';
import { UserProfile } from '@/lib/types';
import { Sparkles, RefreshCw, UserCheck, GraduationCap, School } from 'lucide-react';

export default function DemoBanner() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  const checkUser = () => {
    setUser(AuthService.getCurrentUser());
  };

  useEffect(() => {
    setMounted(true);
    checkUser();

    const handleAuth = () => checkUser();
    window.addEventListener('arsip_auth_change', handleAuth);
    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('arsip_auth_change', handleAuth);
      window.removeEventListener('storage', handleAuth);
    };
  }, []);

  const switchRole = (role: 'guru' | 'siswa' | 'guest') => {
    if (role === 'guest') {
      AuthService.logout();
      window.location.href = '/';
    } else if (role === 'guru') {
      AuthService.login('guru4', 'guru');
      window.location.href = '/guru';
    } else {
      AuthService.login('siswa001', 'siswa');
      window.location.href = '/';
    }
  };

  const handleResetData = async () => {
    if (confirm('Kembalikan data demo ke setelan awal? Semua materi baru akan dihapus dan data contoh dipulihkan.')) {
      await MaterialService.resetToDemo();
      window.location.reload();
    }
  };

  if (!mounted) return null;

  return (
    <aside aria-label="Demo Bar" className="bg-slate-950/80 border-b border-blue-500/20 px-3 py-1.5 text-xs text-slate-300 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-800/40">
            <Sparkles className="w-3.5 h-3.5" />
            Mode Demo Arsip
          </span>
          <span className="hidden sm:inline text-slate-400">
            Akun contoh: <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">guru4</code> / <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">siswa001</code> (sandi: <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">demo1234</code>)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            Peran aktif:{' '}
            <strong className="text-white font-medium">
              {user ? (user.role === 'guru' ? 'Guru (Kelas 4)' : 'Siswa (Kelas 4)') : 'Tamu (Belum Masuk)'}
            </strong>
          </span>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => switchRole('guru')}
              className={`px-2 py-0.5 rounded text-xs transition-all flex items-center gap-1 ${
                user?.role === 'guru'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Masuk langsung sebagai Guru Kelas 4"
            >
              <GraduationCap className="w-3 h-3" />
              Guru
            </button>

            <button
              onClick={() => switchRole('siswa')}
              className={`px-2 py-0.5 rounded text-xs transition-all flex items-center gap-1 ${
                user?.role === 'siswa'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Masuk langsung sebagai Siswa Kelas 4"
            >
              <UserCheck className="w-3 h-3" />
              Siswa
            </button>

            {user && (
              <button
                onClick={() => switchRole('guest')}
                className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                title="Keluar ke mode tamu"
              >
                Tamu
              </button>
            )}

            <button
              onClick={handleResetData}
              className="ml-1 p-1 rounded bg-slate-900 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
              title="Reset data demo ke awal"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
