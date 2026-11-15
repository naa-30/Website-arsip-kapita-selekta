export type UserRole = 'guru' | 'siswa' | 'admin';

export interface UserProfile {
  id: string;
  loginId: string;       // guru4, siswa001
  fullName: string;
  role: UserRole;
  grade?: number;        // e.g. 4 for Guru Kelas 4 or Siswa Kelas 4
  email?: string;
  avatar?: string;
}

export type MaterialKind = 'pdf' | 'ppt' | 'canvas';
export type MaterialStatus = 'terbit' | 'draf';

export interface Material {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  subject: string;       // Matematika, IPAS, Bahasa Indonesia, Pendidikan Pancasila, etc.
  grade: number;         // 1 to 6
  kind: MaterialKind;
  description: string;
  pageCount?: number;    // or slide count
  canvasUrl?: string;
  fileName?: string;
  fileSize?: string;
  allowDownload: boolean;
  status: MaterialStatus;
  publishedAt: string;   // ISO string or formatted date
  createdAt: string;
  // Content simulation for preview
  previewContent?: {
    pages: {
      pageNumber: number;
      title: string;
      subtitle?: string;
      content: string[];
      diagramType?: 'fractions' | 'ecosystem' | 'watercycle' | 'story' | 'multiplication' | 'culture';
      points?: string[];
      exercise?: string;
    }[];
  };
}

export interface MaterialRating {
  moduleId: string;
  userId: string;
  stars: number;
  ratedAt: string;
}

export type AccessAction = 'baru' | 'dibaca' | 'diunduh';

export interface AccessLogItem {
  id: string;
  moduleId: string;
  moduleTitle: string;
  subject: string;
  grade: number;
  kind: MaterialKind;
  teacherName: string;
  userId: string;
  action: AccessAction;
  timestamp: string;
}
