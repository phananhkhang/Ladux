import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "../../config/env";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _adminRetry?: boolean;
}

const adminApiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

let refreshPromise: Promise<void> | null = null;

function expireAdminSession(): void {
  window.dispatchEvent(new CustomEvent("ladux:admin-auth-expired"));
  if (window.location.pathname !== "/admin/login") {
    window.location.assign("/admin/login");
  }
}

function refreshAdminSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${env.apiBaseUrl}/admin/auth/refresh`, undefined, {
        withCredentials: true,
        headers: { Accept: "application/json" },
      })
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

adminApiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const url = originalRequest?.url ?? "";
    const isAuthEndpoint = [
      "/admin/auth/login",
      "/admin/auth/refresh",
      "/admin/auth/logout",
    ].some((endpoint) => url.includes(endpoint));

    if (error.response?.status === 401 && originalRequest && !originalRequest._adminRetry && !isAuthEndpoint) {
      originalRequest._adminRetry = true;
      try {
        await refreshAdminSession();
        return adminApiClient(originalRequest);
      } catch (refreshError) {
        expireAdminSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default adminApiClient;
