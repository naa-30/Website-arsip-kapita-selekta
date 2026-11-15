'use client';

import React, { useState } from 'react';
import { Material } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ExternalLink,
  BookOpen,
  Presentation,
  Layout,
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface DocumentPreviewProps {
  material: Material;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function DocumentPreview({
  material,
  isFullscreen,
  onToggleFullscreen,
}: DocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = material.kind === 'canvas' ? 1 : (material.pageCount || 14);

  const previewData = material.previewContent?.pages || [];
  const activePageData =
    previewData.find((p) => p.pageNumber === currentPage) ||
    previewData[0] || {
      pageNumber: currentPage,
      title: `${material.title} (Halaman ${currentPage})`,
      subtitle: `${material.subject} Kelas ${material.grade}`,
      content: [
        'Materi rangkuman dan bahan pembelajaran pelengkap untuk siswa.',
        'Silakan cermati penjelasan konsep dan kerjakan latihan mandiri yang tersedia.',
      ],
      points: [
        'Poin penting konsep pembelajaran materi ini.',
        'Langkah-langkah pemahaman konsep secara terarah.',
      ],
      exercise: 'Latihan mandiri: Catat kesimpulan dari halaman ini pada buku tugasmu!',
    };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <div
      className={`relative flex flex-col justify-between transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#070d1e] p-6 overflow-y-auto'
          : 'glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl min-h-[560px]'
      }`}
    >
      {/* Top Bar inside preview */}
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-white">Pratinjau Interaktif</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 capitalize">{material.kind.toUpperCase()}</span>
        </div>

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Buka Layar Penuh'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Preview Container (Paper/Slide sheet) */}
      <div className="my-auto">
        {material.kind === 'canvas' ? (
          /* Canvas Link Viewer */
          <div className="bg-slate-900/90 rounded-2xl p-8 border border-amber-500/30 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Layout className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-bold font-heading text-white">
                Papan Konsep Interaktif Canva
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Materi ini disusun menggunakan papan presentasi Canva yang kaya visual dan animasi interaktif.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 max-w-sm mx-auto text-left text-xs text-slate-300 space-y-1.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Topik Canva: {material.title}
              </p>
              <p className="text-slate-400">Penyusun: {material.ownerName}</p>
              <p className="text-slate-400">Status: Dapat diakses online</p>
            </div>

            <div>
              <a
                href={material.canvasUrl || 'https://www.canva.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-500/25"
              >
                <span>Buka di Canva (Tab Baru)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* PDF / PPT White Educational Sheet (like the design) */
          <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-9 shadow-2xl border border-slate-200 min-h-[380px] flex flex-col justify-between select-none">
            
            {/* Sheet Header */}
            <div>
              <div className="flex items-start gap-4 mb-5 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  {material.kind === 'ppt' ? (
                    <Presentation className="w-6 h-6" />
                  ) : (
                    <BookOpen className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold font-heading text-slate-900">
                    {activePageData.title}
                  </h4>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    {activePageData.subtitle || `${material.subject} · Kelas ${material.grade}`}
                  </p>
                </div>
              </div>

              {/* Sheet Paragraphs */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed mb-6">
                {activePageData.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Visual Diagram Box */}
              {activePageData.diagramType === 'fractions' && (
                <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                    <div className="w-10 h-10 rounded-full border-4 border-blue-600 mx-auto mb-2 flex items-center justify-center font-bold text-blue-600 text-xs">
                      1/2
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">Setengah (1/2)</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                    <div className="w-10 h-10 rounded-full border-4 border-emerald-500 mx-auto mb-2 flex items-center justify-center font-bold text-emerald-600 text-xs">
                      1/4
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">Seperempat (1/4)</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                    <div className="w-10 h-10 rounded-full border-4 border-amber-500 mx-auto mb-2 flex items-center justify-center font-bold text-amber-600 text-xs">
                      3/4
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">Tiga Perempat</span>
                  </div>
                </div>
              )}

              {activePageData.diagramType === 'ecosystem' && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                  <p className="font-semibold mb-2">Bagan Rantai Makanan Sawah Way Galih:</p>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold">
                    <span className="px-2.5 py-1 bg-white rounded-md border border-emerald-300">🌾 Padi</span>
                    <span>➔</span>
                    <span className="px-2.5 py-1 bg-white rounded-md border border-emerald-300">🦗 Belalang</span>
                    <span>➔</span>
                    <span className="px-2.5 py-1 bg-white rounded-md border border-emerald-300">🐸 Katak</span>
                    <span>➔</span>
                    <span className="px-2.5 py-1 bg-white rounded-md border border-emerald-300">🐍 Ular</span>
                    <span>➔</span>
                    <span className="px-2.5 py-1 bg-white rounded-md border border-emerald-300">🦅 Elang</span>
                  </div>
                </div>
              )}

              {activePageData.points && activePageData.points.length > 0 && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 mb-4 text-xs text-slate-800 space-y-1.5">
                  <p className="font-semibold text-blue-900">Rangkuman Konsep:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {activePageData.points.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activePageData.exercise && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium">
                  <strong>💡 Latihan: </strong> {activePageData.exercise}
                </div>
              )}
            </div>

            {/* Sheet Footer Info */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>SDN 5 Way Galih — Arsip Materi Tambahan</span>
              <span>Halaman {currentPage} dari {totalPages}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Controls (◀ 1/14 ▶) */}
      {material.kind !== 'canvas' && (
        <div className="flex items-center justify-center gap-4 mt-6 pt-3 border-t border-white/5">
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
