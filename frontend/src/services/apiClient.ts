import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

let refreshPromise: Promise<void> | null = null;

function redirectAfterSessionExpired(): void {
  window.dispatchEvent(new CustomEvent("ladux:auth-expired"));
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${env.apiBaseUrl}/auth/refresh`, undefined, {
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

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const url = originalRequest?.url ?? "";
    const isAuthEndpoint = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some(
      (endpoint) => url.includes(endpoint),
    );

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        await refreshSession();
        return apiClient(originalRequest);
      } catch (refreshError) {
        redirectAfterSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
