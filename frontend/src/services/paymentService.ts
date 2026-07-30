import apiClient from './apiClient';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentProvider = 'VNPAY' | 'ZALOPAY' | 'MOMO' | 'COD';

export interface PaymentCallbackResponse {
  id: number;
  orderId: number | null;
  provider: PaymentProvider;
  transactionNo: string | null;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  paymentUrl?: string;
}

export interface PaymentCreateRequest {
  orderId: number;
  provider: PaymentProvider;
}

export const paymentService = {
  /**
   * Lấy lịch sử giao dịch thanh toán của tôi
   * GET /api/v1/payments/my
   */
  getMyPayments: (params?: { page?: number; size?: number }): Promise<any> => {
    return apiClient.get('/payments/my', { params });
  },

  /**
   * Lấy giao dịch thanh toán theo Order ID
   * GET /api/v1/payments/my/order/{orderId}
   */
  getMyPaymentsByOrderId: (orderId: number, params?: { page?: number; size?: number }): Promise<any> => {
    return apiClient.get(`/payments/my/order/${orderId}`, { params });
  },

  /**
   * Lấy lịch sử giao dịch thanh toán theo trạng thái (SUCCESS, PENDING, FAILED...)
   * GET /api/v1/payments/my/status/{status}
   */
  getMyPaymentsByStatus: (status: PaymentStatus, params?: { page?: number; size?: number }): Promise<any> => {
    return apiClient.get(`/payments/my/status/${status}`, { params });
  },

  /**
   * Khởi tạo giao dịch thanh toán trực tuyến (VNPAY, ZALOPAY, MOMO...)
   * POST /api/v1/payments
   */
  createPayment: (data: PaymentCreateRequest): Promise<PaymentCallbackResponse> => {
    return apiClient.post('/payments', data);
  },
};
