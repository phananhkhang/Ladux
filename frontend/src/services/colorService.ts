import apiClient from './apiClient';
import { ColorResponse } from './productService';

export interface ColorRequest {
  name: string;
  hexCode: string;
}

export const colorService = {
  /**
   * Thêm màu sắc mới
   * POST /api/v1/admin/color
   */
  addColor: (data: ColorRequest): Promise<ColorResponse> => {
    return apiClient.post('/admin/color', data);
  },

  /**
   * Cập nhật màu sắc
   * PUT /api/v1/admin/color/{id}
   */
  updateColor: (id: number, data: ColorRequest): Promise<ColorResponse> => {
    return apiClient.put(`/admin/color/${id}`, data);
  },

  /**
   * Xóa màu sắc
   * DELETE /api/v1/admin/color/{id}
   */
  deleteColor: (id: number): Promise<void> => {
    return apiClient.delete(`/admin/color/${id}`);
  },
};
