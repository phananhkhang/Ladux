import apiClient from './apiClient';
import { CategoryResponse, PageParams, PageResponse } from './productService';

export const categoryService = {
  /**
   * Lấy tất cả danh mục sản phẩm (Có phân trang)
   * GET /api/v1/categories
   */
  getAllCategories: (params?: PageParams): Promise<PageResponse<CategoryResponse>> => {
    return apiClient.get('/categories', { params });
  },

  /**
   * Lấy chi tiết danh mục theo ID
   * GET /api/v1/categories/{id}
   */
  getCategoryById: (id: number): Promise<CategoryResponse> => {
    return apiClient.get(`/categories/${id}`);
  },

  /**
   * Tìm danh mục theo tên
   * GET /api/v1/categories/name/{name}
   */
  getCategoryByName: (name: string): Promise<CategoryResponse> => {
    return apiClient.get(`/categories/name/${encodeURIComponent(name)}`);
  },

  /**
   * Lấy danh sách các danh mục gốc (Root Categories)
   * GET /api/v1/categories/roots
   */
  getRootCategories: (params?: PageParams): Promise<PageResponse<CategoryResponse>> => {
    return apiClient.get('/categories/roots', { params });
  },
};
