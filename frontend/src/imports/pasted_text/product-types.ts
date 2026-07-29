You are an expert Frontend Engineer and UI/UX Designer specializing in building modern Next.js / React interfaces with Tailwind CSS and Shadcn UI.

### 1. PROJECT OVERVIEW & DOMAIN STRICT RULES
- **Project Name**: Ladux
- **Domain**: Premium Laptop-Only E-Commerce Store (B2C) & Complete Supply Chain Management / Procurement System (B2B).
- **CRITICAL DOMAIN RULE**: This store sells EXCLUSIVELY LAPTOPS (Gaming Laptop, Ultrabook, MacBook, Workstation/Creator, Business Laptop). Never introduce phones, tablets, headphones, mice, keyboards, monitors, or any external accessories. All product specifications and marketing copy MUST refer exclusively to laptops.

### 2. DESIGN SYSTEM & STYLING DIRECTIONS
- **Style**: Monochromatic black & white aesthetic with refined grays (inspired by Apple, Linear.app, Vercel, Stripe).
- **Colors**: Primary text/surfaces use pure black (#000000 / #111111) on white, or pure white (#FFFFFF) on dark. Status badges use clean, non-neon indicator colors (Green = Success/Active, Red = Danger/Cancelled, Amber = Pending).
- **Typography & Layout**: Clean sans-serif (Inter), generous whitespace, cards with subtle borders (`border-neutral-200`), sharp visual hierarchy.
- **Theme**: Support both Light and Dark modes with a theme toggle component.

### 3. TECHNICAL & AUTHENTICATION CONSTRAINTS
- **Authentication**: HttpOnly Cookies (`AUTH_TOKEN` and `REFRESH_TOKEN`). NEVER read/write tokens in `localStorage` or `sessionStorage`. Always configure requests with `withCredentials: true` (or `credentials: 'include'`).
- **CSRF Protection**: For state-changing operations, submit header `X-XSRF-TOKEN` matching cookie `XSRF-TOKEN` obtained from `GET /api/v1/auth/csrf`.
- **Pagination**: All list endpoints return Spring Data `Page<T>` structure (default page size: 12, max page size: 50).
- **Currency & Pricing**: Display prices in VND (e.g., `35.990.000 ₫`). Display `discountPrice` if present with original `price` struck-through.

---

### 4. COMPLETE TYPESCRIPT INTERFACES (MATCHING 100% SPRING BOOT DTOS)

```typescript
// Generic Spring Data Page Response
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // 0-based current page
  first: boolean;
  last: boolean;
}

// Global Error Response
export interface ErrorResponse {
  timestamp: string; // dd-MM-yyyy HH:mm:ss
  status: number;
  error: string;
  message: string;
}

// ===== ENUMS =====
export type RoleName = 'ADMIN' | 'CUSTOMER';
export type CustomerLevel = 'BROWSER' | 'SILVER' | 'GOLD' | 'RUBY';
export type DiscountType = 'PERCENT' | 'FIXED_AMOUNT';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'RETURN_REQUESTED' | 'RETURNED' | 'REFUNDED' | 'CANCELLED';
export type PaymentProvider = 'VNPAY' | 'MOMO' | 'COD';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PurchaseOrderStatus = 'PENDING' | 'CONFIRMED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
export type StockMovementType = 'PURCHASE_IN' | 'SALE_OUT' | 'RETURN_IN' | 'DAMAGE_OUT' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'OTHER';
export type StockReferenceType = 'ORDER' | 'PURCHASE_ORDER' | 'RETURN' | 'ADJUSTMENT' | 'OTHER';
export type NotificationType = 'ORDER_STATUS' | 'PAYMENT' | 'PROMOTION' | 'SYSTEM' | 'STOCK_ALERT';
export type NotificationTargetType = 'ORDER' | 'PRODUCT' | 'VOUCHER' | 'NONE';

// ===== RESPONSE DTOS =====
export interface BrandResponse {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  imageUrl?: string;
}

export interface ColorResponse {
  id: number;
  name: string;
  hexCode: string;
}

export interface ProductImageResponse {
  id: number;
  imageUrl: string;
}

export interface ProductVariantResponse {
  id: number;
  productId: number;
  sku: string;
  color: ColorResponse;
  ram?: string;
  rom?: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductResponse {
  id: number;
  brand: BrandResponse;
  category: CategoryResponse;
  name: string;
  slug: string;
  cpu?: string;
  gpu?: string;
  display?: string;
  battery?: string;
  weight?: string;
  numberOfFans?: number;
  os?: string;
  isActive: boolean;
  createdAt: string;
  images: ProductImageResponse[];
}

export interface CartItemResponse {
  id: number;
  product: ProductResponse; // Summary product details
  quantity: number;
}

export interface CartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  totalPrice: number;
}

export interface ShippingAddress {
  receiverName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface OrderItemResponse {
  id: number;
  orderId: number;
  productVariantId: number;
  quantity: number;
  priceAtPurchase: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  couponCode?: number;
  subTotal: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  createdAt: string;
  paymentExpiresAt?: string;
  orderItems: OrderItemResponse[];
  paymentProvider?: PaymentProvider;
}

export interface OrderHistoryResponse {
  id: number;
  orderId: number;
  status: string;
  description?: string;
  createdAt: string;
}

export interface PaymentCallbackResponse {
  id: number;
  orderId: number;
  provider: PaymentProvider;
  transactionNo?: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface CouponResponse {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt: string;
}

export interface CouponApplyResponse {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt: string;
}

export interface ReviewResponse {
  id: number;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface WishlistResponse {
  id: number;
  product: ProductResponse;
}

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

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  roles: string[];
}

export interface CustomerResponse {
  id: number;
  userId: number;
  email?: string;
  username?: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  loyaltyPoints: number;
  level: CustomerLevel;
  totalSpent: number;
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type: NotificationType;
  targetType?: NotificationTargetType;
  targetId?: number;
  createdAt: string;
}

export interface SupplierResponse {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductSupplierResponse {
  id: number;
  productId: number;
  productName?: string;
  supplierId: number;
  supplierName?: string;
  costPrice?: number;
  leadTimeDays?: number;
}

export interface PurchaseOrderItemResponse {
  id: number;
  productVariantId: number;
  productName?: string;
  quantity: number;
  costPrice: number;
  receivedQuantity: number;
  note?: string;
}

export interface PurchaseOrderResponse {
  id: number;
  supplierId: number;
  supplierName?: string;
  status: PurchaseOrderStatus;
  expectedDeliveryDate?: string;
  totalAmount: number;
  note?: string;
  createdById?: number;
  createdAt: string;
  updatedAt?: string;
  items: PurchaseOrderItemResponse[];
}

export interface StockMovementResponse {
  id: number;
  productId: number;
  productName?: string;
  quantity: number; // Signed integer (+ for In, - for Out)
  movementType: StockMovementType;
  referenceType?: StockReferenceType;
  referenceId?: number;
  note?: string;
  createdById?: number;
  createdAt: string;
}

export interface UploadUrlResponse {
  url: string;
}

// ===== REQUEST DTOS =====
export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { fullName: string; username: string; email: string; password: string; phone?: string; }
export interface CartItemRequest { productId: number; quantity: number; }
export interface CartQuantityRequest { quantity: number; }
export interface OrderRequest { couponCode?: string; paymentProvider: PaymentProvider; shippingAddress: ShippingAddress; }
export interface CouponApplyRequest { code: string; }
export interface ReviewCreateRequest { productId: number; rating: number; comment?: string; }
export interface ReviewUpdateRequest { rating?: number; comment?: string; }
export interface UserAddressRequest { receiverName: string; phone: string; street: string; district: string; city: string; isDefault: boolean; }
export interface UserProfileUpdateRequest { email?: string; username?: string; password?: string; fullName?: string; phone?: string; }
export interface CustomerUpdateRequest { fullName?: string; phone?: string; avatarUrl?: string; level?: CustomerLevel; loyaltyPoints?: number; totalSpent?: number; }
export interface SupplierRequest { name: string; address?: string; phone?: string; email?: string; isActive?: boolean; }
export interface ProductSupplierRequest { productId: number; supplierId: number; costPrice?: number; leadTimeDays?: number; }
export interface PurchaseOrderItemRequest { productId: number; quantity: number; costPrice: number; note?: string; }
export interface PurchaseOrderCreateRequest { supplierId: number; expectedDeliveryDate?: string; note?: string; items: PurchaseOrderItemRequest[]; }
export interface PurchaseOrderReceiveRequest { lines: { itemId: number; receivedQuantity: number; }[]; }
export interface StockMovementRequest { productId: number; quantity: number; movementType: StockMovementType; note?: string; }
export interface NotificationRequest { title: string; message: string; type: NotificationType; targetType: NotificationTargetType; targetId?: number; }