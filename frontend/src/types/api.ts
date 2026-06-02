export type Id = number;
export type ISODateTime = string;

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentProvider = "COD" | "VNPAY";

export interface ApiPage<T> {
  content: T[];
  totalElements: number;
  totalPages?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
}

export interface BrandResponse {
  id: Id;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface CategoryResponse {
  id: Id;
  name: string;
  slug: string;
  parentId: Id | null;
}

export interface ProductImageResponse {
  id: Id;
  imageUrl: string;
}

export interface ProductSpecs {
  cpu?: string;
  ram?: string;
  gpu?: string;
  storage?: string;
  display?: string;
  [key: string]: unknown;
}

export interface ProductResponse {
  id: Id;
  brand: BrandResponse | null;
  category: CategoryResponse | null;
  sku: string;
  name: string;
  slug: string;
  basePrice: number;
  discountPrice: number | null;
  stockQuantity: number;
  specs: string | ProductSpecs | null;
  thumbnail: string;
  isActive?: boolean;
  active?: boolean;
  createdAt: ISODateTime;
  image: ProductImageResponse[];
}

export interface ReviewResponse {
  id: Id;
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number;
  comment: string;
  createdAt: ISODateTime;
}

export interface CartItemResponse {
  id: Id;
  product: ProductResponse | null;
  quantity: number;
}

export type CartLine = CartItemResponse & { product: ProductResponse };

export interface CartResponse {
  id: Id;
  userId: Id;
  items: CartItemResponse[];
  totalPrice: number;
}

export interface WishlistResponse {
  id: Id;
  product: ProductResponse | null;
  addedAt: ISODateTime;
}

export interface UserResponse {
  id: Id;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  isActive?: boolean;
  active?: boolean;
  createdAt: ISODateTime;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone?: string; // optional to match backend (no @NotBlank, only pattern if present)
}

export interface CouponResponse {
  id: Id;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: ISODateTime;
}

export interface CouponApplyResponse extends CouponResponse {
  discountAmount: number;
}

export interface OrderLineRequest {
  productId: Id;
  quantity: number;
}

export interface OrderRequest {
  couponId?: string | null;
  couponCode?: string | null;
  paymentProvider: PaymentProvider;
  shippingAddress: string;
  items: OrderLineRequest[];
}

export interface OrderItemResponse {
  id: Id;
  orderId: Id | null;
  productId: Id | null;
  quantity: number;
  priceAtPurchase: number;
  productName?: string;
  thumbnail?: string;
}

export interface OrderResponse {
  id: Id;
  userId: Id | null;
  couponId: Id | null;
  subTotal: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  trackingNumber: string | null;
  createdAt: ISODateTime;
  paymentExpiresAt: ISODateTime | null;
  orderItems: OrderItemResponse[];
  items?: OrderItemResponse[];
  paymentProvider?: PaymentProvider;
}

export interface ProductQuery {
  page?: number;
  size?: number;
  search?: string;
  brandId?: Id;
  categoryId?: Id;
  sort?: string;
}

export interface ReviewQuery {
  page?: number;
  size?: number;
}

export interface PageQuery {
  page?: number;
  size?: number;
}

// ============ Additional request/response types for full integration ============

export interface ReviewCreateRequest {
  productId: Id;
  rating: number;
  comment: string;
}

export interface ReviewUpdateRequest {
  rating?: number;
  comment?: string;
}

export interface UserAddressRequest {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  ward?: string | null;
  district?: string | null;
  city: string;
  postalCode?: string | null;
  country?: string;
  isDefault?: boolean;
}

export interface UserAddressResponse {
  id: Id;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  ward?: string | null;
  district?: string | null;
  city: string;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
  createdAt: ISODateTime;
}

export interface ProductRequest {
  brandId: Id;
  categoryId: Id;
  sku: string;
  name: string;
  basePrice: number;
  discountPrice?: number | null;
  stockQuantity?: number;
  specs?: string | null;
  thumbnail?: string | null;
  isActive?: boolean;
  imageUrls?: string[];
}

// For admin order status update (backend uses OrderStatusUpdateRequest { status })
export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}
