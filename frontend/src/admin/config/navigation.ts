import {
  LayoutDashboard,
  Package,
  Boxes,
  Tag,
  ShoppingCart,
  History,
  Heart,
  CreditCard,
  Users,
  ShieldCheck,
  TicketPercent,
  Star,
  type LucideIcon,
} from "lucide-react";

export interface NavLeaf {
  type: "leaf";
  label: string;
  to: string;
  icon?: LucideIcon;
}

export interface NavGroup {
  type: "group";
  id: string;
  label: string;
  icon: LucideIcon;
  /** Routes that should highlight this group as "active container" */
  matchPrefixes: string[];
  children: NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

/**
 * Information Architecture for AuraTech Admin.
 * Each group corresponds to a cluster of related backend entities.
 */
export const NAVIGATION: NavEntry[] = [
  {
    type: "leaf",
    label: "Tổng quan",
    to: "/admin",
    icon: LayoutDashboard,
  },
  {
    type: "group",
    id: "catalog",
    label: "Sản phẩm",
    icon: Package,
    matchPrefixes: ["/admin/products", "/admin/categories", "/admin/brands"],
    children: [
      { type: "leaf", label: "Danh sách Sản phẩm", to: "/admin/products", icon: Boxes },
      { type: "leaf", label: "Danh mục", to: "/admin/categories", icon: Tag },
      { type: "leaf", label: "Thương hiệu", to: "/admin/brands", icon: Tag },
    ],
  },
  {
    type: "group",
    id: "sales",
    label: "Bán hàng",
    icon: ShoppingCart,
    matchPrefixes: ["/admin/orders", "/admin/analytics/carts"],
    children: [
      { type: "leaf", label: "Đơn hàng", to: "/admin/orders", icon: ShoppingCart },
      { type: "leaf", label: "Lịch sử cập nhật đơn", to: "/admin/orders/history", icon: History },
      { type: "leaf", label: "Giỏ hàng & Wishlist", to: "/admin/analytics/carts", icon: Heart },
    ],
  },
  {
    type: "group",
    id: "finance",
    label: "Tài chính",
    icon: CreditCard,
    matchPrefixes: ["/admin/payments"],
    children: [{ type: "leaf", label: "Giao dịch", to: "/admin/payments", icon: CreditCard }],
  },
  {
    type: "group",
    id: "access",
    label: "Khách hàng & Bảo mật",
    icon: Users,
    matchPrefixes: ["/admin/users", "/admin/roles"],
    children: [
      { type: "leaf", label: "Người dùng", to: "/admin/users", icon: Users },
      { type: "leaf", label: "Phân quyền (Roles)", to: "/admin/roles", icon: ShieldCheck },
    ],
  },
  {
    type: "group",
    id: "marketing",
    label: "Marketing",
    icon: TicketPercent,
    matchPrefixes: ["/admin/coupons", "/admin/reviews"],
    children: [
      { type: "leaf", label: "Mã giảm giá", to: "/admin/coupons", icon: TicketPercent },
      { type: "leaf", label: "Đánh giá & Bình luận", to: "/admin/reviews", icon: Star },
    ],
  },
];

/** Returns true if the current location.pathname is exactly or nested under `to`. */
export const isRouteActive = (pathname: string, to: string) => {
  if (to === "/admin") return pathname === "/admin" || pathname === "/admin/";
  return pathname === to || pathname.startsWith(to + "/");
};

export const isGroupActive = (pathname: string, group: NavGroup) =>
  group.matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
