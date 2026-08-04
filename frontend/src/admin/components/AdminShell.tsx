import { useEffect, useMemo, useState } from "react";
import {
  Bell, Boxes, ChartNoAxesCombined, ChevronLeft, ChevronRight, CircleDollarSign,
  ClipboardList, ContactRound, CreditCard, History, LogOut, Menu, Moon, Package,
  Palette, PanelLeftClose, PanelLeftOpen, Search, ShoppingBag, Star, Sun, Tags,
  TicketPercent, Truck, UserRound, UsersRound, Warehouse, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import laduxLogo from "../../assets/ladux-logo.png";
import { cn } from "../../app/components/ui/utils";
import { useAdminAuth } from "../auth/AdminAuthProvider";
import { AdminButton } from "./AdminUI";

interface NavigationGroup {
  label: string;
  items: Array<{ label: string; path: string; icon: LucideIcon }>;
}

const navigation: NavigationGroup[] = [
  { label: "Tổng quan", items: [{ label: "Dashboard", path: "/admin/dashboard", icon: ChartNoAxesCombined }] },
  { label: "Bán hàng", items: [
    { label: "Đơn hàng", path: "/admin/orders", icon: ShoppingBag },
    { label: "Thanh toán", path: "/admin/payments", icon: CreditCard },
    { label: "Lịch sử đơn hàng", path: "/admin/order-histories", icon: History },
    { label: "Dòng sản phẩm", path: "/admin/order-items", icon: ClipboardList },
  ] },
  { label: "Catalog", items: [
    { label: "Sản phẩm", path: "/admin/products", icon: Package },
    { label: "Thương hiệu", path: "/admin/brands", icon: Tags },
    { label: "Danh mục", path: "/admin/categories", icon: Boxes },
    { label: "Màu sắc", path: "/admin/colors", icon: Palette },
    { label: "Mã giảm giá", path: "/admin/coupons", icon: TicketPercent },
  ] },
  { label: "CRM", items: [
    { label: "Khách hàng", path: "/admin/customers", icon: ContactRound },
    { label: "Người dùng", path: "/admin/users", icon: UsersRound },
    { label: "Địa chỉ người dùng", path: "/admin/user-addresses", icon: UserRound },
    { label: "Đánh giá", path: "/admin/reviews", icon: Star },
  ] },
  { label: "Kho & mua hàng", items: [
    { label: "Nhà cung cấp", path: "/admin/suppliers", icon: Truck },
    { label: "Liên kết NCC", path: "/admin/product-suppliers", icon: Boxes },
    { label: "Đơn nhập hàng", path: "/admin/purchase-orders", icon: CircleDollarSign },
    { label: "Biến động kho", path: "/admin/stock-movements", icon: Warehouse },
  ] },
  { label: "Hệ thống", items: [{ label: "Thông báo", path: "/admin/notifications", icon: Bell }] },
];

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-20 items-center border-b border-slate-800 px-4", collapsed ? "justify-center" : "gap-3")}>
        <img src={laduxLogo} alt="LADUX" className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/15" />
        {!collapsed && <div><p className="text-lg font-black tracking-[0.14em] text-white">LADUX</p><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Admin portal</p></div>}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Điều hướng quản trị">
        {navigation.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} title={collapsed ? item.label : undefined} onClick={onNavigate} className={({ isActive }) => cn(
                    "group flex min-h-10 items-center rounded-xl text-sm font-semibold transition",
                    collapsed ? "justify-center px-2" : "gap-3 px-3",
                    isActive ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/30" : "text-slate-400 hover:bg-slate-800 hover:text-white",
                  )}>
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {!collapsed && <div className="m-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs font-bold text-white">Dữ liệu trực tiếp</p><p className="mt-1 text-[11px] leading-5 text-slate-500">Tất cả số liệu lấy từ Ladux Backend, không dùng mock data.</p></div>}
    </div>
  );
}

export default function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("admin-theme-dark", darkMode);
    return () => document.documentElement.classList.remove("admin-theme-dark");
  }, [darkMode]);

  const currentLabel = useMemo(() => {
    const item = navigation.flatMap((group) => group.items).find((entry) => location.pathname === entry.path || location.pathname.startsWith(`${entry.path}/`));
    return item?.label ?? "Quản trị";
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className={cn("min-h-screen bg-[#f6f8fc] text-slate-900", darkMode && "admin-dark")}>
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden bg-[#111827] transition-[width] duration-300 lg:block", collapsed ? "w-[76px]" : "w-[260px]")}>
        <SidebarContent collapsed={collapsed} />
        <button aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"} onClick={() => setCollapsed((value) => !value)} className="absolute -right-3 top-24 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:text-indigo-600">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
        <aside className="h-full w-[290px] bg-[#111827]" onClick={(event) => event.stopPropagation()}>
          <button aria-label="Đóng menu" onClick={() => setMobileOpen(false)} className="absolute left-[242px] top-5 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
          <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>}

      <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]")}>
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button aria-label="Mở menu" onClick={() => setMobileOpen(true)} className="mr-3 rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400">Admin / {currentLabel}</p>
            <p className="truncate text-base font-extrabold text-slate-900">{currentLabel}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button aria-label="Tìm kiếm" className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 sm:flex"><Search className="h-4 w-4" /></button>
            <button aria-label={darkMode ? "Bật giao diện sáng" : "Bật giao diện tối"} onClick={() => setDarkMode((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">{darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <div className="hidden h-9 w-px bg-slate-200 sm:block" />
            <div className="hidden text-right sm:block"><p className="max-w-36 truncate text-sm font-bold text-slate-900">{user?.fullName || user?.username}</p><p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">Administrator</p></div>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-indigo-100 text-sm font-extrabold text-indigo-700">
              {user?.avatar ? <img src={user.avatar} alt="Avatar admin" className="h-full w-full object-cover" /> : (user?.fullName || user?.username || "A").slice(0, 1).toUpperCase()}
            </div>
            <AdminButton tone="ghost" size="icon" aria-label="Đăng xuất" onClick={handleLogout}><LogOut className="h-4 w-4" /></AdminButton>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><Outlet /></main>
      </div>
    </div>
  );
}
