import axios from "axios";
import type { OrderStatus, PurchaseOrderStatus } from "./types";

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | string | undefined;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && data.message) return data.message;

    switch (error.response?.status) {
      case 400: return "Dữ liệu gửi lên chưa hợp lệ.";
      case 401: return "Phiên đăng nhập đã hết hạn.";
      case 403: return "Bạn không có quyền thực hiện thao tác này.";
      case 404: return "Không tìm thấy dữ liệu yêu cầu.";
      case 409: return "Dữ liệu đang được sử dụng hoặc đã tồn tại.";
      case 429: return "Bạn thao tác quá nhanh. Vui lòng thử lại sau.";
      default: return error.response ? "Backend đang gặp sự cố. Vui lòng thử lại." : "Không thể kết nối tới backend.";
    }
  }
  return error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
}

export function parseBackendDateTime(value: string): Date | null {
  const match = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, day, month, year, hour, minute, second] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hour) ||
    date.getMinutes() !== Number(minute) ||
    date.getSeconds() !== Number(second)
  ) return null;
  return date;
}

export function formatBackendDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = parseBackendDateTime(value);
  return parsed
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(parsed)
    : value;
}

export function toBackendDateTime(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("day")}-${get("month")}-${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

export function parseCurrencyInput(value: string): number | null {
  const normalized = value.replace(/[^0-9-]/g, "");
  if (!normalized || normalized === "-") return null;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function stockMovementSign(type: string): 1 | -1 {
  return ["SALE_OUT", "DAMAGE_OUT", "ADJUSTMENT_OUT"].includes(type) ? -1 : 1;
}

export function resolveImageUrl(value: string | null | undefined, backendOrigin: string): string | null {
  if (!value) return null;
  if (/^(https?:|blob:|data:)/i.test(value)) return value;
  return `${backendOrigin}${value.startsWith("/") ? "" : "/"}${value}`;
}

export const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["RETURN_REQUESTED", "RETURNED"],
  RETURN_REQUESTED: ["RETURNED", "DELIVERED"],
  RETURNED: ["REFUNDED"],
  REFUNDED: [],
  CANCELLED: [],
};

export const purchaseOrderTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  PARTIALLY_RECEIVED: [],
  RECEIVED: [],
  CANCELLED: [],
};

export function isAdminRole(roles: string[]): boolean {
  return roles.some((role) => role.toUpperCase() === "ADMIN" || role.toUpperCase() === "ROLE_ADMIN");
}
