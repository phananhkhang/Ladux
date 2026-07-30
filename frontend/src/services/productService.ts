import apiClient from './apiClient';

// --- Interface Phân trang (Spring Data Pageable Response) ---
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}

// --- Interfaces Response (Khớp với DTO Backend) ---
export interface BrandResponse {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImageResponse {
  id: number;
  imageUrl: string;
  isMain: boolean;
}

export interface ColorResponse {
  id: number;
  name: string;
  hexCode: string;
}

export interface ProductVariantResponse {
  id: number;
  productId: number;
  sku: string;
  color: ColorResponse | null;
  ram: string;
  rom: string;
  price: number;
  discountPrice: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductResponse {
  id: number;
  brand: BrandResponse | null;
  category: CategoryResponse | null;
  name: string;
  slug: string;
  cpu: string;
  gpu: string;
  display: string;
  battery: string;
  weight: string;
  numberOfFans: number;
  os: string;
  isActive: boolean;
  createdAt: string;
  images: ProductImageResponse[];
}

// --- Interfaces Request (Dành cho Create/Update) ---
export interface ProductVariantRequest {
  productId?: number;
  colorId?: number;
  ram?: string;
  rom?: string;
  price?: number;
  discountPrice?: number;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface ProductRequest {
  brandId: number;
  categoryId: number;
  name: string;
  description?: string;
  cpu?: string;
  gpu?: string;
  display?: string;
  battery?: string;
  weight?: string;
  numberOfFans?: number;
  os?: string;
  isActive?: boolean;
  variants: ProductVariantRequest[];
  imageUrls?: string[];
}

export const productService = {
  // ==========================================
  // 1. PUBLIC / USER ENDPOINTS (/api/v1/products)
  // ==========================================

  /**
   * Lấy tất cả sản phẩm (Có hỗ trợ tìm kiếm & phân trang)
   * GET /api/v1/products?search=...&page=0&size=10&sort=createdAt,desc
   */
  getAllProducts: (params?: PageParams & { search?: string }): Promise<PageResponse<ProductResponse>> => {
    return apiClient.get('/products', { params });
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   * GET /api/v1/products/{id}
   */
  getProductById: (id: number): Promise<ProductResponse> => {
    return apiClient.get(`/products/${id}`);
  },

  /**
   * Lấy danh sách sản phẩm theo Thương hiệu (Brand ID)
   * GET /api/v1/products/brand/{brandId}
   */
  getProductsByBrandId: (brandId: number, params?: PageParams): Promise<PageResponse<ProductResponse>> => {
    return apiClient.get(`/products/brand/${brandId}`, { params });
  },

  /**
   * Lấy danh sách sản phẩm theo Danh mục (Category ID)
   * GET /api/v1/products/category/{categoryId}
   */
  getProductsByCategoryId: (categoryId: number, params?: PageParams): Promise<PageResponse<ProductResponse>> => {
    return apiClient.get(`/products/category/${categoryId}`, { params });
  },

  /**
   * Lấy danh sách sản phẩm đang hoạt động (Active)
   * GET /api/v1/products/active
   */
  getActiveProducts: (params?: PageParams): Promise<PageResponse<ProductResponse>> => {
    return apiClient.get('/products/active', { params });
  },

  /**
   * Lấy chi tiết biến thể sản phẩm (Variant ID)
   * GET /api/v1/products/variant/{variantId}
   */
  getProductVariantById: (variantId: number): Promise<ProductVariantResponse> => {
    return apiClient.get(`/products/variant/${variantId}`);
  },

  /**
   * Lấy danh sách hình ảnh của 1 sản phẩm
   * GET /api/v1/products/{productId}/images
   */
  getProductImagesByProductId: (productId: number): Promise<ProductImageResponse[]> => {
    return apiClient.get(`/products/${productId}/images`);
  },

  // ==========================================
  // 2. ADMIN ENDPOINTS (/api/v1/admin/...)
  // ==========================================

  /**
   * [Admin] Tạo sản phẩm mới
   * POST /api/v1/admin/products
   */
  createProduct: (data: ProductRequest): Promise<ProductResponse> => {
    return apiClient.post('/admin/products', data);
  },

  /**
   * [Admin] Cập nhật thông tin sản phẩm
   * PUT /api/v1/admin/products/{id}
   */
  updateProduct: (id: number, data: ProductRequest): Promise<ProductResponse> => {
    return apiClient.put(`/admin/products/${id}`, data);
  },

  /**
   * [Admin] Xóa sản phẩm
   * DELETE /api/v1/admin/products/{id}
   */
  deleteProductById: (id: number): Promise<void> => {
    return apiClient.delete(`/admin/products/${id}`);
  },

  /**
   * [Admin] Thêm biến thể cho sản phẩm
   * POST /api/v1/admin/product-variants
   */
  addProductVariant: (data: ProductVariantRequest): Promise<ProductVariantResponse> => {
    return apiClient.post('/admin/product-variants', data);
  },

  /**
   * [Admin] Cập nhật biến thể sản phẩm
   * PUT /api/v1/admin/product-variants/{id}
   */
  updateProductVariant: (id: number, data: ProductVariantRequest): Promise<ProductVariantResponse> => {
    return apiClient.put(`/admin/product-variants/${id}`, data);
  },

  /**
   * [Admin] Xóa biến thể sản phẩm
   * DELETE /api/v1/admin/product-variants/{variantId}
   */
  deleteProductVariant: (variantId: number): Promise<void> => {
    return apiClient.delete(`/admin/product-variants/${variantId}`);
  },

  /**
   * [Admin] Thêm danh sách URL ảnh phụ cho sản phẩm
   * POST /api/v1/admin/products/{productId}/images
   */
  addSecondaryImages: (productId: number, imageUrls: string[]): Promise<ProductImageResponse[]> => {
    return apiClient.post(`/admin/products/${productId}/images`, imageUrls);
  },

  /**
   * [Admin] Upload file ảnh sản phẩm lên server
   * POST /api/v1/admin/products/{productId}/images/upload
   */
  uploadProductImages: (productId: number, files: File[]): Promise<ProductImageResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));
    return apiClient.post(`/admin/products/${productId}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * [Admin] Xóa ảnh của sản phẩm theo Image ID
   * DELETE /api/v1/admin/products/{productId}/images/{imageId}
   */
  deleteProductImage: (productId: number, imageId: number): Promise<void> => {
    return apiClient.delete(`/admin/products/${productId}/images/${imageId}`);
  },
};