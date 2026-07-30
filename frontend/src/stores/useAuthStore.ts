import { create } from 'zustand';
import {
  authService,
  userService,
  LoginRequest,
  RegisterRequest,
  UserResponse,
  UserProfileUpdateRequest,
} from '@/services';

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<UserResponse>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: UserProfileUpdateRequest) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  setAccessToken: (token: string | null) => void;
  clearError: () => void;
  isAdmin: () => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,

  setAccessToken: (token) => {
    set({ accessToken: token, isLoggedIn: !!token });
  },

  clearError: () => set({ error: null }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      await authService.login(credentials);
      // Lấy profile user ngay sau khi login thành công (cookie HttpOnly đã được set tự động)
      await get().fetchCurrentUser();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      set({ error: message, isLoggedIn: false, user: null });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.register(data);
      return res;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
    } catch (error) {
      console.error('Lỗi khi logout backend:', error);
    } finally {
      get().setAccessToken(null);
      set({ user: null, isLoggedIn: false, isLoading: false, error: null });
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const userData = await userService.getCurrentUser();
      set({ user: userData, isLoggedIn: true });
    } catch (error) {
      // Nếu session không hợp lệ hoặc hết hạn thì clear session state
      get().setAccessToken(null);
      set({ user: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateProfile(data);
      set({ user: updatedUser });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Cập nhật thông tin thất bại!';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  uploadAvatar: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.uploadAvatar(file);
      set({ user: updatedUser });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Tải ảnh đại diện thất bại!';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  isAdmin: () => {
    const user = get().user;
    if (!user || !user.roles) return false;
    return user.roles.some((role) => role.toUpperCase() === 'ROLE_ADMIN' || role.toUpperCase() === 'ADMIN');
  },

  isStaff: () => {
    const user = get().user;
    if (!user || !user.roles) return false;
    return user.roles.some(
      (role) => role.toUpperCase() === 'ROLE_STAFF' || role.toUpperCase() === 'STAFF' || role.toUpperCase() === 'ROLE_ADMIN'
    );
  },
}));