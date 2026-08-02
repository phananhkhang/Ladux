import apiClient from './apiClient';

export interface UserResponse {
  id: number;
  email: string | null;
  username: string;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  roles: string[];
}

export interface UserUpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  verificationId: string;
}

export interface PasswordPhoneOtpSendResponse {
  verificationId: string;
  maskedPhone: string;
  expiresInSeconds: number;
}

export interface PasswordPhoneOtpVerifyRequest {
  verificationId: string;
  otp: string;
}

export interface PasswordEmailOtpSendResponse {
  verificationId: string;
  maskedEmail: string;
  expiresAt: string;
  resendAfterSeconds: number;
}

export interface PasswordVerificationResponse {
  verificationId: string;
  verifiedAt: string;
  expiresAt: string;
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
   * Đổi mật khẩu của người dùng hiện tại.
   * PUT /api/v1/users/me/password
   */
  sendPasswordPhoneOtp: (): Promise<PasswordPhoneOtpSendResponse> => {
    return apiClient.post('/users/me/password/phone/otp');
  },

  verifyPasswordPhoneOtp: (
    data: PasswordPhoneOtpVerifyRequest
  ): Promise<PasswordVerificationResponse> => {
    return apiClient.post('/users/me/password/phone/verify', data);
  },

  sendPasswordEmailOtp: (): Promise<PasswordEmailOtpSendResponse> => {
    return apiClient.post('/users/me/password/email/otp');
  },

  verifyPasswordEmailOtp: (
    data: PasswordPhoneOtpVerifyRequest
  ): Promise<PasswordVerificationResponse> => {
    return apiClient.post('/users/me/password/email/verify', data);
  },

  changePassword: (data: UserUpdatePasswordRequest): Promise<void> => {
    return apiClient.put('/users/me/password', data);
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
