import { Material, UserProfile, AccessLogItem, MaterialRating } from './types';
import { INITIAL_MATERIALS, INITIAL_ACCESS_LOGS, DEMO_USERS } from './mock-data';

const STORAGE_KEYS = {
  MATERIALS: 'arsip_sdn5_materials',
  ACCESS_LOGS: 'arsip_sdn5_access_logs',
  RATINGS: 'arsip_sdn5_ratings',
  CURRENT_USER: 'arsip_sdn5_current_user',
};

// Safe localStorage helper for SSR
function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event so other components update synchronously
    window.dispatchEvent(new Event('arsip_storage_update'));
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
}

/* =================================================================
   MATERIALS SERVICE
   ================================================================= */
export const MaterialService = {
  async getAll(): Promise<Material[]> {
    return getFromStorage<Material[]>(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
  },

  async getById(id: string): Promise<Material | undefined> {
    const list = await this.getAll();
    return list.find((m) => m.id === id);
  },

  async getByOwner(ownerId: string): Promise<Material[]> {
    const list = await this.getAll();
    return list.filter((m) => m.ownerId === ownerId);
  },

  async create(material: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
    const list = await this.getAll();
    const newMaterial: Material = {
      ...material,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newMaterial, ...list];
    setToStorage(STORAGE_KEYS.MATERIALS, updated);
    return newMaterial;
  },

  async update(id: string, updates: Partial<Material>): Promise<Material | null> {
    const list = await this.getAll();
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const updatedMaterial = { ...list[index], ...updates };
    list[index] = updatedMaterial;
    setToStorage(STORAGE_KEYS.MATERIALS, list);
    return updatedMaterial;
  },

  async delete(id: string): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((m) => m.id !== id);
    setToStorage(STORAGE_KEYS.MATERIALS, filtered);
    return true;
  },

  async resetToDemo(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.MATERIALS);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_LOGS);
      localStorage.removeItem(STORAGE_KEYS.RATINGS);
      setToStorage(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
      setToStorage(STORAGE_KEYS.ACCESS_LOGS, INITIAL_ACCESS_LOGS);
      window.dispatchEvent(new Event('arsip_storage_update'));
    }
  }
};

/* =================================================================
   ACCESS LOGS SERVICE
   ================================================================= */
export const AccessLogService = {
  async getAll(): Promise<AccessLogItem[]> {
    return getFromStorage<AccessLogItem[]>(STORAGE_KEYS.ACCESS_LOGS, INITIAL_ACCESS_LOGS);
  },

  async getByUser(userId: string): Promise<AccessLogItem[]> {
    const logs = await this.getAll();
    return logs.filter((log) => log.userId === userId);
  },

  async logAction(material: Material, user: UserProfile, action: 'dibaca' | 'diunduh'): Promise<void> {
    const logs = await this.getAll();
    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

    // Check if an entry already exists for this user & material
    const existingIndex = logs.findIndex((l) => l.moduleId === material.id && l.userId === user.id);

    if (existingIndex >= 0) {
      // If already 'diunduh', don't downgrade to 'dibaca'
      if (logs[existingIndex].action === 'diunduh' && action === 'dibaca') {
        logs[existingIndex].timestamp = formattedDate;
      } else {
        logs[existingIndex].action = action;
        logs[existingIndex].timestamp = formattedDate;
      }
      setToStorage(STORAGE_KEYS.ACCESS_LOGS, [...logs]);
    } else {
      const newLog: AccessLogItem = {
        id: `log-${Date.now()}`,
        moduleId: material.id,
        moduleTitle: material.title,
        subject: material.subject,
        grade: material.grade,
        kind: material.kind,
        teacherName: material.ownerName,
        userId: user.id,
        action,
        timestamp: formattedDate,
      };
      setToStorage(STORAGE_KEYS.ACCESS_LOGS, [newLog, ...logs]);
    }
  }
};

/* =================================================================
   RATINGS SERVICE
   ================================================================= */
export const RatingService = {
  async getRating(moduleId: string, userId: string): Promise<number> {
    const ratings = getFromStorage<MaterialRating[]>(STORAGE_KEYS.RATINGS, []);
    const found = ratings.find((r) => r.moduleId === moduleId && r.userId === userId);
    return found ? found.stars : 0;
  },

  async setRating(moduleId: string, userId: string, stars: number): Promise<void> {
    const ratings = getFromStorage<MaterialRating[]>(STORAGE_KEYS.RATINGS, []);
    const existingIndex = ratings.findIndex((r) => r.moduleId === moduleId && r.userId === userId);

    if (existingIndex >= 0) {
      ratings[existingIndex].stars = stars;
      ratings[existingIndex].ratedAt = new Date().toISOString();
    } else {
      ratings.push({
        moduleId,
        userId,
        stars,
        ratedAt: new Date().toISOString(),
      });
    }
    setToStorage(STORAGE_KEYS.RATINGS, ratings);
  }
};

/* =================================================================
   AUTH SERVICE (Session & Demo Accounts)
   ================================================================= */
export const AuthService = {
  getCurrentUser(): UserProfile | null {
    return getFromStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  login(loginId: string, role?: 'guru' | 'siswa'): UserProfile | null {
    const cleanId = loginId.trim().toLowerCase();
    
    // Check against demo accounts
    let found = DEMO_USERS.find(
      (u) => u.loginId.toLowerCase() === cleanId || u.email?.toLowerCase() === cleanId
    );

    // Dynamic fallback for any teacher/student ID
    if (!found && role) {
      found = {
        id: `user-${role}-${Date.now()}`,
        loginId: cleanId,
        fullName: role === 'guru' ? `Guru ${cleanId.toUpperCase()}` : `Siswa ${cleanId}`,
        role,
        grade: role === 'guru' ? 4 : 4,
        email: `${cleanId}@sdn5waygalih.sch.id`
      };
    }

    if (found) {
      setToStorage(STORAGE_KEYS.CURRENT_USER, found);
      return found;
    }

    return null;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      window.dispatchEvent(new Event('arsip_auth_change'));
    }
  }
};
