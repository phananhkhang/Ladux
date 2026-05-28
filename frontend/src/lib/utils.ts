import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProductResponse, ProductSpecs } from "../types/api";

type PriceableProduct = Pick<ProductResponse, "basePrice" | "discountPrice"> | null | undefined;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmtUSD = (value: number | null | undefined) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    : "-";

export const fmtVND = (usd: number | null | undefined) => {
  if (typeof usd !== "number") return "-";
  const vnd = Math.round(usd * 25500);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(vnd);
};

export const parseSpecs = (raw: ProductResponse["specs"]): ProductSpecs => {
  if (!raw) return {};
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw) as ProductSpecs;
  } catch {
    return {};
  }
};

export const effPrice = (product: PriceableProduct) =>
  product?.discountPrice ?? product?.basePrice ?? 0;

export const discountPct = (product: PriceableProduct) =>
  product?.discountPrice && product?.basePrice && product.basePrice > product.discountPrice
    ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
    : 0;
