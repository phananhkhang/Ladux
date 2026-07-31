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
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "RETURN_REQUESTED"
    | "RETURNED"
    | "REFUNDED"
    | "CANCELLED";

export type PaymentProvider = "VNPAY" | "ZALOPAY" | "MOMO" | "COD";

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

import type { ProductResponse, ProductVariantResponse } from "../services/productService";

export interface LaptopProduct {
    id: number;
    brand: string;
    brandId?: number;
    category: string;
    categoryId?: number;
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

/**
 * Chuyển đổi ProductResponse (Backend DTO) → LaptopProduct (Frontend UI type)
 * Nếu có variants, lấy variant đầu tiên active để fill ram/rom/price.
 */
export function mapProductResponseToLaptopProduct(
    product: ProductResponse,
    variants?: ProductVariantResponse[]
): LaptopProduct {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1").replace("/api/v1", "");

    // Lấy variant chính (ưu tiên variant active đầu tiên)
    const availableVariants = variants || product.variants;
    const activeVariant = availableVariants?.find((v) => v.isActive) ?? availableVariants?.[0];

    // Map images: backend trả { imageUrl } relative → cần prefix API_BASE nếu là relative path
    const imageUrls = (product.images || []).map((img) => {
        if (!img?.imageUrl) return "https://placehold.co/400x300/121214/666?text=No+Image";
        if (img.imageUrl.startsWith("http")) return img.imageUrl;
        return `${API_BASE}${img.imageUrl.startsWith("/") ? "" : "/"}${img.imageUrl}`;
    });

    // Kiểm tra isNew: sản phẩm tạo trong 30 ngày gần đây
    const createdDate = product.createdAt ? new Date(product.createdAt) : null;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isNew = createdDate ? createdDate > thirtyDaysAgo : false;

    return {
        id: product.id,
        brand: product.brand?.name || "Unknown",
        brandId: product.brand?.id,
        category: product.category?.name || "Other",
        categoryId: product.category?.id,
        name: product.name || "",
        slug: product.slug || "",
        cpu: product.cpu || "",
        gpu: product.gpu || "",
        display: product.display || "",
        ram: activeVariant?.ram || "",
        rom: activeVariant?.rom || "",
        price: activeVariant ? Number(activeVariant.price) : 0,
        discountPrice: activeVariant?.discountPrice ? Number(activeVariant.discountPrice) : undefined,
        stockQuantity: activeVariant?.stockQuantity ?? 0,
        rating: 0,
        reviewCount: 0,
        images: imageUrls.length > 0 ? imageUrls : ["https://placehold.co/400x300/121214/666?text=No+Image"],
        description: "",
        reviews: [],
        isNew,
        isFeatured: false,
    };
}

export const formatVND = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

export function getAvatarUrl(avatarPath?: string | null): string {
    if (!avatarPath) {
        return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&auto=format";
    }
    if (avatarPath.startsWith("http") || avatarPath.startsWith("blob:")) {
        return avatarPath;
    }
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1").replace("/api/v1", "");
    return `${API_BASE}${avatarPath.startsWith("/") ? "" : "/"}${avatarPath}`;
}
