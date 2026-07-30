import apiClient from './apiClient';
import { ProductVariantResponse, ProductVariantRequest } from './productService';


export const productVariantService = {
  /**
   * Thêm biến thể sản phẩm
   * POST /api/v1/admin/product-variants
   */
  addProductVariant: (data: ProductVariantRequest): Promise<ProductVariantResponse> => {
    return apiClient.post('/admin/product-variants', data);
  },

  /**
   * Cập nhật biến thể sản phẩm
   * PUT /api/v1/admin/product-variants/{id}
   */
  updateProductVariant: (id: number, data: Partial<ProductVariantRequest>): Promise<ProductVariantResponse> => {
    return apiClient.put(`/admin/product-variants/${id}`, data);
  },

  /**
   * Xóa biến thể sản phẩm
   * DELETE /api/v1/admin/product-variants/{id}
   */
  deleteProductVariant: (id: number): Promise<void> => {
    return apiClient.delete(`/admin/product-variants/${id}`);
  },
};
