import { create } from 'zustand';
import { notificationService, NotificationResponse } from '@/services';

interface NotificationState {
  notifications: NotificationResponse[];
  unreadCount: number;
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (page?: number, size?: number) => Promise<void>;
  fetchUnreadNotifications: (page?: number, size?: number) => Promise<void>;
  fetchReadNotifications: (page?: number, size?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 10,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchNotifications: async (page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      const res = await notificationService.getAllNotifications(page, size);
      set({
        notifications: res.content || [],
        totalElements: res.totalElements || 0,
        totalPages: res.totalPages || 0,
        page,
        size,
      });
      // Cập nhật luôn count chưa đọc
      await get().fetchUnreadCount();
    } catch (err: any) {
      console.error('Lỗi fetch notifications:', err);
      const message = err?.response?.data?.message || 'Không thể tải danh sách thông báo!';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadNotifications: async (page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      const res = await notificationService.getAllUnReadNotifications(page, size);
      set({
        notifications: res.content || [],
        totalElements: res.totalElements || 0,
        totalPages: res.totalPages || 0,
        page,
        size,
      });
      await get().fetchUnreadCount();
    } catch (err: any) {
      console.error('Lỗi fetch unread notifications:', err);
      const message = err?.response?.data?.message || 'Không thể tải thông báo chưa đọc!';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchReadNotifications: async (page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      const res = await notificationService.getAllReadNotifications(page, size);
      set({
        notifications: res.content || [],
        totalElements: res.totalElements || 0,
        totalPages: res.totalPages || 0,
        page,
        size,
      });
      await get().fetchUnreadCount();
    } catch (err: any) {
      console.error('Lỗi fetch read notifications:', err);
      const message = err?.response?.data?.message || 'Không thể tải thông báo đã đọc!';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadNotificationCount();
      set({ unreadCount: count });
    } catch (err) {
      console.error('Lỗi fetch unread count:', err);
    }
  },

  markAsRead: async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err: any) {
      console.error('Lỗi markAsRead:', err);
      const message = err?.response?.data?.message || 'Đánh dấu đã đọc thất bại!';
      set({ error: message });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err: any) {
      console.error('Lỗi markAllAsRead:', err);
      const message = err?.response?.data?.message || 'Đánh dấu tất cả đã đọc thất bại!';
      set({ error: message });
    }
  },

  deleteNotification: async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      const target = get().notifications.find((n) => n.id === id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: target && !target.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }));
    } catch (err: any) {
      console.error('Lỗi deleteNotification:', err);
      const message = err?.response?.data?.message || 'Xóa thông báo thất bại!';
      set({ error: message });
    }
  },

  deleteAllNotifications: async () => {
    try {
      await notificationService.deleteAllNotifications();
      set({ notifications: [], unreadCount: 0 });
    } catch (err: any) {
      console.error('Lỗi deleteAllNotifications:', err);
      const message = err?.response?.data?.message || 'Xóa tất cả thông báo thất bại!';
      set({ error: message });
    }
  },

  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
      isLoading: false,
      error: null,
    });
  },
}));
