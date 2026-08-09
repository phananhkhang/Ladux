import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import { adminQueryKeys } from "../queryKeys";
import type { AuthStatus, UserResponse } from "../types";
import { getApiErrorMessage, isAdminRole } from "../utils";
import { setAdminAccessToken } from "../../services/authTokens";

interface AdminAuthContextValue {
  user: UserResponse | null;
  status: AuthStatus;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const currentUserQuery = useQuery({
    queryKey: adminQueryKeys.auth,
    queryFn: adminApi.auth.currentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const clearSession = () => queryClient.setQueryData(adminQueryKeys.auth, null);
    window.addEventListener("ladux:admin-auth-expired", clearSession);
    return () => window.removeEventListener("ladux:admin-auth-expired", clearSession);
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await adminApi.auth.login(credentials);
      setAdminAccessToken(response.accessToken);
      const user = await adminApi.auth.currentUser();
      if (!isAdminRole(user.roles)) {
        await adminApi.auth.logout().catch(() => undefined);
        throw new Error("Tài khoản không có quyền quản trị");
      }
      return user;
    },
    onSuccess: (user) => queryClient.setQueryData(adminQueryKeys.auth, user),
  });

  const logoutMutation = useMutation({
    mutationFn: adminApi.auth.logout,
    onSettled: () => {
      setAdminAccessToken(null);
      queryClient.clear();
    },
  });

  const user = currentUserQuery.data ?? null;
  let status: AuthStatus = "checking";
  if (currentUserQuery.isError || currentUserQuery.data === null) status = "unauthenticated";
  else if (user && !isAdminRole(user.roles)) status = "forbidden";
  else if (user) status = "authenticated";

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        status,
        login: async (credentials) => {
          try {
            await loginMutation.mutateAsync(credentials);
          } catch (error) {
            throw new Error(getApiErrorMessage(error));
          }
        },
        logout: async () => {
          await logoutMutation.mutateAsync().catch(() => undefined);
        },
        isLoggingIn: loginMutation.isPending,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth phải được dùng trong AdminAuthProvider");
  return context;
}
