const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!configuredApiUrl) {
  throw new Error(
    "Thiếu VITE_API_BASE_URL. Hãy khai báo URL backend trong file .env trước khi khởi động ứng dụng.",
  );
}

const normalizedApiUrl = configuredApiUrl.replace(/\/$/, "");

export const env = {
  apiBaseUrl: normalizedApiUrl.endsWith("/api/v1")
    ? normalizedApiUrl
    : `${normalizedApiUrl}/api/v1`,
  backendOrigin: normalizedApiUrl.endsWith("/api/v1")
    ? normalizedApiUrl.slice(0, -"/api/v1".length)
    : normalizedApiUrl,
  enableUnsafeOrderReturnTransitions:
    import.meta.env.VITE_ENABLE_UNSAFE_ORDER_RETURN_TRANSITIONS === "true",
} as const;
