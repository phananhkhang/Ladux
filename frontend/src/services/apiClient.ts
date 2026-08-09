import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";
import { getStorefrontAccessToken, setStorefrontAccessToken } from "./authTokens";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface AccessTokenResponse {
  accessToken: string;
}

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

function redirectAfterSessionExpired(): void {
  setStorefrontAccessToken(null);
  window.dispatchEvent(new CustomEvent("ladux:auth-expired"));
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

function refreshSession(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<AccessTokenResponse>(`${env.apiBaseUrl}/auth/refresh`, undefined, {
        withCredentials: true,
        headers: { Accept: "application/json" },
      })
      .then((response) => {
        setStorefrontAccessToken(response.data.accessToken);
        return response.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getStorefrontAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

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
