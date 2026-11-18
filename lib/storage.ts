import { Material, UserProfile, AccessLogItem, MaterialRating } from "./types";
import {
  INITIAL_MATERIALS,
  INITIAL_ACCESS_LOGS,
  DEMO_USERS,
} from "./mock-data";
import { isSupabaseConfigured, supabase } from "./supabase";

const STORAGE_KEYS = {
  CURRENT_USER: "arsip_sdn5_current_user",
};

function dispatchUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("arsip_storage_update"));
  }
}

function mapMaterial(row: any): Material {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerName: row.owner_name || "Guru Kelas 4",
    title: row.title,
    subject: row.subject,
    grade: row.grade,
    kind: row.kind,
    description: row.description || "",
    pageCount: row.page_count || 1,
    canvasUrl: row.canvas_url || undefined,
    fileName: row.file_name || undefined,
    fileSize: row.file_size || undefined,
    filePath: row.file_path || undefined,
    allowDownload: row.allow_download,
    status: row.status,
    publishedAt: row.published_at
      ? new Date(row.published_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "",
    createdAt: row.created_at,
    previewContent: row.preview_content || undefined,
  };
}

function mapAccessLog(row: any): AccessLogItem {
  const material = row.modules;
  return {
    id: String(row.id),
    moduleId: row.module_id,
    moduleTitle: material?.title || "",
    subject: material?.subject || "",
    grade: material?.grade || 0,
    kind: material?.kind || "pdf",
    teacherName: material?.owner_name || "",
    userId: row.user_id,
    action: row.action,
    timestamp: new Date(row.created_at).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function isMissingDatabaseTable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as { code?: string; message?: string };
  return (
    value.code === "PGRST205" ||
    (value.message || "").includes("Could not find the table")
  );
}

function normalizeDemoUserId(id: string, role?: string): string {
  if (id === "user-guru-4" || role === "guru")
    return "11111111-1111-1111-1111-111111111111";
  if (id === "user-siswa-001" || role === "siswa")
    return "22222222-2222-2222-2222-222222222222";
  return id;
}

function getLocalMaterials(): Material[] {
  if (typeof window === "undefined") return INITIAL_MATERIALS;
  const stored = localStorage.getItem("arsip_sdn5_materials");
  return stored ? JSON.parse(stored) : INITIAL_MATERIALS;
}

export const MaterialService = {
  async getAll(): Promise<Material[]> {
    if (!isSupabaseConfigured || !supabase) {
      return getLocalMaterials();
    }

    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingDatabaseTable(error)) return getLocalMaterials();
      throw error;
    }
    return (data || []).map(mapMaterial);
  },

  async getById(id: string): Promise<Material | undefined> {
    if (!isSupabaseConfigured || !supabase) {
      const list = await this.getAll();
      return list.find((m) => m.id === id);
    }

    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      if (isMissingDatabaseTable(error)) {
        const list = getLocalMaterials();
        return list.find((m) => m.id === id);
      }
      throw error;
    }
    return data ? mapMaterial(data) : undefined;
  },

  async getByOwner(ownerId: string): Promise<Material[]> {
    if (!isSupabaseConfigured || !supabase) {
      const list = await this.getAll();
      return list.filter((m) => m.ownerId === ownerId);
    }

    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingDatabaseTable(error)) {
        const list = getLocalMaterials();
        return list.filter((m) => m.ownerId === ownerId);
      }
      throw error;
    }
    return (data || []).map(mapMaterial);
  },

  async create(
    material: Omit<Material, "id" | "createdAt">,
  ): Promise<Material> {
    if (!isSupabaseConfigured || !supabase) {
      const list = await this.getAll();
      const created: Material = {
        ...material,
        id: `mat-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(
        "arsip_sdn5_materials",
        JSON.stringify([created, ...list]),
      );
      dispatchUpdate();
      return created;
    }

    const now = new Date().toISOString();
    const row = {
      owner_id: material.ownerId.startsWith("user-guru")
        ? "11111111-1111-1111-1111-111111111111"
        : material.ownerId,
      owner_name: material.ownerName,
      title: material.title,
      subject: material.subject,
      grade: material.grade,
      kind: material.kind,
      description: material.description,
      file_name: material.fileName || null,
      file_size: material.fileSize || null,
      file_path: material.filePath || null,
      canvas_url: material.canvasUrl || null,
      page_count: material.pageCount || 1,
      preview_content: material.previewContent || null,
      allow_download: material.allowDownload,
      status: material.status,
      published_at: now,
      created_at: now,
    };

    const { data, error } = await supabase
      .from("modules")
      .insert(row)
      .select("*")
      .single();
    if (error) {
      if (isMissingDatabaseTable(error)) {
        const created: Material = {
          ...material,
          id: `mat-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        const stored = getLocalMaterials();
        localStorage.setItem(
          "arsip_sdn5_materials",
          JSON.stringify([created, ...stored]),
        );
        dispatchUpdate();
        return created;
      }
      throw error;
    }
    dispatchUpdate();
    return mapMaterial(data);
  },

  async update(
    id: string,
    updates: Partial<Material>,
  ): Promise<Material | null> {
    if (!isSupabaseConfigured || !supabase) {
      const list = await this.getAll();
      const index = list.findIndex((m) => m.id === id);
      if (index < 0) return null;
      list[index] = { ...list[index], ...updates };
      localStorage.setItem("arsip_sdn5_materials", JSON.stringify(list));
      dispatchUpdate();
      return list[index];
    }

    const row: any = {};
    if (updates.ownerName !== undefined) row.owner_name = updates.ownerName;
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.subject !== undefined) row.subject = updates.subject;
    if (updates.grade !== undefined) row.grade = updates.grade;
    if (updates.kind !== undefined) row.kind = updates.kind;
    if (updates.description !== undefined)
      row.description = updates.description;
    if (updates.pageCount !== undefined) row.page_count = updates.pageCount;
    if (updates.canvasUrl !== undefined) row.canvas_url = updates.canvasUrl;
    if (updates.fileName !== undefined) row.file_name = updates.fileName;
    if (updates.fileSize !== undefined) row.file_size = updates.fileSize;
    if (updates.allowDownload !== undefined)
      row.allow_download = updates.allowDownload;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.previewContent !== undefined)
      row.preview_content = updates.previewContent;

    const { data, error } = await supabase
      .from("modules")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      if (isMissingDatabaseTable(error)) return null;
      throw error;
    }
    dispatchUpdate();
    return data ? mapMaterial(data) : null;
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      const list = (await this.getAll()).filter((m) => m.id !== id);
      localStorage.setItem("arsip_sdn5_materials", JSON.stringify(list));
      dispatchUpdate();
      return true;
    }

    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) {
      if (isMissingDatabaseTable(error)) return true;
      throw error;
    }
    dispatchUpdate();
    return true;
  },

  async resetToDemo(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem("arsip_sdn5_materials");
      localStorage.removeItem("arsip_sdn5_access_logs");
      localStorage.removeItem("arsip_sdn5_ratings");
      dispatchUpdate();
      return;
    }

    const { error } = await supabase
      .from("modules")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      if (isMissingDatabaseTable(error)) return;
      throw error;
    }
    dispatchUpdate();
  },
};

export const AccessLogService = {
  async getAll(): Promise<AccessLogItem[]> {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem("arsip_sdn5_access_logs");
      return stored ? JSON.parse(stored) : INITIAL_ACCESS_LOGS;
    }

    const { data, error } = await supabase
      .from("access_log")
      .select("*, modules(title, subject, grade, kind, owner_name)")
      .order("created_at", { ascending: false });
    if (error) {
      if (isMissingDatabaseTable(error)) {
        const stored = localStorage.getItem("arsip_sdn5_access_logs");
        return stored ? JSON.parse(stored) : INITIAL_ACCESS_LOGS;
      }
      throw error;
    }
    return (data || []).map(mapAccessLog);
  },

  async getByUser(userId: string): Promise<AccessLogItem[]> {
    const logs = await this.getAll();
    return logs.filter((log) => log.userId === userId);
  },

  async logAction(
    material: Material,
    user: UserProfile,
    action: "dibaca" | "diunduh",
  ): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem("arsip_sdn5_access_logs");
      const logs: AccessLogItem[] = stored
        ? JSON.parse(stored)
        : INITIAL_ACCESS_LOGS;
      const existingIndex = logs.findIndex(
        (l) => l.moduleId === material.id && l.userId === user.id,
      );
      const timestamp = new Date().toLocaleString("id-ID");
      if (existingIndex >= 0) {
        if (
          !(logs[existingIndex].action === "diunduh" && action === "dibaca")
        ) {
          logs[existingIndex].action = action;
        }
        logs[existingIndex].timestamp = timestamp;
        const updatedLog = logs.splice(existingIndex, 1)[0];
        logs.unshift(updatedLog);
      } else {
        logs.unshift({
          id: `log-${Date.now()}`,
          moduleId: material.id,
          moduleTitle: material.title,
          subject: material.subject,
          grade: material.grade,
          kind: material.kind,
          teacherName: material.ownerName,
          userId: user.id,
          action,
          timestamp,
        });
      }
      localStorage.setItem("arsip_sdn5_access_logs", JSON.stringify(logs));
      dispatchUpdate();
      return;
    }

    const { error } = await supabase.from("access_log").upsert(
      {
        module_id: material.id,
        user_id: normalizeDemoUserId(user.id, user.role),
        action,
      },
      { onConflict: "module_id,user_id" },
    );
    if (error) {
      if (isMissingDatabaseTable(error)) {
        const stored = localStorage.getItem("arsip_sdn5_access_logs");
        const logs: AccessLogItem[] = stored
          ? JSON.parse(stored)
          : INITIAL_ACCESS_LOGS;
        const existingIndex = logs.findIndex(
          (l) => l.moduleId === material.id && l.userId === user.id,
        );
        const timestamp = new Date().toLocaleString("id-ID");
        if (existingIndex >= 0) {
          if (
            !(logs[existingIndex].action === "diunduh" && action === "dibaca")
          )
            logs[existingIndex].action = action;
          logs[existingIndex].timestamp = timestamp;
        } else {
          logs.unshift({
            id: `log-${Date.now()}`,
            moduleId: material.id,
            moduleTitle: material.title,
            subject: material.subject,
            grade: material.grade,
            kind: material.kind,
            teacherName: material.ownerName,
            userId: user.id,
            action,
            timestamp,
          });
        }
        localStorage.setItem("arsip_sdn5_access_logs", JSON.stringify(logs));
        dispatchUpdate();
        return;
      }
      throw error;
    }
    dispatchUpdate();
  },
};

export const RatingService = {
  async getRating(moduleId: string, userId: string): Promise<number> {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem("arsip_sdn5_ratings");
      const ratings: MaterialRating[] = stored ? JSON.parse(stored) : [];
      return (
        ratings.find((r) => r.moduleId === moduleId && r.userId === userId)
          ?.stars || 0
      );
    }

    const { data, error } = await supabase
      .from("ratings")
      .select("stars")
      .eq("module_id", moduleId)
      .eq("user_id", normalizeDemoUserId(userId))
      .maybeSingle();
    if (error) {
      if (isMissingDatabaseTable(error)) {
        const stored = localStorage.getItem("arsip_sdn5_ratings");
        const ratings: MaterialRating[] = stored ? JSON.parse(stored) : [];
        return (
          ratings.find((r) => r.moduleId === moduleId && r.userId === userId)
            ?.stars || 0
        );
      }
      throw error;
    }
    return data?.stars || 0;
  },

  async setRating(
    moduleId: string,
    userId: string,
    stars: number,
  ): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem("arsip_sdn5_ratings");
      const ratings: MaterialRating[] = stored ? JSON.parse(stored) : [];
      const index = ratings.findIndex(
        (r) => r.moduleId === moduleId && r.userId === userId,
      );
      if (index >= 0) {
        ratings[index].stars = stars;
      } else {
        ratings.push({
          moduleId,
          userId,
          stars,
          ratedAt: new Date().toISOString(),
        });
      }
      localStorage.setItem("arsip_sdn5_ratings", JSON.stringify(ratings));
      dispatchUpdate();
      return;
    }

    const { error } = await supabase.from("ratings").upsert(
      {
        module_id: moduleId,
        user_id: normalizeDemoUserId(userId),
        stars: stars > 0 ? stars : null,
      },
      { onConflict: "module_id,user_id" },
    );
    if (error) {
      if (isMissingDatabaseTable(error)) {
        const stored = localStorage.getItem("arsip_sdn5_ratings");
        const ratings: MaterialRating[] = stored ? JSON.parse(stored) : [];
        const index = ratings.findIndex(
          (r) => r.moduleId === moduleId && r.userId === userId,
        );
        if (index >= 0)
          ratings[index] = {
            ...ratings[index],
            stars,
            ratedAt: new Date().toISOString(),
          };
        else
          ratings.push({
            moduleId,
            userId,
            stars,
            ratedAt: new Date().toISOString(),
          });
        localStorage.setItem("arsip_sdn5_ratings", JSON.stringify(ratings));
        dispatchUpdate();
        return;
      }
      throw error;
    }
    dispatchUpdate();
  },
};

export const AuthService = {
  getCurrentUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("arsip_sdn5_current_user");
    if (!stored) return null;

    const user = JSON.parse(stored) as UserProfile;
    const normalizedId = normalizeDemoUserId(user.id, user.role);
    if (normalizedId !== user.id) {
      const normalized = { ...user, id: normalizedId };
      localStorage.setItem(
        "arsip_sdn5_current_user",
        JSON.stringify(normalized),
      );
      return normalized;
    }
    return user;
  },

  login(loginId: string, role?: "guru" | "siswa"): UserProfile | null {
    const cleanId = loginId.trim().toLowerCase();
    let found = DEMO_USERS.find(
      (user) =>
        user.loginId.toLowerCase() === cleanId ||
        user.email?.toLowerCase() === cleanId,
    );

    if (!found && role) {
      found = {
        id: `user-${role}-${Date.now()}`,
        loginId: cleanId,
        fullName:
          role === "guru"
            ? `Guru ${cleanId.toUpperCase()}`
            : `Siswa ${cleanId}`,
        role,
        grade: 4,
        email: `${cleanId}@sdn5waygalih.sch.id`,
      };
    }

    if (found && typeof window !== "undefined") {
      localStorage.setItem("arsip_sdn5_current_user", JSON.stringify(found));
      window.dispatchEvent(new Event("arsip_storage_update"));
      window.dispatchEvent(new Event("arsip_auth_change"));
    }

    return found || null;
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("arsip_sdn5_current_user");
      window.dispatchEvent(new Event("arsip_auth_change"));
    }
  },
};
