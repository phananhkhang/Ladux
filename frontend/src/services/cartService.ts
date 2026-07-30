import apiClient from './apiClient';
import { ProductResponse } from './productService';

export interface CartItemResponse {
  id: number;
  product: ProductResponse | null;
  quantity: number;
}

export interface CartResponse {
  id: number;
  userId: number | null;
  items: CartItemResponse[];
  totalPrice: number;
}

export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export type AddToCartRequest = CartItemRequest;

export interface CartQuantityRequest {
  quantity: number;
}

export const cartService = {
  /**
   * Lấy giỏ hàng của người dùng hiện tại
   * GET /api/v1/cart
   */
  getCart: (): Promise<CartResponse> => {
    return apiClient.get('/cart');
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * POST /api/v1/cart/items
   */
  addItemToCart: (data: CartItemRequest): Promise<void> => {
    return apiClient.post('/cart/items', data);
  },

  /**
   * Cập nhật số lượng của 1 sản phẩm trong giỏ hàng
   * PUT /api/v1/cart/items/{productId}
   */
  updateQuantity: (productId: number, quantity: number): Promise<void> => {
    return apiClient.put(`/cart/items/${productId}`, { quantity });
  },

  /**
   * Xóa 1 sản phẩm khỏi giỏ hàng
   * DELETE /api/v1/cart/items/{productId}
   */
  removeItemFromCart: (productId: number): Promise<void> => {
    return apiClient.delete(`/cart/items/${productId}`);
  },

  /**
   * Xóa toàn bộ sản phẩm trong giỏ hàng
   * DELETE /api/v1/cart
   */
  clearCart: (): Promise<void> => {
    return apiClient.delete('/cart');
  },
};
