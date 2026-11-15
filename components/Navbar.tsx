'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthService } from '@/lib/storage';
import { UserProfile } from '@/lib/types';
import { BookOpen, User, LogOut, Menu, X, LayoutDashboard, ChevronRight, School, Sparkles } from 'lucide-react';
import ContactModal from './ContactModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const checkUser = () => {
    setUser(AuthService.getCurrentUser());
  };

  useEffect(() => {
    checkUser();
    const handleAuth = () => checkUser();
    window.addEventListener('arsip_auth_change', handleAuth);
    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('arsip_auth_change', handleAuth);
      window.removeEventListener('storage', handleAuth);
    };
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    router.push('/');
  };

  return (
    <>
      <header className="w-full bg-[#070d1e]/90 backdrop-blur-md border-b border-white/5 sticky top-7 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & School Name */}
          <NextLink href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold font-heading text-white tracking-tight flex items-center gap-1.5">
                SDN 5 Way Galih
              </div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-blue-400">
                Arsip Materi Tambahan
              </div>
            </div>
          </NextLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <NextLink
              href="/"
              className={`transition-colors hover:text-white ${
                pathname === '/' ? 'text-white font-semibold' : 'text-slate-400'
              }`}
            >
              Beranda
            </NextLink>
            <NextLink
              href="/#katalog"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Katalog Materi
            </NextLink>
            <NextLink
              href="/#cara-akses"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Cara Akses
            </NextLink>
            <button
              onClick={() => setContactOpen(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Bantuan
            </button>
          </nav>

          {/* Desktop User Status & Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'guru' ? (
                  <NextLink
                    href="/guru"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs font-medium hover:bg-blue-900/60 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    <User className="w-3.5 h-3.5" />
                    <span>{user.fullName}</span>
                  </NextLink>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <User className="w-3.5 h-3.5" />
                    <span>{user.fullName}</span>
                  </div>
                )}

                {user.role === 'guru' && pathname !== '/guru' && (
                  <NextLink
                    href="/guru"
                    className="btn-primary px-3.5 py-2 text-xs flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard Guru
                  </NextLink>
                )}

                <button
                  onClick={handleLogout}
                  className="btn-glass px-3.5 py-2 text-xs flex items-center gap-1.5 text-slate-300 hover:text-rose-300 hover:border-rose-500/30 transition-colors"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <NextLink
                  href="/masuk?tab=siswa"
                  className="btn-glass px-4 py-2.5 text-xs flex items-center gap-2 font-medium"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Sign In Siswa
                </NextLink>
                <NextLink
                  href="/masuk?tab=guru"
                  className="btn-primary px-4 py-2.5 text-xs flex items-center gap-2 font-semibold shadow-md"
                >
                  Sign In Guru
                </NextLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-white/10 px-4 py-5 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm">
              <NextLink
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 ${pathname === '/' ? 'text-blue-400 font-semibold' : 'text-slate-300'}`}
              >
                Beranda
              </NextLink>
              <NextLink
                href="/#katalog"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-slate-300"
              >
                Katalog Materi (Kelas 1–6)
              </NextLink>
              <NextLink
                href="/#cara-akses"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-slate-300"
              >
                Cara Akses
              </NextLink>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactOpen(true);
                }}
                className="text-left py-1.5 text-slate-300"
              >
                Bantuan & Contact Person
              </button>
            </nav>

            <div className="pt-3 border-t border-white/10">
              {user ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    Masuk sebagai: <strong className="text-white">{user.fullName}</strong>
                  </div>
                  {user.role === 'guru' && (
                    <NextLink
                      href="/guru"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard Guru
                    </NextLink>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full btn-glass py-2 text-xs flex items-center justify-center gap-2 text-rose-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <NextLink
                    href="/masuk?tab=siswa"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-glass py-2.5 text-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    Siswa
                  </NextLink>
                  <NextLink
                    href="/masuk?tab=guru"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary py-2.5 text-xs text-center flex items-center justify-center"
                  >
                    Guru
                  </NextLink>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
