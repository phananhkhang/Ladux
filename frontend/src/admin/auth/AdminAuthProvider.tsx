import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminLoginResponse } from "../api/adminApi";
import { adminQueryKeys } from "../queryKeys";
import type { AuthStatus, UserResponse } from "../types";
import { getApiErrorMessage, isAdminRole } from "../utils";
import { setAdminAccessToken } from "../../services/authTokens";
import { getCaptchaToken } from "../../services/captchaService";

type AdminLoginResult = { mfaRequired: true; challengeId: string } | { mfaRequired: false };

interface AdminAuthContextValue {
  user: UserResponse | null;
  status: AuthStatus;
  login: (credentials: { username: string; password: string }) => Promise<AdminLoginResult>;
  verifyMfa: (challengeId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function isMfaRequired(response: AdminLoginResponse): response is Extract<AdminLoginResponse, { mfaRequired: true }> {
  return "mfaRequired" in response && response.mfaRequired === true;
}

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

  const establishSession = async (response: Exclude<AdminLoginResponse, { mfaRequired: true }>) => {
    setAdminAccessToken(response.accessToken);
    const user = await adminApi.auth.currentUser();
    if (!isAdminRole(user.roles)) {
      await adminApi.auth.logout().catch(() => undefined);
      throw new Error("Tài khoản không có quyền quản trị");
    }
    queryClient.setQueryData(adminQueryKeys.auth, user);
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }): Promise<AdminLoginResult> => {
      const captchaToken = await getCaptchaToken("login");
      const response = await adminApi.auth.login({ ...credentials, captchaToken });
      if (isMfaRequired(response)) return response;
      await establishSession(response);
      return { mfaRequired: false };
    },
  });

  const mfaMutation = useMutation({
    mutationFn: async ({ challengeId, code }: { challengeId: string; code: string }) => {
      const response = await adminApi.auth.verifyMfa({ challengeId, code });
      await establishSession(response);
    },
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
            return await loginMutation.mutateAsync(credentials);
          } catch (error) {
            throw new Error(getApiErrorMessage(error));
          }
        },
        verifyMfa: async (challengeId, code) => {
          try {
            await mfaMutation.mutateAsync({ challengeId, code });
          } catch (error) {
            throw new Error(getApiErrorMessage(error));
          }
        },
        logout: async () => {
          await logoutMutation.mutateAsync().catch(() => undefined);
        },
        isLoggingIn: loginMutation.isPending || mfaMutation.isPending,
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
