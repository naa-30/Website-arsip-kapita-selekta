'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/storage';
import ContactModal from '@/components/ContactModal';
import {
  BookOpen,
  ArrowLeft,
  User,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'guru' ? 'guru' : 'siswa';
  const redirectTarget = searchParams.get('redirect') || '';

  const [activeTab, setActiveTab] = useState<'siswa' | 'guru'>(initialTab);
  const [loginId, setLoginId] = useState(initialTab === 'guru' ? 'guru4' : 'siswa001');
  const [password, setPassword] = useState('demo1234');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    // If tab changes, adjust suggested demo ID if still on default
    if (activeTab === 'guru') {
      if (loginId === 'siswa001') setLoginId('guru4');
    } else {
      if (loginId === 'guru4') setLoginId('siswa001');
    }
  }, [activeTab]);

  const handleQuickFill = (role: 'guru' | 'siswa') => {
    setActiveTab(role);
    if (role === 'guru') {
      setLoginId('guru4');
    } else {
      setLoginId('siswa001');
    }
    setPassword('demo1234');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials
      if (!loginId.trim()) {
        setErrorMsg('Silakan masukkan ID atau email Anda.');
        setIsLoading(false);
        return;
      }

      if (!password) {
        setErrorMsg('Silakan masukkan kata sandi.');
        setIsLoading(false);
        return;
      }

      // Check demo password match
      if (password !== 'demo1234') {
        setErrorMsg('Kata sandi salah. Untuk akun demo, gunakan kata sandi: demo1234');
        setIsLoading(false);
        return;
      }

      const user = AuthService.login(loginId, activeTab);
      if (user) {
        // Successful login
        if (redirectTarget) {
          router.push(redirectTarget);
        } else if (activeTab === 'guru') {
          router.push('/guru');
        } else {
          router.push('/#katalog');
        }
      } else {
        setErrorMsg('Gagal masuk. Silakan periksa kembali NIS/NIP atau hubungi admin.');
        setIsLoading(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke beranda</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Brand & Context) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
              <BookOpen className="w-8 h-8" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight leading-tight">
              Masuk ke Arsip Materi SDN 5 Way Galih
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-md">
              {activeTab === 'siswa'
                ? 'Masuk sebagai siswa untuk mencari, membaca, dan mengunduh materi yang sudah diunggah oleh para guru.'
                : 'Masuk sebagai guru untuk mengunggah materi baru, mengatur hak unduh siswa, serta mengelola materi ajar Anda.'}
            </p>

            {/* Quick Demo Helper Box */}
            <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 max-w-md space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Pilih Akun Demo Cepat (1-Klik):</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickFill('guru')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    activeTab === 'guru'
                      ? 'bg-blue-600/30 border-blue-400 text-white'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    Guru Kelas 4
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">guru4 / demo1234</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('siswa')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    activeTab === 'siswa'
                      ? 'bg-emerald-600/30 border-emerald-400 text-white'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    Siswa Kelas 4
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">siswa001 / demo1234</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Sign In Card) */}
          <div className="lg:col-span-6">
            <div className="glass-panel p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl relative">
              
              {/* Tab Selector: Siswa | Guru */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-white/5 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('siswa');
                    setErrorMsg('');
                  }}
                  className={`py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'siswa'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Siswa
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('guru');
                    setErrorMsg('');
                  }}
                  className={`py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'guru'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Guru
                </button>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Login ID Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    {activeTab === 'siswa' ? 'NIS / NISN atau email' : 'NIP atau email'}
                  </label>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder={
                      activeTab === 'siswa'
                        ? 'Contoh: siswa001 atau NISN'
                        : 'Contoh: guru4 atau email'
                    }
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Kata sandi
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full glass-input px-4 py-3 pr-11 rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-900 border-white/20 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Ingat saya</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="text-slate-400 hover:text-blue-300 transition-colors"
                  >
                    Lupa kata sandi?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>
                      {activeTab === 'siswa' ? 'Masuk sebagai Siswa' : 'Masuk sebagai Guru'}
                    </span>
                  )}
                </button>
              </form>

              {/* Bottom Note */}
              <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
                Akun dibuat oleh admin sekolah. Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="text-blue-400 hover:underline font-medium"
                >
                  Hubungi Contact Person
                </button>{' '}
                di halaman beranda.
              </p>
            </div>
          </div>

        </div>
      </div>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat halaman masuk...</div>}>
      <SignInContent />
    </Suspense>
  );
}
