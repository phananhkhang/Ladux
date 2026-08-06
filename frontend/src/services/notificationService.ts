import apiClient from './apiClient';
import { PageResponse } from './productService';

export interface NotificationResponse {
  id: number;
  userId?: number | null;
  userName?: string | null;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export const notificationService = {
  /**
   * Lấy tất cả thông báo của người dùng
   * GET /api/v1/notifications?page=0&size=10
   */
  getAllNotifications: (page = 0, size = 10): Promise<PageResponse<NotificationResponse>> => {
    return apiClient.get('/notifications', { params: { page, size } });
  },

  /**
   * Lấy danh sách thông báo chưa đọc
   * GET /api/v1/notifications/unread?page=0&size=10
   */
  getAllUnReadNotifications: (page = 0, size = 10): Promise<PageResponse<NotificationResponse>> => {
    return apiClient.get('/notifications/unread', { params: { page, size } });
  },

  /**
   * Lấy danh sách thông báo đã đọc
   * GET /api/v1/notifications/read?page=0&size=10
   */
  getAllReadNotifications: (page = 0, size = 10): Promise<PageResponse<NotificationResponse>> => {
    return apiClient.get('/notifications/read', { params: { page, size } });
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   * GET /api/v1/notifications/unread-count
   */
  getUnreadNotificationCount: (): Promise<number> => {
    return apiClient.get('/notifications/unread-count');
  },

  /**
   * Đánh dấu 1 thông báo là đã đọc
   * PATCH /api/v1/notifications/{id}/read
   */
  markAsRead: (id: number): Promise<void> => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   * PATCH /api/v1/notifications/read-all
   */
  markAllAsRead: (): Promise<void> => {
    return apiClient.patch('/notifications/read-all');
  },

  /**
   * Xóa 1 thông báo cụ thể
   * DELETE /api/v1/notifications/{id}
   */
  deleteNotification: (id: number): Promise<void> => {
    return apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Xóa tất cả thông báo
   * DELETE /api/v1/notifications
   */
  deleteAllNotifications: (): Promise<void> => {
    return apiClient.delete('/notifications');
  },
};
