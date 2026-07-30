import { create } from 'zustand';
import {
  orderService,
  OrderResponse,
  OrderRequest,
  OrderPaymentRetryResponse,
} from '@/services';

interface OrderState {
  orders: OrderResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  currentOrder: OrderResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUserOrders: (page?: number, size?: number) => Promise<void>;
  fetchOrderById: (id: number) => Promise<OrderResponse | null>;
  createOrder: (data: OrderRequest) => Promise<OrderResponse>;
  retryPayment: (orderId: number) => Promise<OrderPaymentRetryResponse>;
  clearCurrentOrder: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 10,
  currentOrder: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),
  clearCurrentOrder: () => set({ currentOrder: null }),

  fetchUserOrders: async (page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      const res = await orderService.getOrdersByUser({ page, size, sort: 'createdAt,desc' });
      set({
        orders: res.content || [],
        totalElements: res.totalElements || 0,
        totalPages: res.totalPages || 0,
        page,
        size,
      });
    } catch (err: any) {
      console.error('Lỗi fetch user orders:', err);
      const message = err?.response?.data?.message || 'Không thể tải danh sách đơn hàng!';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrderById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const order = await orderService.getOrderById(id);
      set({ currentOrder: order });
      return order;
    } catch (err: any) {
      console.error('Lỗi fetch order by id:', err);
      const message = err?.response?.data?.message || 'Không thể tải thông tin đơn hàng!';
      set({ error: message, currentOrder: null });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async (data: OrderRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newOrder = await orderService.createOrder(data);
      set({ currentOrder: newOrder });
      return newOrder;
    } catch (err: any) {
      console.error('Lỗi create order:', err);
      const message = err?.response?.data?.message || err?.message || 'Tạo đơn hàng thất bại!';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  retryPayment: async (orderId: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await orderService.retryPayment(orderId);
      return res;
    } catch (err: any) {
      console.error('Lỗi retry payment:', err);
      const message = err?.response?.data?.message || 'Thanh toán lại thất bại!';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      orders: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
      currentOrder: null,
      isLoading: false,
      error: null,
    });
  },
}));
