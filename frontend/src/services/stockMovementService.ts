import apiClient from './apiClient';
import { PageParams, PageResponse } from './productService';

export type StockMovementType =
  | 'PURCHASE_IN'
  | 'SALE_OUT'
  | 'RETURN_IN'
  | 'DAMAGE_OUT'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'OTHER';

export type StockReferenceType = 'ORDER' | 'PURCHASE_ORDER' | 'RETURN' | 'ADJUSTMENT' | 'OTHER';

export interface StockMovementResponse {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  movementType: StockMovementType;
  referenceType?: StockReferenceType;
  referenceId?: number;
  note?: string;
  createdById?: number;
  createdAt: string;
}

export interface StockMovementRequest {
  productId: number;
  quantity: number;
  movementType: StockMovementType;
  note?: string;
}

export const stockMovementService = {
  /**
   * Lấy lịch sử biến động kho (Có phân trang)
   * GET /api/v1/admin/stock-movements
   */
  getAllStockMovements: (params?: PageParams): Promise<PageResponse<StockMovementResponse>> => {
    return apiClient.get('/admin/stock-movements', { params });
  },

  /**
   * Lấy lịch sử biến động kho theo Sản phẩm
   * GET /api/v1/admin/stock-movements/product/{productId}
   */
  getByProduct: (productId: number, params?: PageParams): Promise<PageResponse<StockMovementResponse>> => {
    return apiClient.get(`/admin/stock-movements/product/${productId}`, { params });
  },

  /**
   * Tạo biến động kho thủ công (kiểm kê, hàng hỏng, điều chỉnh...)
   * POST /api/v1/admin/stock-movements/adjustments
   */
  createAdjustment: (data: StockMovementRequest): Promise<StockMovementResponse> => {
    return apiClient.post('/admin/stock-movements/adjustments', data);
  },
};
