import apiClient from './apiClient';
import { UserResponse } from './userService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const OAUTH2_RETURN_TO_KEY = 'ladux.oauth2.returnTo';

function normalizeReturnTo(returnTo?: string): string {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return '/account';
  }
  return returnTo;
}

function googleAuthorizationUrl(): string {
  const apiUrl = new URL(API_BASE_URL, window.location.origin);
  return new URL('/oauth2/authorization/google', apiUrl.origin).toString();
}

function storeOAuth2ReturnTo(returnTo?: string): void {
  try {
    sessionStorage.setItem(OAUTH2_RETURN_TO_KEY, normalizeReturnTo(returnTo));
  } catch {
    // OAuth2 vẫn hoạt động nếu trình duyệt chặn sessionStorage; callback sẽ về /account.
  }
}

function takeOAuth2ReturnTo(): string {
  try {
    const returnTo = normalizeReturnTo(sessionStorage.getItem(OAUTH2_RETURN_TO_KEY) || undefined);
    sessionStorage.removeItem(OAUTH2_RETURN_TO_KEY);
    return returnTo;
  } catch {
    return '/account';
  }
}

function removeOAuth2ReturnTo(): void {
  try {
    sessionStorage.removeItem(OAUTH2_RETURN_TO_KEY);
  } catch {
    // Không cần chặn luồng đăng nhập nếu storage không khả dụng.
  }
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email?: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  userId: string;
  username: string;
}

export interface RefreshResponse {
  message: string;
}

export interface CsrfResponse {
  headerName: string;
  parameterName: string;
  token: string;
}

export const authService = {
  /**
   * Chuyển trình duyệt tới Spring Security để bắt đầu Authorization Code flow.
   * Điểm đến sau đăng nhập được lưu trong sessionStorage, không đưa vào OAuth state/token URL.
  */
  startGoogleLogin: (returnTo?: string): void => {
    storeOAuth2ReturnTo(returnTo);
    window.location.assign(googleAuthorizationUrl());
  },

  consumeOAuth2ReturnTo: takeOAuth2ReturnTo,

  clearOAuth2ReturnTo: removeOAuth2ReturnTo,

  /**
   * Đăng ký tài khoản người dùng mới
   * POST /api/v1/auth/register
   */
  register: (data: RegisterRequest): Promise<UserResponse> => {
    return apiClient.post('/auth/register', data);
  },

  /**
   * Đăng nhập (AccessToken & RefreshToken được thiết lập tự động qua HTTP-Only Cookie)
   * POST /api/v1/auth/login
   */
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post('/auth/login', data);
  },

  /**
   * Làm mới AccessToken bằng RefreshToken cookie
   * POST /api/v1/auth/refresh
   */
  refresh: (): Promise<RefreshResponse> => {
    return apiClient.post('/auth/refresh');
  },

  /**
   * Đăng xuất hệ thống (Revoke session và xóa Cookie)
   * POST /api/v1/auth/logout
   */
  logout: (): Promise<void> => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Lấy CSRF token cho các request bảo mật
   * GET /api/v1/auth/csrf
   */
  getCsrf: (): Promise<CsrfResponse> => {
    return apiClient.get('/auth/csrf');
  },
};
