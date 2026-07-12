import type { ProductResponse } from "@/api/types";

export function formatPrice(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function discountPercent(
  basePrice: number,
  discountPrice: number | null | undefined,
): number | null {
  if (discountPrice == null || discountPrice <= 0 || basePrice <= 0) return null;
  return Math.round(((basePrice - discountPrice) / basePrice) * 100);
}

export function productDiscountPercent(p: {
  basePrice: number;
  discountPrice: number | null;
}): number | null {
  return discountPercent(p.basePrice, p.discountPrice);
}

/** Build a short one-line spec summary from JSON specs string. */
export function shortSpecFromSpecs(specs: string | null | undefined): string {
  if (!specs) return "";
  try {
    const obj = JSON.parse(specs) as Record<string, string>;
    return Object.values(obj).slice(0, 5).join(" · ");
  } catch {
    return specs.slice(0, 80);
  }
}

export function productImages(p: ProductResponse): string[] {
  const urls: string[] = [];
  if (p.thumbnail) urls.push(p.thumbnail);
  for (const img of p.image ?? []) {
    if (img.imageUrl && !urls.includes(img.imageUrl)) urls.push(img.imageUrl);
  }
  if (urls.length === 0) {
    urls.push("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80");
  }
  return urls;
}

export function formatAddress(a: {
  receiverName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
}): string {
  return `${a.receiverName} — ${a.street}, ${a.district}, ${a.city} (${a.phone})`;
}

export function isAdmin(roles: string[] | undefined | null): boolean {
  if (!roles?.length) return false;
  return roles.some((r) => r === "ADMIN" || r === "ROLE_ADMIN");
}
