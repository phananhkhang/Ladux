// Shared UI helpers and type re-exports.
// Live catalog/order data comes from the Spring Boot REST API via @/api/client.

export type {
  OrderStatus,
  PaymentStatus,
  PaymentProvider,
  CustomerLevel,
  PurchaseOrderStatus,
  StockMovementType,
  DiscountType,
} from "@/api/types";

export {
  formatPrice,
  formatDate,
  productDiscountPercent as discountPercent,
  shortSpecFromSpecs,
  productImages,
  formatAddress,
} from "@/lib/format";

// Legacy UI Product shape (mapped from ProductResponse for cards that still expect it)
export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  basePrice: number;
  discountPrice: number | null;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  images: string[];
  shortSpec: string;
  specs: string;
  description: string;
  sku?: string;
  isActive?: boolean;
  brandId?: number;
  categoryId?: number;
  thumbnail?: string | null;
}

import type { ProductResponse } from "@/api/types";
import { productImages, shortSpecFromSpecs } from "@/lib/format";

export function mapProduct(
  p: ProductResponse,
  extras?: { rating?: number; reviewCount?: number; description?: string },
): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand?.name ?? "—",
    category: p.category?.name ?? "—",
    basePrice: Number(p.basePrice),
    discountPrice: p.discountPrice != null ? Number(p.discountPrice) : null,
    stockQuantity: p.stockQuantity,
    rating: extras?.rating ?? 0,
    reviewCount: extras?.reviewCount ?? 0,
    images: productImages(p),
    shortSpec: shortSpecFromSpecs(p.specs),
    specs: p.specs ?? "{}",
    description: extras?.description ?? shortSpecFromSpecs(p.specs),
    sku: p.sku,
    isActive: p.isActive,
    brandId: p.brand?.id,
    categoryId: p.category?.id,
    thumbnail: p.thumbnail,
  };
}
