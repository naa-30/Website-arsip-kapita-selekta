import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DemoBanner from '@/components/DemoBanner';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arsip Materi Tambahan SDN 5 Way Galih',
  description: 'Arsip digital materi pendukung dan tambahan pembelajaran untuk siswa kelas 1 sampai 6 SDN 5 Way Galih.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${fraunces.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-[#070d1e] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        {/* Ambient background glows */}
        <div className="fixed top-0 left-1/4 ambient-glow-blue pointer-events-none" />
        <div className="fixed bottom-1/3 right-10 ambient-glow-indigo pointer-events-none" />

        <Suspense fallback={null}>
          <DemoBanner />
        </Suspense>

        <Suspense fallback={<header className="h-20 bg-[#070d1e]" />}>
          <Navbar />
        </Suspense>
        
        <main className="flex-1 relative z-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
