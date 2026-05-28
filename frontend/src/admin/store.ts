import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminAuthState {
  isAuthed: boolean;
  email: string | null;
  name: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
}

/**
 * Lightweight client-side admin auth. The real backend integration can be wired later;
 * for now this keeps the demo functional and allows the protected route flow.
 *
 * Demo credentials: admin@auratech.io / admin123
 */
export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthed: false,
      email: null,
      name: null,
      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 350));
        if (email.trim().toLowerCase() === "admin@auratech.io" && password === "admin123") {
          set({ isAuthed: true, email, name: "Aura Admin" });
          return { ok: true };
        }
        return { ok: false, message: "Sai email hoặc mật khẩu." };
      },
      logout: () => set({ isAuthed: false, email: null, name: null }),
    }),
    { name: "auratech-admin-auth" }
  )
);
