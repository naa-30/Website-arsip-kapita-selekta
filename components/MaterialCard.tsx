'use client';

import React from 'react';
import Link from 'next/link';
import { Material, UserProfile } from '@/lib/types';
import { Lock, FileText, Presentation, Layout, ArrowRight } from 'lucide-react';

interface MaterialCardProps {
  material: Material;
  currentUser: UserProfile | null;
}

export default function MaterialCard({ material, currentUser }: MaterialCardProps) {
  const getBadgeStyle = (kind: string) => {
    switch (kind) {
      case 'pdf':
        return {
          label: 'PDF',
          className: 'text-rose-300 bg-rose-950/70 border-rose-800/60',
          icon: <FileText className="w-3.5 h-3.5 mr-1 text-rose-400" />
        };
      case 'ppt':
        return {
          label: 'PPT',
          className: 'text-orange-300 bg-orange-950/70 border-orange-800/60',
          icon: <Presentation className="w-3.5 h-3.5 mr-1 text-orange-400" />
        };
      case 'canvas':
        return {
          label: 'Canvas',
          className: 'text-amber-300 bg-amber-950/70 border-amber-800/60',
          icon: <Layout className="w-3.5 h-3.5 mr-1 text-amber-400" />
        };
      default:
        return {
          label: kind.toUpperCase(),
          className: 'text-blue-300 bg-blue-950/70 border-blue-800/60',
          icon: <FileText className="w-3.5 h-3.5 mr-1" />
        };
    }
  };

  const badge = getBadgeStyle(material.kind);

  const formatCount = () => {
    if (material.kind === 'canvas') return '1 papan';
    if (material.kind === 'ppt') return `${material.pageCount || 10} slide`;
    return `${material.pageCount || 8} halaman`;
  };

  return (
    <div className="glass-panel-hover rounded-2xl p-6 flex flex-col justify-between group border border-white/5 relative overflow-hidden">
      {/* Background soft glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />

      <div>
        {/* Top Header: Badge & Pages */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.className}`}
          >
            {badge.icon}
            {badge.label}
          </span>

          <span className="text-xs text-slate-400 font-medium">
            {formatCount()}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold font-heading text-white mb-2.5 group-hover:text-blue-200 transition-colors line-clamp-2">
          {material.title}
        </h3>

        {/* Subject & Class */}
        <p className="text-sm text-slate-300 mb-1 font-medium">
          {material.subject} · <span className="text-blue-400 font-semibold">Kelas {material.grade}</span>
        </p>

        {/* Uploaded By */}
        <p className="text-xs text-slate-400 mb-6">
          Diunggah oleh {material.ownerName}
        </p>
      </div>

      {/* Action Button & Allowance indicator */}
      <div className="pt-2">
        {!material.allowDownload && (
          <div className="mb-3 flex items-center gap-1.5 text-[11px] text-amber-300/80 bg-amber-950/30 px-2 py-1 rounded border border-amber-900/30">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Hanya baca langsung (unduh dilarang guru)</span>
          </div>
        )}

        {currentUser ? (
          <Link
            href={`/materi/${material.id}`}
            className="w-full btn-glass py-3 px-4 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all shadow-sm"
          >
            <span>Buka Materi</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <Link
            href={`/masuk?redirect=/materi/${material.id}`}
            className="w-full btn-glass py-3 px-4 rounded-xl text-sm text-slate-300 text-center flex items-center justify-center gap-2 hover:text-white hover:border-blue-500/40 transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Masuk untuk membuka</span>
          </Link>
        )}
      </div>
    </div>
  );
}
