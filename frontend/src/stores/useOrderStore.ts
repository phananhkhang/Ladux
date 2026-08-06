import { create } from 'zustand';
import {
  orderService,
  OrderResponse,
  OrderRequest,
  OrderPaymentRetryResponse,
} from '@/services';
import { orderHistoryService, OrderHistoryResponse } from '@/services/orderHistoryService';

interface OrderState {
  orders: OrderResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  currentOrder: OrderResponse | null;
  isLoading: boolean;
  error: string | null;

  // Order history timeline
  orderHistories: OrderHistoryResponse[];
  isLoadingHistories: boolean;

  // Actions
  fetchOrders: (page?: number, size?: number) => Promise<void>;
  fetchUserOrders: (page?: number, size?: number) => Promise<void>;
  fetchOrderById: (id: number) => Promise<OrderResponse | null>;
  fetchOrderHistories: (page?: number, size?: number) => Promise<void>;
  createOrder: (data: OrderRequest) => Promise<OrderResponse>;
  retryPayment: (orderId: number) => Promise<OrderPaymentRetryResponse>;
  cancelOrder: (orderId: number) => Promise<void>;
  requestReturn: (orderId: number, reason?: string) => Promise<OrderResponse>;
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

  orderHistories: [],
  isLoadingHistories: false,

  clearError: () => set({ error: null }),
  clearCurrentOrder: () => set({ currentOrder: null }),

  fetchOrders: async (page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      const res = await orderService.getOrdersByUser({ page, size });
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

  fetchUserOrders: async (page = 0, size = 10) => {
    return get().fetchOrders(page, size);
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

  fetchOrderHistories: async (page = 0, size = 100) => {
    set({ isLoadingHistories: true });
    try {
      const res = await orderHistoryService.getMyOrderHistories({ page, size, sort: 'createdAt,asc' });
      set({ orderHistories: res.content || [] });
    } catch (err: any) {
      console.error('Lỗi fetch order histories:', err);
      // không block UI nếu lỗi history
    } finally {
      set({ isLoadingHistories: false });
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

  cancelOrder: async (orderId: number) => {
    set({ isLoading: true, error: null });
    try {
      await orderService.cancelOrder(orderId);
      await Promise.all([
        get().fetchOrders(get().page, get().size),
        get().fetchOrderById(orderId),
        get().fetchOrderHistories(),
      ]);
    } catch (err: any) {
      console.error('Lỗi cancel order:', err);
      const message = err?.response?.data?.message || 'Hủy đơn hàng thất bại!';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  requestReturn: async (orderId: number, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedOrder = await orderService.requestReturn(orderId, reason);
      await Promise.all([
        get().fetchOrders(get().page, get().size),
        get().fetchOrderById(orderId),
        get().fetchOrderHistories(),
      ]);
      return updatedOrder;
    } catch (err: any) {
      console.error('Lỗi request return:', err);
      const message = err?.response?.data?.message || 'Yêu cầu trả hàng thất bại!';
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
      orderHistories: [],
      isLoadingHistories: false,
    });
  },
}));

