'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MaterialService, AuthService } from '@/lib/storage';
import { INITIAL_MATERIALS } from '@/lib/mock-data';
import { Material, MaterialKind, MaterialStatus, UserProfile } from '@/lib/types';
import {
  Upload,
  FileText,
  Presentation,
  Layout,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit3,
  ExternalLink,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Eye,
  Check
} from 'lucide-react';

interface SimulatedUploadItem {
  id: string;
  name: string;
  pages: number;
  status: 'Mengunggah' | 'Selesai' | 'Gagal';
  progress: number;
}

export default function DashboardGuruPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Matematika');
  const [grade, setGrade] = useState<number>(4);
  const [kind, setKind] = useState<MaterialKind>('pdf');
  const [canvasUrl, setCanvasUrl] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [pageCount, setPageCount] = useState<number>(14);

  // Upload simulation state
  const [uploadItems, setUploadItems] = useState<SimulatedUploadItem[]>([
    { id: 'sim-1', name: 'Modul Ajar Pecahan.pdf', pages: 14, status: 'Mengunggah', progress: 60 },
    { id: 'sim-2', name: 'Lembar Kerja Perkalian.pdf', pages: 8, status: 'Gagal', progress: 10 },
    { id: 'sim-3', name: 'Ekosistem di Sekitar Kita.pdf', pages: 22, status: 'Selesai', progress: 100 },
    { id: 'sim-4', name: 'Peta Konsep Siklus Air', pages: 1, status: 'Selesai', progress: 100 },
  ]);

  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editing modal state
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const loadData = async () => {
    const user = AuthService.getCurrentUser();
    // If not logged in, auto-login as demo guru for smooth demo testing
    if (!user) {
      const demoGuru = AuthService.login('guru4', 'guru');
      setCurrentUser(demoGuru);
    } else {
      setCurrentUser(user);
    }

    const allMaterials = await MaterialService.getAll();
    setMaterials(allMaterials);
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

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Drag & Drop / File selection
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const file = fileList[0];
    const fileName = file.name;
    const isPpt = fileName.endsWith('.ppt') || fileName.endsWith('.pptx');
    const detectedKind: MaterialKind = isPpt ? 'ppt' : 'pdf';
    const estimatedPages = Math.floor(Math.random() * 12) + 6;

    // Prefill form if empty
    if (!title) {
      const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }
    setKind(detectedKind);
    setPageCount(estimatedPages);

    const newItem: SimulatedUploadItem = {
      id: `up-${Date.now()}`,
      name: fileName,
      pages: estimatedPages,
      status: 'Mengunggah',
      progress: 25,
    };

    setUploadItems((prev) => [newItem, ...prev]);

    // Animate upload progress
    setTimeout(() => {
      setUploadItems((prev) =>
        prev.map((item) => (item.id === newItem.id ? { ...item, progress: 75 } : item))
      );
    }, 400);

    setTimeout(() => {
      setUploadItems((prev) =>
        prev.map((item) => (item.id === newItem.id ? { ...item, progress: 100, status: 'Selesai' } : item))
      );
      triggerToast(`Berkas "${fileName}" berhasil diunggah!`);
    }, 900);
  };

  // Submit / Publish Material
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      triggerToast('Mohon masukkan judul materi.');
      return;
    }

    setIsPublishing(true);

    try {
      const ownerName = currentUser?.fullName || 'Guru Kelas 4';
      const ownerId = currentUser?.id || 'user-guru-4';

      const now = new Date();
      const dateFormatted = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()}`;

      await MaterialService.create({
        ownerId,
        ownerName,
        title: title.trim(),
        subject,
        grade,
        kind,
        description: description.trim() || `Materi tambahan ${subject} untuk kelas ${grade}. Dibuat oleh ${ownerName}.`,
        pageCount: kind === 'canvas' ? 1 : pageCount,
        canvasUrl: kind === 'canvas' ? (canvasUrl.trim() || 'https://canva.com/design/SDN5Demo/view') : undefined,
        fileName: kind === 'canvas' ? undefined : `${title.replace(/\s+/g, '_')}.${kind === 'ppt' ? 'pptx' : 'pdf'}`,
        fileSize: '3.2 MB',
        allowDownload,
        status: 'terbit',
        publishedAt: dateFormatted,
        previewContent: {
          pages: [
            {
              pageNumber: 1,
              title: title.trim(),
              subtitle: `${subject} Kelas ${grade} — SDN 5 Way Galih`,
              content: [
                description || 'Materi pembelajaran pendukung untuk memperdalam pemahaman siswa.',
                'Disusun khusus agar mudah dipelajari kapan saja oleh siswa.',
                'Silakan pelajari rangkuman konsep dan kerjakan latihan soal di bawah ini.'
              ],
              points: [
                'Konsep Inti Pembahasan',
                'Contoh Penerapan Praktis',
                'Uji Pemahaman Singkat'
              ],
              exercise: 'Latihan mandiri: Catat poin-poin penting di atas pada buku catatanmu!'
            }
          ]
        }
      });

      triggerToast(`🎉 Berhasil menerbitkan materi "${title}"! Tersedia langsung di Katalog.`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCanvasUrl('');
      loadData();
    } catch (err) {
      console.error(err);
      triggerToast('Gagal menerbitkan materi.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Quick toggle status: Terbit <-> Draf
  const handleToggleStatus = async (material: Material) => {
    const newStatus: MaterialStatus = material.status === 'terbit' ? 'draf' : 'terbit';
    await MaterialService.update(material.id, { status: newStatus });
    triggerToast(`Status materi "${material.title}" diubah menjadi ${newStatus.toUpperCase()}`);
    loadData();
  };

  // Quick toggle allowDownload
  const handleToggleDownload = async (material: Material) => {
    const updated = !material.allowDownload;
    await MaterialService.update(material.id, { allowDownload: updated });
    triggerToast(`Izin unduh siswa: ${updated ? 'DIIZINKAN' : 'DILARANG'}`);
    loadData();
  };

  // Delete material
  const handleDelete = async (material: Material) => {
    if (confirm(`Hapus materi "${material.title}" dari arsip?`)) {
      await MaterialService.delete(material.id);
      triggerToast(`Materi "${material.title}" telah dihapus.`);
      loadData();
    }
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingMaterial) return;
    await MaterialService.update(editingMaterial.id, {
      title: editingMaterial.title,
      subject: editingMaterial.subject,
      grade: editingMaterial.grade,
      status: editingMaterial.status,
      allowDownload: editingMaterial.allowDownload,
    });
    setEditingMaterial(null);
    triggerToast('Perubahan materi berhasil disimpan.');
    loadData();
  };

  // Initial mounted state
  // Render normally for SSR and hydrate with localStorage data on mount

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-blue-600 text-white shadow-2xl flex items-center gap-3 border border-white/20 animate-fade-in text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight">
            Unggah Materi
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Materi yang Anda terbitkan langsung tersedia untuk siswa sesuai kelas yang ditentukan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#katalog"
            className="btn-glass px-4 py-2.5 text-xs flex items-center gap-2 text-slate-300 hover:text-white"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Lihat Katalog Siswa</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Upload Area & Upload Progress (Left) vs Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Upload Progress & DropZone) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Tabel Progres Unggah */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Progres Unggahan</span>
              <span className="text-[11px] text-blue-400 font-normal">Otomatis sinkron</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="pb-3 font-medium">Judul</th>
                    <th className="pb-3 font-medium text-center">Halaman</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right">Progres</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {uploadItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-medium text-slate-200 truncate max-w-[140px]">
                        {item.name}
                      </td>
                      <td className="py-3 text-center text-slate-400 font-mono">
                        {item.pages}
                      </td>
                      <td className="py-3 text-center">
                        {item.status === 'Selesai' && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                            Selesai
                          </span>
                        )}
                        {item.status === 'Mengunggah' && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800/50 animate-pulse">
                            Mengunggah
                          </span>
                        )}
                        {item.status === 'Gagal' && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-400 border border-rose-800/50">
                            Gagal
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                item.status === 'Selesai'
                                  ? 'bg-emerald-500'
                                  : item.status === 'Gagal'
                                  ? 'bg-rose-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-400 text-[11px] w-8 text-right">
                            {item.progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drag & Drop Area (DropZone) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-dashed border-white/15 hover:border-blue-500/50 transition-all text-center flex flex-col items-center justify-center group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".pdf,.ppt,.pptx"
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shadow-blue-500/10">
              <FileText className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-bold font-heading text-white mb-2">
              Seret berkas ke sini
            </h4>
            
            <p className="text-xs text-slate-300 max-w-sm mb-5 leading-relaxed">
              Format yang diterima: PDF, presentasi PPT, atau dokumen modul ajar. Anda dapat memilih berkas dari komputer atau HP.
            </p>

            <button
              type="button"
              className="btn-glass px-5 py-2.5 text-xs font-semibold text-white group-hover:bg-blue-600 group-hover:border-blue-500 transition-all"
            >
              Pilih berkas
            </button>
          </div>

        </div>

        {/* Right Column (Form Detail Materi) */}
        <div className="lg:col-span-6">
          <div className="glass-panel p-7 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold font-heading text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Detail Informasi Materi
            </h3>

            <form onSubmit={handlePublish} className="space-y-5">
              
              {/* Judul Materi */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Judul materi
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pecahan dan Penjumlahannya"
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                />
              </div>

              {/* Deskripsi Singkat */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Deskripsi singkat (ringkasan untuk siswa)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan ringkasan materi atau tujuan pembelajaran singkat..."
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm resize-none"
                />
              </div>

              {/* Grid 2 Columns: Mata Pelajaran & Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Mata pelajaran
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full glass-input px-3.5 py-3 rounded-xl text-sm bg-[#090f20]"
                  >
                    <option value="Matematika">Matematika</option>
                    <option value="IPAS">IPAS</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                    <option value="Seni Budaya">Seni Budaya</option>
                    <option value="PJOK">PJOK</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Kelas
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full glass-input px-3.5 py-3 rounded-xl text-sm bg-[#090f20]"
                  >
                    <option value={1}>Kelas 1</option>
                    <option value={2}>Kelas 2</option>
                    <option value={3}>Kelas 3</option>
                    <option value={4}>Kelas 4</option>
                    <option value={5}>Kelas 5</option>
                    <option value={6}>Kelas 6</option>
                  </select>
                </div>
              </div>

              {/* Jenis Berkas Segmented Button */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Jenis berkas
                </label>
                <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-950/80 border border-white/5">
                  <button
                    type="button"
                    onClick={() => setKind('pdf')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      kind === 'pdf'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => setKind('ppt')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      kind === 'ppt'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    PPT
                  </button>

                  <button
                    type="button"
                    onClick={() => setKind('canvas')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      kind === 'canvas'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                    Canvas
                  </button>
                </div>
              </div>

              {/* Tautan Canva jika Canvas dipilih */}
              {kind === 'canvas' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-medium text-amber-300 mb-2">
                    Tautan Canva (Link Desain / Presentasi Canva)
                  </label>
                  <input
                    type="url"
                    value={canvasUrl}
                    onChange={(e) => setCanvasUrl(e.target.value)}
                    placeholder="https://www.canva.com/design/.../view"
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm border-amber-500/30 text-amber-200"
                  />
                </div>
              )}

              {/* Saklar "Boleh diunduh siswa" */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Boleh diunduh siswa
                  </p>
                  <p className="text-xs text-slate-400">
                    {allowDownload
                      ? 'Siswa dapat membaca dan mengunduh berkas'
                      : 'Siswa hanya dapat membaca langsung (unduhan terkunci)'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Tombol Terbitkan Materi */}
              <button
                type="submit"
                disabled={isPublishing}
                className="w-full btn-primary py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition-all mt-4"
              >
                {isPublishing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Terbitkan Materi</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* =========================================================================
          TABEL: MATERI SAYA
          ========================================================================= */}
      <section className="glass-panel p-7 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-heading text-white">
              Materi Saya
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola, ubah status terbit, atau atur hak unduh materi ajar Anda.
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
            Total koleksi: <strong className="text-white">{materials.length} materi</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-400 font-medium">
                <th className="pb-3 pl-2">Judul</th>
                <th className="pb-3 text-center">Jenis</th>
                <th className="pb-3 text-center">Kelas</th>
                <th className="pb-3">Diunggah</th>
                <th className="pb-3 text-center">Unduhan</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {materials.map((mat) => (
                <tr key={mat.id} className="hover:bg-white/5 transition-colors group">
                  
                  {/* Judul */}
                  <td className="py-4 pl-2 font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-500/20 text-blue-400 shrink-0">
                        {mat.kind === 'pdf' && <FileText className="w-4 h-4" />}
                        {mat.kind === 'ppt' && <Presentation className="w-4 h-4" />}
                        {mat.kind === 'canvas' && <Layout className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">
                          {mat.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {mat.subject} · {mat.ownerName}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Jenis */}
                  <td className="py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                        mat.kind === 'pdf'
                          ? 'text-rose-400 bg-rose-950/50 border border-rose-800/40'
                          : mat.kind === 'ppt'
                          ? 'text-orange-400 bg-orange-950/50 border border-orange-800/40'
                          : 'text-amber-400 bg-amber-950/50 border border-amber-800/40'
                      }`}
                    >
                      {mat.kind.toUpperCase()}
                    </span>
                  </td>

                  {/* Kelas */}
                  <td className="py-4 text-center text-xs text-slate-300 font-medium">
                    Kelas {mat.grade}
                  </td>

                  {/* Tanggal Diunggah */}
                  <td className="py-4 text-xs text-slate-400 font-mono">
                    {mat.publishedAt || 'Belum'}
                  </td>

                  {/* Izin Unduh */}
                  <td className="py-4 text-center">
                    <button
                      onClick={() => handleToggleDownload(mat)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        mat.allowDownload
                          ? 'bg-blue-950/70 text-blue-300 border border-blue-800/50 hover:bg-blue-900/60'
                          : 'bg-amber-950/70 text-amber-300 border border-amber-800/50 hover:bg-amber-900/60'
                      }`}
                      title="Klik untuk ubah izin unduh"
                    >
                      {mat.allowDownload ? (
                        <>
                          <Unlock className="w-3 h-3 text-blue-400" />
                          <span>Boleh</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Terkunci</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Status Terbit / Draf */}
                  <td className="py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(mat)}
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        mat.status === 'terbit'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                      }`}
                      title="Klik untuk ubah status (Terbit / Draf)"
                    >
                      {mat.status === 'terbit' ? 'Terbit' : 'Draf'}
                    </button>
                  </td>

                  {/* Aksi */}
                  <td className="py-4 text-right pr-2">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/materi/${mat.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Buka pratinjau materi"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => setEditingMaterial(mat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-blue-950/40 transition-colors"
                        title="Ubah materi"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(mat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Hapus materi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          MODAL UBAH MATERI
          ========================================================================= */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-blue-500/30 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-heading">Ubah Materi</h3>
              <button
                onClick={() => setEditingMaterial(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Judul</label>
                <input
                  type="text"
                  value={editingMaterial.title}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, title: e.target.value })
                  }
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={editingMaterial.subject}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, subject: e.target.value })
                    }
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kelas</label>
                  <select
                    value={editingMaterial.grade}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, grade: Number(e.target.value) })
                    }
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-sm bg-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>Kelas {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Status Publikasi</label>
                <select
                  value={editingMaterial.status}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      status: e.target.value as MaterialStatus,
                    })
                  }
                  className="w-full glass-input px-3 py-2.5 rounded-xl text-sm bg-slate-900"
                >
                  <option value="terbit">Terbit (Dapat dilihat siswa)</option>
                  <option value="draf">Draf (Disimpan sementara)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/5">
                <span className="text-slate-200">Boleh diunduh siswa:</span>
                <button
                  type="button"
                  onClick={() =>
                    setEditingMaterial({
                      ...editingMaterial,
                      allowDownload: !editingMaterial.allowDownload,
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    editingMaterial.allowDownload
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {editingMaterial.allowDownload ? 'Diizinkan' : 'Dilarang'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingMaterial(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="btn-primary px-5 py-2 text-xs font-semibold"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
