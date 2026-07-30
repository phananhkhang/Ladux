import apiClient from './apiClient';
import { ProductResponse } from './productService';

export interface WishlistResponse {
  id: number;
  product: ProductResponse | null;
}

export interface WishlistRequest {
  productId: number;
}

export const wishlistService = {
  /**
   * Lấy danh sách sản phẩm yêu thích của người dùng hiện tại
   * GET /api/v1/wishlists
   */
  getWishlistsByUserId: (): Promise<WishlistResponse[]> => {
    return apiClient.get('/wishlists');
  },

  /**
   * Thêm sản phẩm vào danh sách yêu thích
   * POST /api/v1/wishlists
   */
  addItemToWishlist: (productId: number): Promise<void> => {
    return apiClient.post('/wishlists', { productId });
  },

  /**
   * Xóa sản phẩm khỏi danh sách yêu thích
   * DELETE /api/v1/wishlists/{productId}
   */
  removeItemFromWishlist: (productId: number): Promise<void> => {
    return apiClient.delete(`/wishlists/${productId}`);
  },
};
