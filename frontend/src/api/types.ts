// Types matching backend DTOs under org.akira.ladux.dto.*

// ── Enums ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type PaymentProvider = "VNPAY" | "MOMO" | "COD";

export type DiscountType = "PERCENT" | "FIXED_AMOUNT";

export type CustomerLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export type PurchaseOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export type StockMovementType =
  | "PURCHASE_IN"
  | "SALE_OUT"
  | "RETURN_IN"
  | "DAMAGE_OUT"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "OTHER";

export type StockReferenceType =
  | "PURCHASE_ORDER"
  | "ORDER"
  | "ADJUSTMENT"
  | "RETURN";

// ── Spring Page ──────────────────────────────────────────────────────────────

export interface Page<T> {
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
  sort?: string | string[];
}

// ── Error ────────────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

// ── Catalog ──────────────────────────────────────────────────────────────────

export interface BrandResponse {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  /** Relative path or absolute URL, e.g. /uploads/categories/categories_laptop_gaming.webp */
  imageUrl?: string | null;
}

export interface ProductImageResponse {
  id: number;
  imageUrl: string;
}

export interface ProductResponse {
  id: number;
  brand: BrandResponse | null;
  category: CategoryResponse | null;
  sku: string;
  name: string;
  slug: string;
  basePrice: number;
  discountPrice: number | null;
  stockQuantity: number;
  specs: string | null;
  thumbnail: string | null;
  isActive: boolean;
  createdAt: string;
  image: ProductImageResponse[];
}

export interface ReviewResponse {
  id: number;
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

// ── Auth / User ──────────────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
}

export interface UserProfileUpdateRequest {
  email?: string;
  username?: string;
  password?: string;
  fullName?: string;
  phone?: string;
}

export interface UserAdminUpdateRequest {
  email?: string;
  username?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  /** Role IDs: 1 = ADMIN, 2 = CUSTOMER (seed defaults). */
  roleIds?: number[];
}

// ── Cart / Wishlist ──────────────────────────────────────────────────────────

export interface CartItemResponse {
  id: number;
  product: ProductResponse;
  quantity: number;
}

export interface CartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  totalPrice: number;
}

export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface CartQuantityRequest {
  quantity: number;
}

export interface WishlistResponse {
  id: number;
  product: ProductResponse;
}

export interface WishlistRequest {
  productId: number;
}

// ── Orders / Payments ────────────────────────────────────────────────────────

export interface OrderItemResponse {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  couponCode: number | null;
  subTotal: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  trackingNumber: string | null;
  createdAt: string;
  paymentExpiresAt: string | null;
  orderItems: OrderItemResponse[];
  paymentProvider: PaymentProvider | null;
}

export interface OrderRequest {
  couponCode?: string | null;
  paymentProvider: PaymentProvider;
  shippingAddress: string;
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
  trackingNumber?: string | null;
}

export interface PaymentCallbackResponse {
  id: number;
  orderId: number;
  provider: PaymentProvider;
  transactionNo: string | null;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface PaymentCreateRequest {
  orderId: number;
  provider: PaymentProvider;
}

// ── Addresses ────────────────────────────────────────────────────────────────

export interface UserAddressResponse {
  id: number;
  userId: number;
  receiverName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface UserAddressRequest {
  receiverName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  isDefault: boolean;
}

// ── Coupons ──────────────────────────────────────────────────────────────────

export interface CouponResponse {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string;
}

export interface CouponApplyRequest {
  code: string;
}

export interface CouponApplyResponse {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string;
}

export interface CouponAdminRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number | null;
  usageLimit?: number | null;
  expiresAt: string;
}

// ── Customers (admin) ────────────────────────────────────────────────────────

export interface CustomerResponse {
  id: number;
  userId: number;
  email: string;
  username: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  loyaltyPoints: number;
  level: CustomerLevel;
  totalSpent: number;
}

export interface CustomerUpdateRequest {
  fullName?: string;
  phone?: string;
  level?: CustomerLevel;
  loyaltyPoints?: number;
}

// ── Catalog admin requests ───────────────────────────────────────────────────

export interface ProductRequest {
  brandId: number;
  categoryId: number;
  /** Optional — backend auto-generates from product name when omitted */
  sku?: string;
  name: string;
  basePrice: number;
  discountPrice?: number | null;
  stockQuantity?: number;
  specs?: string | null;
  thumbnail?: string | null;
  isActive?: boolean;
  imageUrls?: string[];
}

export interface BrandRequest {
  name: string;
}

export interface CategoryRequest {
  name: string;
  parentId?: number | null;
  imageUrl?: string | null;
}

/** Public path returned by orphan multipart upload endpoints (category image, etc.). */
export interface UploadUrlResponse {
  url: string;
}

export interface ReviewCreateRequest {
  productId: number;
  rating: number;
  comment?: string;
}

// ── Supply chain ─────────────────────────────────────────────────────────────

export interface SupplierResponse {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface SupplierRequest {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
}

export interface ProductSupplierResponse {
  id: number;
  productId: number;
  productName: string;
  supplierId: number;
  supplierName: string;
  costPrice: number;
  leadTimeDays: number;
}

export interface ProductSupplierRequest {
  productId: number;
  supplierId: number;
  costPrice?: number | null;
  leadTimeDays?: number | null;
}

export interface PurchaseOrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  receivedQuantity: number;
  note: string | null;
}

export interface PurchaseOrderResponse {
  id: number;
  supplierId: number;
  supplierName: string;
  status: PurchaseOrderStatus;
  expectedDeliveryDate: string | null;
  totalAmount: number;
  note: string | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string | null;
  items: PurchaseOrderItemResponse[];
}

export interface PurchaseOrderItemRequest {
  productId: number;
  quantity: number;
  costPrice: number;
  note?: string | null;
}

export interface PurchaseOrderCreateRequest {
  supplierId: number;
  expectedDeliveryDate?: string | null;
  note?: string | null;
  items: PurchaseOrderItemRequest[];
}

export interface PurchaseOrderStatusUpdateRequest {
  status: PurchaseOrderStatus;
}

export interface PurchaseOrderReceiveRequest {
  items: { productId: number; receivedQuantity: number }[];
}

export interface StockMovementResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  movementType: StockMovementType;
  referenceType: StockReferenceType | null;
  referenceId: number | null;
  note: string | null;
  createdById: number | null;
  createdAt: string;
}

export interface StockMovementRequest {
  productId: number;
  quantity: number;
  movementType: StockMovementType;
  note?: string | null;
}
