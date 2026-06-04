import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Auth } from "../api/client";
import { getApiErrorMessage } from "../api/client";
import type { UserResponse } from "../types/api";

interface AdminAuthState {
  isAuthed: boolean;
  email: string | null;
  name: string | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  hydrateFromMainAuth: () => Promise<void>;
}

/**
 * Real backend-integrated admin auth using shared JWT cookie (AUTH_TOKEN).
 * Login uses the same /auth/login. After success, checks /users/me for ADMIN role.
 * Uses withCredentials so cookie is sent automatically.
 */
export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthed: false,
      email: null,
      name: null,
      login: async (username, password) => {
        const normalizedUsername = username.trim();
        try {
          await Auth.login({ username: normalizedUsername, password });
          // Verify admin role via profile
          const user: UserResponse = await Auth.me();
          const roles = (user.roles || []).map((r) => r.toUpperCase());
          const isAdmin = roles.includes("ADMIN") || roles.includes("ROLE_ADMIN");
          if (!isAdmin) {
            await Auth.logout().catch(() => {});
            return { ok: false, message: "Tài khoản không có quyền Admin." };
          }
          set({ isAuthed: true, email: user.email, name: user.fullName || "Admin" });
          return { ok: true };
        } catch (err) {
          const msg = getApiErrorMessage(err, "Sai username hoặc mật khẩu.");
          return { ok: false, message: msg };
        }
      },
      logout: () => {
        Auth.logout().catch(() => undefined);
        set({ isAuthed: false, email: null, name: null });
      },
      hydrateFromMainAuth: async () => {
        try {
          const user = await Auth.me();
          const roles = (user.roles || []).map((r) => r.toUpperCase());
          const isAdmin = roles.includes("ADMIN") || roles.includes("ROLE_ADMIN");
          if (isAdmin) {
            set({ isAuthed: true, email: user.email, name: user.fullName || "Admin" });
          }
        } catch {
          set({ isAuthed: false, email: null, name: null });
        }
      },
    }),
    { name: "auratech-admin-auth" }
  )
);
