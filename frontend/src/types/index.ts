export type ViewType =
    | "login"
    | "register"
    | "store"
    | "all-products"
    | "product-detail"
    | "cart"
    | "checkout"
    | "orders"
    | "wishlist"
    | "about"
    | "contact"
    | "account"
    | "addresses";

export type CustomerLevel = "BROWSER" | "SILVER" | "GOLD" | "RUBY";

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPED"
    | "DELIVERED"
    | "RETURN_REQUESTED"
    | "RETURNED"
    | "REFUNDED"
    | "CANCELLED";

export type PaymentProvider = "VNPAY" | "MOMO" | "COD";

export interface VariantOption {
    ram: "16GB" | "32GB" | "64GB";
    storage: "512GB SSD" | "1TB SSD" | "2TB SSD";
    colorName: string;
    colorHex: string;
    priceDelta: number;
}

export interface ShippingAddressRequest {
    id: number;
    fullName: string;
    phone: string;
    addressDetail: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

export interface CartItem {
    product: LaptopProduct;
    quantity: number;
    selectedRam: string;
    selectedStorage: string;
    selectedColorName: string;
    selectedColorHex: string;
    price: number;
}

export interface CouponItem {
    code: string;
    discountAmount: number;
    minSubtotal: number;
    description: string;
}

export interface OrderItemRecord {
    id: string;
    orderNumber: string;
    date: string;
    items: CartItem[];
    shippingAddress: ShippingAddressRequest;
    paymentMethod: PaymentProvider;
    subTotal: number;
    discountAmount: number;
    shippingFee: number;
    finalAmount: number;
    status: OrderStatus;
    trackingNumber: string;
}

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

export interface ReviewItem {
    id: number;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    avatar: string;
}

export interface LaptopProduct {
    id: number;
    brand: string;
    category: "Gaming" | "Ultrabook" | "MacBook" | "Workstation" | "Doanh Nhân";
    name: string;
    slug: string;
    cpu: string;
    gpu: string;
    display: string;
    ram: string;
    rom: string;
    price: number;
    discountPrice?: number;
    stockQuantity: number;
    rating: number;
    reviewCount: number;
    images: string[];
    description: string;
    reviews: ReviewItem[];
    isNew?: boolean;
    isFeatured?: boolean;
}

export const formatVND = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};
