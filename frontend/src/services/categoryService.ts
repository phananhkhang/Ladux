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
};

