"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  MaterialService,
  AccessLogService,
  RatingService,
  AuthService,
} from "@/lib/storage";
import { INITIAL_MATERIALS, INITIAL_ACCESS_LOGS } from "@/lib/mock-data";
import { Material, UserProfile, AccessLogItem } from "@/lib/types";
import DocumentPreview from "@/components/DocumentPreview";
import ContactModal from "@/components/ContactModal";
import {
  ArrowLeft,
  FileText,
  Presentation,
  Layout,
  Star,
  CheckCircle2,
  Lock,
  Download,
  Maximize2,
  UserCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AksesMateriClientProps {
  materialId: string;
}

export default function AksesMateriClient({
  materialId,
}: AksesMateriClientProps) {
  const router = useRouter();

  const [material, setMaterial] = useState<Material | null>(
    () => INITIAL_MATERIALS.find((m) => m.id === materialId) || null,
  );
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [accessLogs, setAccessLogs] =
    useState<AccessLogItem[]>(INITIAL_ACCESS_LOGS);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (recordRead = true) => {
    if (!materialId) return;

    const user = AuthService.getCurrentUser();
    setCurrentUser(user);

    const mat = await MaterialService.getById(materialId);
    if (mat) {
      setMaterial(mat);

      if (user && recordRead) {
        // Record 'dibaca' once per load; refresh events should not write/read it again
        await AccessLogService.logAction(mat, user, "dibaca");

        // Load user rating
        const userRating = await RatingService.getRating(mat.id, user.id);
        setRating(userRating);
      } else if (user) {
        const userRating = await RatingService.getRating(mat.id, user.id);
        setRating(userRating);
      }
    }

    // Load recent access logs
    const allLogs = await AccessLogService.getAll();
    setAccessLogs(allLogs);
    setIsLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    const handleUpdate = () => loadData(false);
    window.addEventListener("arsip_storage_update", handleUpdate);
    window.addEventListener("arsip_auth_change", handleUpdate);
    return () => {
      window.removeEventListener("arsip_storage_update", handleUpdate);
      window.removeEventListener("arsip_auth_change", handleUpdate);
    };
  }, [materialId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Quick Login Helper if user is not logged in
  const handleQuickLogin = (role: "siswa" | "guru") => {
    if (role === "siswa") {
      AuthService.login("siswa001", "siswa");
    } else {
      AuthService.login("guru4", "guru");
    }
    loadData();
    showToast(
      `Berhasil masuk sebagai ${role === "siswa" ? "Siswa (siswa001)" : "Guru (guru4)"}!`,
    );
  };

  // Handle Star Rating Click
  const handleStarClick = async (starValue: number) => {
    if (!currentUser) {
      showToast("Silakan masuk terlebih dahulu untuk memberikan penilaian.");
      return;
    }

    if (!material) return;

    setRating(starValue);
    await RatingService.setRating(material.id, currentUser.id, starValue);
    setRatingSuccess(true);
    showToast(`⭐ Terima kasih! Anda memberikan ${starValue} bintang.`);
    setTimeout(() => setRatingSuccess(false), 3000);
  };

  // Handle Download Click
  const handleDownload = async () => {
    if (!material) return;

    if (!material.allowDownload) {
      showToast("Unduhan dinonaktifkan oleh guru untuk materi ini.");
      return;
    }

    if (!currentUser) {
      showToast("Silakan masuk terlebih dahulu untuk mengunduh.");
      return;
    }

    setIsDownloading(true);

    try {
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#0F6BFF", "#10B981", "#F59E0B", "#3B82F6"],
      });

      // Log 'diunduh' in access history
      await AccessLogService.logAction(material, currentUser, "diunduh");
      const updatedLogs = await AccessLogService.getAll();
      setAccessLogs(updatedLogs);

      // Download from Supabase Storage if filePath is available
      if (material.filePath && supabase) {
        const { data, error } = await supabase.storage
          .from("materials")
          .download(material.filePath);

        if (error) throw error;

        const downloadUrl = URL.createObjectURL(data);
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download =
          material.fileName ||
          `${material.title.replace(/\s+/g, "_")}.${material.kind === "ppt" ? "pptx" : "pdf"}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
        showToast(`Berkas "${material.title}" berhasil diunduh!`);
        return;
      }

      // Fallback: Downloadable text summary if no file is available
      const summaryBlob = new Blob(
        [
          `ARSIP MATERI TAMBAHAN SDN 5 WAY GALIH\n\nJudul Materi: ${material.title}\nMata Pelajaran: ${material.subject}\nKelas: ${material.grade}\nPenyusun: ${material.ownerName}\n\n${material.description}\n`,
        ],
        { type: "text/plain;charset=utf-8" },
      );
      const fallbackUrl = URL.createObjectURL(summaryBlob);
      const fallbackLink = document.createElement("a");
      fallbackLink.href = fallbackUrl;
      fallbackLink.download = `${material.title.replace(/\s+/g, "_")}_ringkasan.txt`;
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
      URL.revokeObjectURL(fallbackUrl);
      showToast(`Ringkasan materi "${material.title}" berhasil diunduh!`);
    } catch (e) {
      console.error(e);
      showToast("Terjadi kesalahan saat mengunduh berkas.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 mx-auto mb-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Memuat materi pembelajaran...</p>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-heading text-white">
          Materi Tidak Ditemukan
        </h2>
        <p className="text-sm text-slate-400">
          Materi yang Anda cari mungkin telah dihapus atau tidak tersedia.
        </p>
        <Link
          href="/#katalog"
          className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-blue-600 text-white shadow-2xl flex items-center gap-3 border border-white/20 animate-fade-in text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/#katalog"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke katalog</span>
        </Link>

        {currentUser && (
          <div className="text-xs text-slate-400">
            Akses aktif:{" "}
            <strong className="text-blue-300">
              {currentUser.fullName} ({currentUser.role})
            </strong>
          </div>
        )}
      </div>

      {/* Main Material Title */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
          {material.title}
        </h1>
        <p className="text-sm text-slate-300 mt-2">{material.description}</p>
      </div>

      {/* =========================================================================
          IF USER IS NOT LOGGED IN: PROMPT FOR SIGN IN
          ========================================================================= */}
      {mounted && !currentUser && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/40 bg-blue-950/30 text-white shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading">
                Akses Materi Memerlukan Masuk
              </h3>
              <p className="text-xs text-blue-200">
                Sesuai aturan sekolah, hanya siswa dan guru terdaftar yang dapat
                membaca isi arsip lengkap atau mengunduh.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => handleQuickLogin("siswa")}
              className="btn-primary px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Masuk Cepat sebagai Siswa (siswa001)</span>
            </button>

            <button
              onClick={() => handleQuickLogin("guru")}
              className="btn-glass px-4 py-2.5 rounded-xl font-medium text-slate-200 flex items-center gap-2"
            >
              <span>Masuk sebagai Guru (guru4)</span>
            </button>

            <Link
              href={`/masuk?redirect=/materi/${material.id}`}
              className="text-slate-400 hover:text-white underline ml-2"
            >
              Halaman Masuk Lengkap
            </Link>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN GRID: DOCUMENT PREVIEW (LEFT) VS MATERIAL DETAILS & ACTIONS (RIGHT)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Interactive Document Previewer) */}
        <div className="lg:col-span-7">
          <DocumentPreview
            material={material}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />
        </div>

        {/* Right Column (Detail Materi, Rating, Download Button) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Detail Modul */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-lg font-bold font-heading text-white border-b border-white/10 pb-3">
              Detail materi
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Mata pelajaran</span>
                <span className="font-semibold text-white">
                  {material.subject}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Kelas</span>
                <span className="font-semibold text-blue-400">
                  Kelas {material.grade}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Jenis</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    material.kind === "pdf"
                      ? "text-rose-400 bg-rose-950/60 border border-rose-800/40"
                      : material.kind === "ppt"
                        ? "text-orange-400 bg-orange-950/60 border border-orange-800/40"
                        : "text-amber-400 bg-amber-950/60 border border-amber-800/40"
                  }`}
                >
                  {material.kind.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Diunggah oleh</span>
                <span className="font-medium text-slate-200">
                  {material.ownerName}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tanggal</span>
                <span className="font-mono text-slate-300">
                  {material.publishedAt}
                </span>
              </div>

              {material.fileName && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-slate-400">Nama berkas</span>
                  <span className="font-mono text-[11px] text-slate-300 truncate max-w-[180px]">
                    {material.fileName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Nilai Modul Ini (Star Rating) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">
                Nilai materi ini
              </h4>
              <span className="text-xs text-amber-400 font-semibold">
                {rating > 0 ? `${rating} dari 5 bintang` : "Belum dinilai"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = (hoverRating || rating) >= starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleStarClick(starVal)}
                    className="p-1 text-slate-600 hover:scale-110 transition-transform"
                    aria-label={`Beri nilai ${starVal} bintang`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-400"
                          : "fill-transparent text-slate-600"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {ratingSuccess && (
              <p className="text-xs text-emerald-400 animate-fade-in flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Penilaian Anda telah tersimpan!
              </p>
            )}
          </div>

          {/* Download Allowance Banner & Action Button */}
          <div className="space-y-3">
            {material.allowDownload ? (
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center gap-2.5 text-xs text-blue-200">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Guru mengizinkan modul ini diunduh.</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Guru membatasi modul ini hanya untuk dibaca langsung (unduh
                  dinonaktifkan).
                </span>
              </div>
            )}

            {/* Big Action Button: Unduh Modul */}
            {material.allowDownload ? (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full btn-primary py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                {isDownloading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Unduh Materi</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-4 rounded-xl text-sm font-medium bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-slate-600" />
                <span>Unduhan Dilarang Guru</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="w-full btn-glass py-3 px-4 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Buka layar penuh</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM ROW: RIWAYAT AKSES (LEFT) VS BUTUH BANTUAN? (RIGHT)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-white/5">
        {/* Riwayat Akses Table (Left - 8 columns) */}
        <div className="lg:col-span-8 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xl font-bold font-heading text-white">
                Riwayat Akses
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Catatan interaksi materi yang telah Anda buka atau unduh.
              </p>
            </div>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="pb-3 font-medium">Modul</th>
                  <th className="pb-3 font-medium text-center">Jenis</th>
                  <th className="pb-3 font-medium text-center">Kelas</th>
                  <th className="pb-3 font-medium">Terakhir dibuka</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {accessLogs.slice(0, 5).map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 font-medium text-slate-200">
                      <p className="truncate max-w-[200px] text-white font-semibold">
                        {log.moduleTitle}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {log.teacherName}
                      </p>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-semibold text-slate-300 uppercase text-[10px]">
                        {log.kind}
                      </span>
                    </td>
                    <td className="py-3 text-center text-slate-300">
                      Kelas {log.grade}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3 text-center">
                      {log.action === "diunduh" && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          Diunduh
                        </span>
                      )}
                      {log.action === "dibaca" && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-400 border border-blue-800/60">
                          Dibaca
                        </span>
                      )}
                      {log.action === "baru" && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800/60">
                          Baru
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Butuh Bantuan? Card (Right - 4 columns) */}
        <div className="lg:col-span-4 rounded-3xl p-7 bg-gradient-to-br from-blue-950/80 to-indigo-950/80 border border-blue-500/30 text-white shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-900 flex items-center justify-center font-bold text-xl shadow-lg">
              ?
            </div>
            <h3 className="text-2xl font-bold font-heading text-white">
              Butuh Bantuan?
            </h3>
            <p className="text-xs text-blue-200 leading-relaxed">
              Modul tidak bisa dibuka atau berkas tidak muncul? Hubungi kami
              untuk bantuan langsung dari admin sekolah.
            </p>
          </div>

          <button
            onClick={() => setContactOpen(true)}
            className="w-full btn-glass py-3 px-4 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/30 cursor-pointer"
          >
            Contact Person
          </button>
        </div>
      </div>

      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}
