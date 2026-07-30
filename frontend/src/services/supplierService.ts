import apiClient from './apiClient';
import { PageParams, PageResponse } from './productService';

export interface SupplierResponse {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface ProductSupplierResponse {
  id: number;
  productId: number;
  productName?: string;
  supplierId: number;
  supplierName?: string;
  costPrice?: number;
  leadTimeDays?: number;
}

export interface ProductSupplierRequest {
  productId: number;
  supplierId: number;
  costPrice?: number;
  leadTimeDays?: number;
}

export const supplierService = {
  /**
   * Lấy danh sách tất cả nhà cung cấp (Có phân trang)
   * GET /api/v1/admin/suppliers
   */
  getAllSuppliers: (params?: PageParams): Promise<PageResponse<SupplierResponse>> => {
    return apiClient.get('/admin/suppliers', { params });
  },

  /**
   * Lấy danh sách nhà cung cấp đang hoạt động
   * GET /api/v1/admin/suppliers/active
   */
  getActiveSuppliers: (params?: PageParams): Promise<PageResponse<SupplierResponse>> => {
    return apiClient.get('/admin/suppliers/active', { params });
  },

  /**
   * Lấy nhà cung cấp theo ID
   * GET /api/v1/admin/suppliers/{id}
   */
  getSupplierById: (id: number): Promise<SupplierResponse> => {
    return apiClient.get(`/admin/suppliers/${id}`);
  },

  /**
   * Tìm kiếm nhà cung cấp theo tên / sđt
   * GET /api/v1/admin/suppliers/search
   */
  searchSuppliers: (name?: string, phone?: string, params?: PageParams): Promise<PageResponse<SupplierResponse>> => {
    return apiClient.get('/admin/suppliers/search', { params: { name, phone, ...params } });
  },

  /**
   * Tạo mới nhà cung cấp
   * POST /api/v1/admin/suppliers
   */
  createSupplier: (data: SupplierRequest): Promise<SupplierResponse> => {
    return apiClient.post('/admin/suppliers', data);
  },

  /**
   * Cập nhật nhà cung cấp
   * PUT /api/v1/admin/suppliers/{id}
   */
  updateSupplier: (id: number, data: SupplierRequest): Promise<SupplierResponse> => {
    return apiClient.put(`/admin/suppliers/${id}`, data);
  },

  /**
   * Xóa nhà cung cấp
   * DELETE /api/v1/admin/suppliers/{id}
   */
  deleteSupplier: (id: number): Promise<void> => {
    return apiClient.delete(`/admin/suppliers/${id}`);
  },

  // --- Product-Supplier Relationship Endpoints ---

  /**
   * Lấy danh sách liên kết NCC theo ID Sản phẩm
   * GET /api/v1/admin/product-suppliers/product/{productId}
   */
  getByProduct: (productId: number): Promise<ProductSupplierResponse[]> => {
    return apiClient.get(`/admin/product-suppliers/product/${productId}`);
  },

  /**
   * Lấy danh sách sản phẩm liên kết theo ID Nhà cung cấp
   * GET /api/v1/admin/product-suppliers/supplier/{supplierId}
   */
  getBySupplier: (supplierId: number): Promise<ProductSupplierResponse[]> => {
    return apiClient.get(`/admin/product-suppliers/supplier/${supplierId}`);
  },

  /**
   * Liên kết sản phẩm với nhà cung cấp
   * POST /api/v1/admin/product-suppliers
   */
  linkProductSupplier: (data: ProductSupplierRequest): Promise<ProductSupplierResponse> => {
    return apiClient.post('/admin/product-suppliers', data);
  },

  /**
   * Cập nhật liên kết sản phẩm - nhà cung cấp
   * PUT /api/v1/admin/product-suppliers/{id}
   */
  updateProductSupplier: (id: number, data: ProductSupplierRequest): Promise<ProductSupplierResponse> => {
    return apiClient.put(`/admin/product-suppliers/${id}`, data);
  },

  /**
   * Hủy liên kết sản phẩm với nhà cung cấp
   * DELETE /api/v1/admin/product-suppliers/{id}
   */
  unlinkProductSupplier: (id: number): Promise<void> => {
    return apiClient.delete(`/admin/product-suppliers/${id}`);
  },
};
