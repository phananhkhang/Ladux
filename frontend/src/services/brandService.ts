import apiClient from './apiClient';
import { BrandResponse, PageParams, PageResponse } from './productService';

export const brandService = {
  /**
   * Lấy danh sách thương hiệu (Có phân trang)
   * GET /api/v1/brands
   */
  getAllBrands: (params?: PageParams): Promise<PageResponse<BrandResponse>> => {
    return apiClient.get('/brands', { params });
  },

  /**
   * Lấy thương hiệu theo ID
   * GET /api/v1/brands/{id}
   */
  getBrandById: (id: number): Promise<BrandResponse> => {
    return apiClient.get(`/brands/${id}`);
  },

  /**
   * Tìm thương hiệu theo tên
   * GET /api/v1/brands/name/{name}
   */
  getBrandByName: (name: string): Promise<BrandResponse> => {
    return apiClient.get(`/brands/name/${encodeURIComponent(name)}`);
  },

  /**
   * Tìm thương hiệu theo Slug
   * GET /api/v1/brands/slug/{slug}
   */
  getBrandBySlug: (slug: string): Promise<BrandResponse> => {
    return apiClient.get(`/brands/slug/${encodeURIComponent(slug)}`);
  },
};
