import React from "react";
import { Search, Heart, ShoppingBag, Lock, User, ChevronRight, Phone } from "lucide-react";
import laduxLogoImg from "../../assets/ladux-logo.png";
import { ViewType, getAvatarUrl } from "../../types";

export interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
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
    currentView,
    setCurrentView,
    wishlistCount,
    cartCount,
    isLoggedIn,
    userAvatar,
    userName,
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080a0b]/80 text-white backdrop-blur-xl">
            <div className="container mx-auto px-5 sm:px-6 h-[72px] flex items-center gap-4 lg:gap-6">
                {/* ── Logo ── */}
                <div
                    onClick={() => setCurrentView("store")}
                    className="cursor-pointer flex items-center gap-2.5 group shrink-0"
                >
                    <img
                        src={laduxLogoImg}
                        alt="LADUX Logo"
                        className="h-9 sm:h-10 w-auto object-contain rounded-[10px] group-hover:scale-105 transition-transform"
                    />
                    <span className="hidden sm:block text-xl font-black tracking-widest text-white">LADUX</span>
                </div>

                {/* ── Search Bar (Amazon-style) ── */}
                <div className="flex-1 flex items-stretch h-11 rounded-[1px] overflow-hidden border border-white/[0.12] bg-white/[0.04] focus-within:border-[#00FF41]/60 focus-within:ring-1 focus-within:ring-[#00FF41]/20 transition-all max-w-[calc(100%-20px)] ml-2">
                    {/* Text Input */}
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value.trim()) {
                                setCurrentView("all-products");
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setCurrentView("all-products");
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
                                setCurrentView("all-products");
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
                        onClick={() => setCurrentView("all-products")}
                        className="flex items-center justify-center w-12 bg-[#00FF41] hover:bg-[#00cc34] active:bg-[#00b32d] transition-colors shrink-0"
                        aria-label="Tìm kiếm"
                    >
                        <Search className="w-5 h-5 text-black stroke-[2.5]" />
                    </button>
                </div>

                {/* ── Right Actions ── */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Wishlist Badge */}
                    <button
                        onClick={() => setCurrentView("wishlist")}
                        className="relative p-2.5 text-neutral-400 hover:text-white transition rounded-xl hover:bg-white/[0.06]"
                        aria-label="Danh sách yêu thích"
                    >
                        <Heart className="w-5 h-5 text-red-400 fill-red-400/20" />
                        {wishlistCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-[#00FF41] text-black font-bold text-[9px] rounded-full flex items-center justify-center">
                                {wishlistCount}
                            </span>
                        )}
                    </button>

                    {/* Cart Badge */}
                    <button
                        onClick={() => setCurrentView("cart")}
                        className="relative p-2.5 text-neutral-400 hover:text-white transition rounded-xl hover:bg-white/[0.06]"
                        aria-label="Giỏ hàng"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-[#00FF41] text-black font-bold text-[9px] rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* Account / Profile */}
                    {isLoggedIn ? (
                        <button
                            onClick={() => setCurrentView("account")}
                            aria-label="Tài khoản"
                            className="group hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3.5 text-neutral-200 transition hover:border-[#00FF41]/50 hover:bg-white/[0.08]"
                        >
                            {userAvatar && (
                                <img
                                    src={getAvatarUrl(userAvatar)}
                                    alt="Avatar"
                                    className="h-7 w-7 rounded-lg object-cover border border-[#00FF41]"
                                />
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] truncate max-w-[100px]">
                                {userName || "Tài khoản"}
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentView("login")}
                            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#00FF41]/40 bg-[#00FF41]/10 py-2 px-4 text-[#00FF41] text-[10px] font-bold uppercase tracking-widest hover:bg-[#00FF41]/20 transition"
                        >
                            <Lock className="w-3.5 h-3.5" /> Đăng nhập
                        </button>
                    )}
                    <button
                        onClick={() => setCurrentView(isLoggedIn ? "account" : "login")}
                        aria-label="Tài khoản"
                        className="sm:hidden p-2.5 text-neutral-400 hover:text-[#00FF41] rounded-xl hover:bg-white/[0.06] transition"
                    >
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* ── Sub-header (Header phụ) ── */}
            <div className="border-t border-white/[0.06] bg-black/35 py-3">
                <div className="container mx-auto px-5 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[16px] text-neutral-300 font-medium">
                    {/* Left side links */}
                    <div className="flex flex-wrap items-center gap-x-10 gap-y-3 ml-10">
                        <button
                            onClick={() => setCurrentView("store")}
                            className={`transition-colors pb-1 hover:text-[#00FF41] border-b-2 text-[16px] ${currentView === "store"
                                ? "text-[#00FF41] border-[#00FF41] font-semibold"
                                : "text-neutral-300 border-transparent hover:border-[#00FF41]/50"
                                }`}
                        >
                            Trang chủ
                        </button>
                        <button
                            onClick={() => setCurrentView("all-products")}
                            className={`transition-colors pb-1 hover:text-[#00FF41] border-b-2 text-[16px] ${
                                currentView === "all-products"
                                    ? "text-[#00FF41] border-[#00FF41] font-semibold"
                                    : "text-neutral-300 border-transparent hover:border-[#00FF41]/50"
                            }`}
                        >
                            Sản phẩm
                        </button>
                        <button
                            onClick={() => setCurrentView("about")}
                            className={`transition-colors pb-1 hover:text-[#00FF41] border-b-2 text-[16px] ${
                                currentView === "about"
                                    ? "text-[#00FF41] border-[#00FF41] font-semibold"
                                    : "text-neutral-300 border-transparent hover:border-[#00FF41]/50"
                            }`}
                        >
                            Về chúng tôi
                        </button>
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
                        <button
                            onClick={() => setCurrentView("contact")}
                            className={`transition-colors pb-1 hover:text-[#00FF41] border-b-2 text-[16px] ${
                                currentView === "contact"
                                    ? "text-[#00FF41] border-[#00FF41] font-semibold"
                                    : "text-neutral-300 border-transparent hover:border-[#00FF41]/50"
                            }`}
                        >
                            Liên hệ
                        </button>
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
