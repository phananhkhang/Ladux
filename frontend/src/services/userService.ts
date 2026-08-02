import apiClient from './apiClient';

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  roles: string[];
}

export interface UserProfileUpdateRequest {
  fullName?: string;
  phone?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const userService = {
  /**
   * Lấy thông tin cá nhân của người dùng hiện tại đang đăng nhập
   * GET /api/v1/users/me
   */
  getCurrentUser: (): Promise<UserResponse> => {
    return apiClient.get('/users/me');
  },

  /**
   * Cập nhật thông tin profile cá nhân (họ tên, email, sđt, mật khẩu mới...)
   * PUT /api/v1/users/me
   */
  updateProfile: (data: UserProfileUpdateRequest): Promise<UserResponse> => {
    return apiClient.put('/users/me', data);
  },

  /**
   * Tải ảnh đại diện (Avatar) lên hệ thống
   * POST /api/v1/users/me/avatar
   */
  uploadAvatar: (file: File): Promise<UserResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
