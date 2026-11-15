'use client';

import React from 'react';
import { X, Phone, Mail, MapPin, Clock, MessageSquare, ExternalLink } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel p-6 rounded-2xl shadow-2xl border border-blue-500/30 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Tutup dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg">
            ?
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-white">Hubungi Admin Sekolah</h3>
            <p className="text-xs text-blue-300">SDN 5 Way Galih, Kec. Tanjung Bintang</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Jika Anda mengalami kendala lupa kata sandi akun, berkas materi tidak dapat terbuka, atau memerlukan akun baru untuk guru / siswa, silakan hubungi tim pengelola arsip:
        </p>

        <div className="space-y-3.5 mb-6">
          <a
            href="https://wa.me/6282177889900?text=Halo%20Admin%20SDN%205%20Way%20Galih,%20saya%20butuh%20bantuan%20terkait%20Arsip%20Materi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/50 hover:border-emerald-400 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-medium">WhatsApp Admin Arsip</p>
                <p className="text-sm font-semibold text-white group-hover:text-emerald-200">+62 821-7788-9900</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100" />
          </a>

          <a
            href="mailto:admin@sdn5waygalih.sch.id"
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/10 hover:bg-slate-800/80 hover:border-blue-400 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600 text-white">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Email Resmi Sekolah</p>
                <p className="text-sm font-semibold text-white group-hover:text-blue-200">admin@sdn5waygalih.sch.id</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 opacity-60 group-hover:opacity-100" />
          </a>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-white/5">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Waktu Pelayanan Administrasi</p>
              <p className="text-sm text-slate-200">Senin – Jumat : 07.30 – 14.30 WIB</p>
              <p className="text-xs text-slate-400 mt-0.5">Sabtu : 07.30 – 12.00 WIB (Piket Kantor)</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
