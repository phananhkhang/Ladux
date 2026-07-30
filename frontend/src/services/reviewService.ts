import apiClient from './apiClient';
import { PageParams, PageResponse } from './productService';

export interface ReviewResponse {
  id: number;
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewCreateRequest {
  productId: number;
  rating: number;
  comment?: string;
}

export interface ReviewUpdateRequest {
  rating: number;
  comment?: string;
}

export const reviewService = {
  /**
   * Lấy danh sách đánh giá của sản phẩm theo Product ID
   * GET /api/v1/reviews/product/{productId}
   */
  getReviewsByProductId: (productId: number, params?: PageParams): Promise<PageResponse<ReviewResponse>> => {
    return apiClient.get(`/reviews/product/${productId}`, { params });
  },

  /**
   * Viết đánh giá mới cho sản phẩm
   * POST /api/v1/reviews
   */
  createReview: (data: ReviewCreateRequest): Promise<ReviewResponse> => {
    return apiClient.post('/reviews', data);
  },

  /**
   * Cập nhật đánh giá đã đăng
   * PUT /api/v1/reviews/{reviewId}
   */
  updateReview: (reviewId: number, data: ReviewUpdateRequest): Promise<ReviewResponse> => {
    return apiClient.put(`/reviews/${reviewId}`, data);
  },

  /**
   * Xóa bài đánh giá
   * DELETE /api/v1/reviews/{reviewId}
   */
  deleteReviewById: (reviewId: number): Promise<void> => {
    return apiClient.delete(`/reviews/${reviewId}`);
  },
};
