import apiClient from './apiClient';
import { UserResponse } from './userService';

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
