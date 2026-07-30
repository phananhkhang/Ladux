import apiClient from './apiClient';
import { PageParams, PageResponse } from './productService';

export type PurchaseOrderStatus = 'PENDING' | 'CONFIRMED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItemResponse {
  id: number;
  productVariantId: number;
  productName?: string;
  quantity: number;
  costPrice: number;
  receivedQuantity: number;
  note?: string;
}

export interface PurchaseOrderResponse {
  id: number;
  supplierId: number;
  supplierName?: string;
  status: PurchaseOrderStatus;
  expectedDeliveryDate?: string;
  totalAmount: number;
  note?: string;
  createdById?: number;
  createdAt: string;
  updatedAt?: string;
  items: PurchaseOrderItemResponse[];
}

export interface PurchaseOrderItemRequest {
  productId: number;
  quantity: number;
  costPrice: number;
  note?: string;
}

export interface PurchaseOrderCreateRequest {
  supplierId: number;
  expectedDeliveryDate?: string;
  note?: string;
  items: PurchaseOrderItemRequest[];
}

export interface PurchaseOrderStatusUpdateRequest {
  status: PurchaseOrderStatus;
  note?: string;
}

export interface PurchaseOrderReceiveLine {
  itemId: number;
  receivedQuantity: number;
}

export interface PurchaseOrderReceiveRequest {
  lines: PurchaseOrderReceiveLine[];
}

export const purchaseOrderService = {
  /**
   * Lấy danh sách tất cả đơn nhập hàng (Có phân trang)
   * GET /api/v1/admin/purchase-orders
   */
  getAllPurchaseOrders: (params?: PageParams): Promise<PageResponse<PurchaseOrderResponse>> => {
    return apiClient.get('/admin/purchase-orders', { params });
  },

  /**
   * Lấy danh sách đơn nhập hàng theo trạng thái
   * GET /api/v1/admin/purchase-orders/status/{status}
   */
  getByStatus: (status: PurchaseOrderStatus, params?: PageParams): Promise<PageResponse<PurchaseOrderResponse>> => {
    return apiClient.get(`/admin/purchase-orders/status/${status}`, { params });
  },

  /**
   * Lấy danh sách đơn nhập hàng theo nhà cung cấp
   * GET /api/v1/admin/purchase-orders/supplier/{supplierId}
   */
  getBySupplier: (supplierId: number, params?: PageParams): Promise<PageResponse<PurchaseOrderResponse>> => {
    return apiClient.get(`/admin/purchase-orders/supplier/${supplierId}`, { params });
  },

  /**
   * Lấy chi tiết đơn nhập hàng theo ID
   * GET /api/v1/admin/purchase-orders/{id}
   */
  getById: (id: number): Promise<PurchaseOrderResponse> => {
    return apiClient.get(`/admin/purchase-orders/${id}`);
  },

  /**
   * Tạo mới đơn nhập hàng (Purchase Order)
   * POST /api/v1/admin/purchase-orders
   */
  createPurchaseOrder: (data: PurchaseOrderCreateRequest): Promise<PurchaseOrderResponse> => {
    return apiClient.post('/admin/purchase-orders', data);
  },

  /**
   * Cập nhật trạng thái đơn nhập hàng
   * PATCH /api/v1/admin/purchase-orders/{id}/status
   */
  updateStatus: (id: number, data: PurchaseOrderStatusUpdateRequest): Promise<PurchaseOrderResponse> => {
    return apiClient.patch(`/admin/purchase-orders/${id}/status`, data);
  },

  /**
   * Thực hiện nhập kho / nhận hàng cho đơn nhập hàng
   * POST /api/v1/admin/purchase-orders/{id}/receive
   */
  receiveGoods: (id: number, data: PurchaseOrderReceiveRequest): Promise<PurchaseOrderResponse> => {
    return apiClient.post(`/admin/purchase-orders/${id}/receive`, data);
  },
};
