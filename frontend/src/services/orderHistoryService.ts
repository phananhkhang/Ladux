import apiClient from './apiClient';
import { PageParams, PageResponse } from './productService';

export interface OrderHistoryResponse {
  id: number;
  orderId: number;
  status: string;
  description?: string;
  createdAt: string;
}

export const orderHistoryService = {
  /**
   * User: Lấy lịch sử thay đổi đơn hàng của chính mình
   * GET /api/v1/order-histories/my
   */
  getMyOrderHistories: (params?: PageParams): Promise<PageResponse<OrderHistoryResponse>> => {
    return apiClient.get('/order-histories/my', { params });
  },

  /**
   * Admin: Lấy tất cả lịch sử thay đổi đơn hàng
   * GET /api/v1/admin/order-histories
   */
  getAllOrderHistories: (params?: PageParams): Promise<PageResponse<OrderHistoryResponse>> => {
    return apiClient.get('/admin/order-histories', { params });
  },

  /**
   * Admin: Lấy chi tiết 1 bản ghi lịch sử theo ID
   * GET /api/v1/admin/order-histories/{id}
   */
  getOrderHistoryById: (id: number): Promise<OrderHistoryResponse> => {
    return apiClient.get(`/admin/order-histories/${id}`);
  },

  /**
   * Admin: Lấy lịch sử thay đổi theo Order ID
   * GET /api/v1/admin/order-histories/order/{orderId}
   */
  getOrderHistoriesByOrderId: (orderId: number, params?: PageParams): Promise<PageResponse<OrderHistoryResponse>> => {
    return apiClient.get(`/admin/order-histories/order/${orderId}`, { params });
  },
};
