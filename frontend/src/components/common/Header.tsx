import React from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Search,
    Heart,
    ShoppingBag,
    Lock,
    User,
    ChevronRight,
    Phone,
    MapPin,
    LogOut,
    Package,
} from "lucide-react";
import laduxLogoImg from "../../assets/ladux-logo.png";
import { getAvatarUrl } from "../../types";
import { ROUTES } from "../../app/routePaths";
import { useAuthStore, useOrderStore, useWishlistStore } from "../../stores";

export interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    wishlistCount: number;
    cartCount: number;
    isLoggedIn: boolean;
    userAvatar?: string;
    userName?: string;
}

export default function Header({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    wishlistCount,
    cartCount,
    isLoggedIn: propsIsLoggedIn,
    userAvatar: propsUserAvatar,
    userName: propsUserName,
}: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Dynamic data from Zustand stores
    const user = useAuthStore((state) => state.user);
    const authIsLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const logout = useAuthStore((state) => state.logout);

    const orders = useOrderStore((state) => state.orders);
    const totalOrderElements = useOrderStore((state) => state.totalElements);
    const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);

    const isLoggedIn = authIsLoggedIn || propsIsLoggedIn;
    const displayName = user?.fullName || user?.username || propsUserName || "Thành viên LADUX";
    const userPhone = user?.phone || user?.email || "";
    const userAvatar = getAvatarUrl(user?.avatar || propsUserAvatar);

    const displayWishlistCount = wishlistProductIds.length > 0 ? wishlistProductIds.length : wishlistCount;
    const displayOrderCount = totalOrderElements > 0 ? totalOrderElements : (orders.length > 0 ? orders.length : 1);

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            // fallback
        }
        navigate(ROUTES.home);
    };

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080a0b]/80 text-white backdrop-blur-xl">
            <div className="container mx-auto px-5 sm:px-6 h-[72px] relative flex items-center justify-between">
                {/* ── Logo ── */}
                <div className="z-10 flex items-center shrink-0">
                    <Link
                        to={ROUTES.home}
                        className="flex items-center ml-10 gap-2.5 group shrink-0 cursor-pointer"
                    >
                        <img
                            src={laduxLogoImg}
                            alt="LADUX Logo"
                            className="h-9 sm:h-10 w-auto object-contain rounded-[10px] group-hover:scale-105 transition-transform"
                        />
                        <span className="hidden sm:block text-xl font-black tracking-widest text-[#00FF41]">LADUX</span>
                    </Link>
                </div>

                {/* ── Independent Centered Search Bar (w-900) ── */}
                <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[min(900px,calc(100%-280px))] hidden sm:flex items-stretch h-11 rounded-[1px] overflow-hidden border border-white/[0.12] bg-white/[0.04] focus-within:border-[#00FF41]/60 focus-within:ring-1 focus-within:ring-[#00FF41]/20 transition-all z-10">
                    {/* Text Input */}
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value.trim() && location.pathname !== ROUTES.products) {
                                handleNavigate(ROUTES.products);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && location.pathname !== ROUTES.products) {
                                handleNavigate(ROUTES.products);
                            }
                        }}
                        className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none min-w-0"
                    />

                    {/* Divider */}
                    <div className="w-px bg-white/[0.1] self-stretch" />

                    {/* Category Dropdown */}
                    <div className="relative flex items-center shrink-0">
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                if (location.pathname !== ROUTES.products) {
                                    handleNavigate(ROUTES.products);
                                }
                            }}
                            className="appearance-none bg-transparent pl-4 pr-8 h-full text-[11px] font-bold uppercase tracking-widest text-neutral-300 focus:outline-none cursor-pointer hover:text-white transition-colors"
                        >
                            <option value="All" className="bg-[#0d0f10] text-white">
                                Chọn danh mục
                            </option>
                            <option value="Gaming" className="bg-[#0d0f10] text-white">
                                Gaming
                            </option>
                            <option value="Ultrabook" className="bg-[#0d0f10] text-white">
                                Ultrabook
                            </option>
                            <option value="MacBook" className="bg-[#0d0f10] text-white">
                                MacBook
                            </option>
                            <option value="Workstation" className="bg-[#0d0f10] text-white">
                                Workstation
                            </option>
                            <option value="Doanh Nhân" className="bg-[#0d0f10] text-white">
                                Doanh Nhân
                            </option>
                        </select>
                        <ChevronRight className="absolute right-2 w-3.5 h-3.5 text-neutral-400 rotate-90 pointer-events-none" />
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={() => handleNavigate(ROUTES.products)}
                        className="flex items-center justify-center w-12 bg-[#00FF41] hover:bg-[#00cc34] active:bg-[#00b32d] transition-colors shrink-0"
                        aria-label="Tìm kiếm"
                    >
                        <Search className="w-5 h-5 text-black stroke-[2.5]" />
                    </button>
                </div>

                {/* ── Right Actions ── */}
                <div className="z-10 flex items-center gap-2 shrink-0 ml-auto mr-10">
                    {/* Wishlist Badge */}
                    <Link
                        to={ROUTES.wishlist}
                        className="relative p-2.5 text-neutral-400 hover:text-white transition rounded-xl hover:bg-white/[0.06]"
                        aria-label="Danh sách yêu thích"
                    >
                        <Heart className="w-5 h-5 text-red-400 fill-red-400/20" />
                        {displayWishlistCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-[#00FF41] text-black font-bold text-[9px] rounded-full flex items-center justify-center">
                                {displayWishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart Badge */}
                    <Link
                        to={ROUTES.cart}
                        className="relative p-2.5 text-neutral-400 hover:text-white transition rounded-xl hover:bg-white/[0.06]"
                        aria-label="Giỏ hàng"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-[#00FF41] text-black font-bold text-[9px] rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* ── User Account CTA & Popover Dropdown ── */}
                    <div className="relative group/user">
                        {isLoggedIn ? (
                            /* Logged in CTA Button */
                            <button
                                onClick={() => navigate(ROUTES.account)}
                                className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-white/[0.04] py-1 pl-1 pr-3 text-neutral-100 transition hover:border-[#00FF41] hover:bg-white/[0.08]"
                            >
                                <img
                                    src={userAvatar}
                                    alt="Avatar"
                                    className="h-7 w-7 rounded-full object-cover border-2 border-[#00FF41]"
                                />
                                <span className="text-xs font-bold truncate max-w-[110px]">
                                    {displayName}
                                </span>
                            </button>
                        ) : (
                            /* Unauthenticated CTA Button */
                            <button
                                onClick={() => navigate(ROUTES.login)}
                                className="w-9 h-9 rounded-full border border-emerald-500/50 bg-white/[0.04] flex items-center justify-center text-[#00FF41] hover:border-[#00FF41] hover:bg-[#00FF41]/10 transition-all cursor-pointer"
                                aria-label="Đăng nhập"
                            >
                                <User className="w-4.5 h-4.5 text-[#00FF41]" />
                            </button>
                        )}

                        {/* Hover Dropdown Popover */}
                        <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 z-50 pointer-events-none group-hover/user:pointer-events-auto">
                            <div className={`bg-[#0d0f11] border border-white/10 rounded-2xl shadow-2xl p-4 text-white font-sans ${isLoggedIn ? "w-72" : "w-64"}`}>
                                {isLoggedIn ? (
                                    <>
                                        {/* User Header Info */}
                                        <div className="px-1 py-0.5">
                                            <div className="font-extrabold text-sm text-white truncate">{displayName}</div>
                                            <div className="text-[11px] font-mono text-[#00FF41] font-semibold flex items-center gap-1 mt-0.5">
                                                <span>GOLD MEMBER</span>
                                                <span>·</span>
                                                <span>{userPhone}</span>
                                            </div>
                                        </div>

                                        <div className="my-3 border-b border-white/10" />

                                        {/* Nav items */}
                                        <div className="space-y-1">
                                            <Link
                                                to={ROUTES.account}
                                                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/[0.06] transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <User className="w-4 h-4 text-[#00FF41]" />
                                                    <span>Xem thông tin tài khoản</span>
                                                </div>
                                            </Link>

                                            <Link
                                                to={ROUTES.orders}
                                                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/[0.06] transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Package className="w-4 h-4 text-[#00FF41]" />
                                                    <span>Quản lý đơn hàng</span>
                                                </div>
                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#00FF41]/20 text-[#00FF41] rounded-md">
                                                    {displayOrderCount}
                                                </span>
                                            </Link>

                                            <Link
                                                to={ROUTES.addresses}
                                                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/[0.06] transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-4 h-4 text-[#00FF41]" />
                                                    <span>Sổ địa chỉ giao hàng</span>
                                                </div>
                                            </Link>

                                            <Link
                                                to={ROUTES.wishlist}
                                                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/[0.06] transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                                                    <span>Danh sách yêu thích</span>
                                                </div>
                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-md">
                                                    {displayWishlistCount}
                                                </span>
                                            </Link>
                                        </div>

                                        <div className="my-3 border-b border-white/10" />

                                        {/* Logout action */}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition text-left"
                                        >
                                            <LogOut className="w-4 h-4 text-red-500" />
                                            <span>Đăng xuất</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Unauthenticated Popover */}
                                        <button
                                            onClick={() => navigate(ROUTES.login)}
                                            className="w-full bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 text-xs tracking-wider transition shadow-lg shadow-[#00FF41]/20 uppercase"
                                        >
                                            <Lock className="w-4 h-4 text-black stroke-[2.5]" />
                                            <span>Đăng nhập</span>
                                        </button>
                                        <Link
                                            to={ROUTES.register}
                                            className="w-full text-center text-xs font-semibold text-neutral-300 hover:text-[#00FF41] transition-colors mt-3 block py-1"
                                        >
                                            Tạo tài khoản mới
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Sub-header (Header phụ) ── */}
            <div className="border-t border-white/[0.06] bg-black/35 py-3">
                <div className="container mx-auto px-5 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[16px] text-neutral-300 font-medium">
                    {/* Left side links */}
                    <div className="flex flex-wrap items-center gap-x-10 gap-y-3 ml-10">
                        <NavLink
                            to={ROUTES.home}
                            end
                            className={({ isActive }) =>
                                `transition-colors pb-1 hover:text-[#00FF41] border-b-2 text-[16px] ${isActive
                                    ? "text-[#00FF41] border-[#00FF41] font-semibold"
                                    : "text-neutral-300 border-transparent hover:border-[#00FF41]/50"
                                }`
                            }
                        >
                            Trang chủ
                        </NavLink>
                        <NavLink
                            to={ROUTES.products}
                            className={({ isActive }) =>
                                `transition-colors pb-1 hover:text-[#00FF41] border-b-2 text-[16px] ${isActive
                                    ? "text-[#00FF41] border-[#00FF41] font-semibold"
                                    : "text-neutral-300 border-transparent hover:border-[#00FF41]/50"
                                }`
                            }
                        >
                            Sản phẩm
                        </NavLink>
                        <NavLink
                            to={ROUTES.about}
                            className={({ isActive }) =>
                                `transition-colors pb-1 hover:text-[#00FF41] border-b-2 text-[16px] ${isActive
                                    ? "text-[#00FF41] border-[#00FF41] font-semibold"
                                    : "text-neutral-300 border-transparent hover:border-[#00FF41]/50"
                                }`
                            }
                        >
                            Về chúng tôi
                        </NavLink>
                        <a
                            href="#"
                            className="transition-colors pb-1 hover:text-[#00FF41] border-b-2 border-transparent hover:border-[#00FF41]/50 text-neutral-300 text-[16px]"
                        >
                            Blog tech
                        </a>
                        <a
                            href="#"
                            className="transition-colors pb-1 hover:text-[#00FF41] border-b-2 border-transparent hover:border-[#00FF41]/50 text-neutral-300 text-[16px]"
                        >
                            Tư vấn
                        </a>
                        <NavLink
                            to={ROUTES.contact}
                            className={({ isActive }) =>
                                `transition-colors pb-1 hover:text-[#00FF41] border-b-2 text-[16px] ${isActive
                                    ? "text-[#00FF41] border-[#00FF41] font-semibold"
                                    : "text-neutral-300 border-transparent hover:border-[#00FF41]/50"
                                }`
                            }
                        >
                            Liên hệ
                        </NavLink>
                    </div>

                    {/* Right side info */}
                    <div className="flex items-center gap-6 text-[15px]">
                        <div className="flex items-center gap-2.5 group cursor-pointer">
                            <Phone className="w-[18px] h-[18px] text-[#00FF41] group-hover:scale-110 transition-transform" />
                            <span className="text-neutral-400 group-hover:text-white transition-colors">
                                Hotline: <strong className="text-white font-medium">0352 060306</strong> (Miễn phí)
                            </span>
                        </div>
                        <span className="text-white/10 hidden sm:inline">|</span>
                        <div className="flex items-center gap-2.5 text-[#00FF41] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
                            <span>Giao hỏa tốc 2H</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
