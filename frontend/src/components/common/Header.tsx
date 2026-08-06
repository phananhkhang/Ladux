import React from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Search,
    Heart,
    ShoppingCart,
    Bell,
    Lock,
    User,
    ChevronRight,
    Phone,
    MapPin,
    LogOut,
    Package,
    X,
    Trash2,
} from "lucide-react";
import laduxLogoImg from "../../assets/ladux-logo.png";
import { getAvatarUrl } from "../../types";
import { ROUTES } from "../../app/routePaths";
import { useAuthStore, useNotificationStore, useOrderStore, useProductStore, useWishlistStore } from "../../stores";
import { STOREFRONT_CONTACT } from "../../config/storefront";

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
    const categories = useProductStore((state) => state.categories);

    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
    const fetchUnreadNotifications = useNotificationStore((state) => state.fetchUnreadNotifications);
    const fetchReadNotifications = useNotificationStore((state) => state.fetchReadNotifications);
    const markAsRead = useNotificationStore((state) => state.markAsRead);
    const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
    const deleteNotification = useNotificationStore((state) => state.deleteNotification);
    const deleteAllNotifications = useNotificationStore((state) => state.deleteAllNotifications);

    const [notifTab, setNotifTab] = React.useState<"all" | "unread" | "read">("all");
    const [isCatDropdownOpen, setIsCatDropdownOpen] = React.useState<boolean>(false);
    const catDropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
                setIsCatDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [isScrolled, setIsScrolled] = React.useState<boolean>(false);
    const [isSubHeaderVisible, setIsSubHeaderVisible] = React.useState<boolean>(true);
    const lastScrollY = React.useRef<number>(0);

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 30) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            if (currentScrollY < 30) {
                setIsSubHeaderVisible(true);
            } else if (currentScrollY < lastScrollY.current) {
                // Scrolling UP -> Reveal sub-header!
                setIsSubHeaderVisible(true);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
                // Scrolling DOWN -> Hide sub-header!
                setIsSubHeaderVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isLoggedIn = authIsLoggedIn || propsIsLoggedIn;
    const displayName = user?.fullName || user?.username || propsUserName || "Thành viên LADUX";
    const userPhone = user?.phone || user?.email || "";
    const userAvatar = getAvatarUrl(user?.avatar || propsUserAvatar);

    const displayWishlistCount = wishlistProductIds.length > 0 ? wishlistProductIds.length : wishlistCount;
    const displayOrderCount = totalOrderElements || orders.length;

    React.useEffect(() => {
        if (isLoggedIn) {
            if (notifTab === "unread") {
                fetchUnreadNotifications(0, 10);
            } else if (notifTab === "read") {
                fetchReadNotifications(0, 10);
            } else {
                fetchNotifications(0, 10);
            }
        }
    }, [isLoggedIn, notifTab, fetchNotifications, fetchUnreadNotifications, fetchReadNotifications]);

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
        <header
            className={`fixed top-0 left-0 right-0 z-50 border-b text-white transition-all duration-500 ${
                isScrolled
                    ? "border-white/15 bg-[#080a0b]/95 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.95)]"
                    : "border-white/10 bg-[#080a0b]/80 backdrop-blur-xl"
            }`}
        >
            <div className="container mx-auto px-6 sm:px-10 lg:px-16 h-[72px] flex items-center justify-between gap-3 md:gap-6">
                {/* ── Logo ── */}
                <div className="z-10 flex items-center shrink-0">
                    <Link
                        to={ROUTES.home}
                        className="flex items-center gap-2.5 group shrink-0 cursor-pointer"
                    >
                        <img
                            src={laduxLogoImg}
                            alt="LADUX Logo"
                            className="h-9 sm:h-10 w-9 sm:w-10 object-cover rounded-full border border-white/10"
                        />
                        <span className="hidden sm:block text-xl sm:text-2xl font-black font-logo tracking-[0.2em] text-[#00FF41] drop-shadow-[0_0_12px_rgba(0,255,65,0.4)]">LADUX</span>
                    </Link>
                </div>

                {/* ── Dynamic Flex Search Bar (max-w-[850px] centered) ── */}
                <div className="flex-1 max-w-[850px] hidden sm:flex items-stretch h-11 relative rounded-none border border-white/[0.12] bg-white/[0.04] focus-within:border-[#00FF41]/60 focus-within:ring-1 focus-within:ring-[#00FF41]/20 transition-all z-20 mx-4 md:mx-8 lg:mx-12">
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
                        className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none min-w-0 rounded-none"
                    />

                    {/* Divider */}
                    <div className="w-px bg-white/[0.1] self-stretch" />

                    {/* Custom Category Dropdown */}
                    <div className="relative flex items-center shrink-0 h-full" ref={catDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                            className="flex items-center gap-2 px-3 sm:px-4 h-full text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-[#00FF41] transition-colors cursor-pointer"
                        >
                            <span className="truncate max-w-[130px]">
                                {selectedCategory && selectedCategory !== "All" ? selectedCategory : "CHỌN DANH MỤC"}
                            </span>
                            <ChevronRight
                                className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${
                                    isCatDropdownOpen ? "-rotate-90 text-[#00FF41]" : "rotate-90"
                                }`}
                            />
                        </button>

                        {/* Custom Dropdown Popover */}
                        {isCatDropdownOpen && (
                            <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl border border-white/20 bg-neutral-950/98 backdrop-blur-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_20px_rgba(0,255,65,0.15)] z-50 animate-in fade-in zoom-in-95 duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory("All");
                                        setIsCatDropdownOpen(false);
                                        if (location.pathname !== ROUTES.products) {
                                            handleNavigate(ROUTES.products);
                                        }
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between cursor-pointer ${
                                        !selectedCategory || selectedCategory === "All"
                                            ? "bg-[#00FF41] text-black shadow-md shadow-[#00FF41]/20"
                                            : "text-neutral-300 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    <span>TẤT CẢ DANH MỤC</span>
                                    {(!selectedCategory || selectedCategory === "All") && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-black" />
                                    )}
                                </button>
                                <div className="h-px bg-white/10 my-1" />
                                <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
                                    {categories.map((category) => {
                                        const isSelected = selectedCategory === category.name;
                                        return (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCategory(category.name);
                                                    setIsCatDropdownOpen(false);
                                                    if (location.pathname !== ROUTES.products) {
                                                        handleNavigate(ROUTES.products);
                                                    }
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between cursor-pointer ${
                                                    isSelected
                                                        ? "bg-[#00FF41] text-black shadow-md shadow-[#00FF41]/20"
                                                        : "text-neutral-300 hover:bg-[#00FF41]/10 hover:text-[#00FF41]"
                                                }`}
                                            >
                                                <span>{category.name.toUpperCase()}</span>
                                                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={() => handleNavigate(ROUTES.products)}
                        className="flex items-center justify-center w-11 sm:w-12 bg-[#00FF41] hover:bg-[#00cc34] active:bg-[#00b32d] transition-colors shrink-0 rounded-none cursor-pointer"
                        aria-label="Tìm kiếm"
                    >
                        <Search className="w-5 h-5 text-black stroke-[2.5]" />
                    </button>
                </div>

                {/* ── Right Actions ── */}
                <div className="z-10 flex items-center gap-2 shrink-0 mr-2 sm:mr-4 lg:mr-10">
                    {/* Cart Badge */}
                    <Link
                        to={ROUTES.cart}
                        className="relative p-2.5 text-neutral-300 hover:text-[#00FF41] transition-all duration-200 rounded-xl hover:bg-white/[0.08] flex items-center justify-center group cursor-pointer"
                        aria-label="Giỏ hàng"
                    >
                        <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#00FF41] text-black font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-[0_0_10px_#00FF41] animate-pulse">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Notification Badge & Popover */}
                    <div className="relative group/notif">
                        <button
                            onClick={() => {
                                if (!isLoggedIn) {
                                    navigate(ROUTES.login);
                                }
                            }}
                            className="relative p-2 text-neutral-400 hover:text-white transition rounded-xl hover:bg-white/[0.06] flex items-center justify-center cursor-pointer"
                            aria-label="Thông báo"
                        >
                            <Bell className="w-4.5 h-4.5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-amber-400 text-black font-bold text-[8px] rounded-full flex items-center justify-center animate-pulse">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown Menu */}
                        {isLoggedIn && (
                            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover/notif:opacity-100 group-hover/notif:visible transition-all duration-200 z-50 pointer-events-none group-hover/notif:pointer-events-auto">
                                <div className="w-80 sm:w-96 rounded-2xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-xl p-4 shadow-2xl">
                                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-[#00FF41]" />
                                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">Thông báo</span>
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => markAllAsRead()}
                                            className="text-[10px] font-mono text-[#00FF41] hover:underline"
                                        >
                                            Đánh dấu đã đọc
                                        </button>
                                    )}
                                </div>

                                {/* ── Tabs: Tất cả | Chưa đọc | Đã đọc ── */}
                                <div className="grid grid-cols-3 gap-1 bg-neutral-900/90 p-1 rounded-xl mb-3 text-[10px] font-mono font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setNotifTab("all")}
                                        className={`py-1 rounded-lg transition ${
                                            notifTab === "all" ? "bg-[#00FF41] text-black shadow" : "text-neutral-400 hover:text-white"
                                        }`}
                                    >
                                        Tất cả
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNotifTab("unread")}
                                        className={`py-1 rounded-lg transition ${
                                            notifTab === "unread" ? "bg-[#00FF41] text-black shadow" : "text-neutral-400 hover:text-white"
                                        }`}
                                    >
                                        Chưa đọc
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNotifTab("read")}
                                        className={`py-1 rounded-lg transition ${
                                            notifTab === "read" ? "bg-[#00FF41] text-black shadow" : "text-neutral-400 hover:text-white"
                                        }`}
                                    >
                                        Đã đọc
                                    </button>
                                </div>

                                {/* ── Notification Items List ── */}
                                {notifications.length === 0 ? (
                                    <div className="py-8 text-center text-xs font-mono text-neutral-500">
                                        Không có thông báo nào ({notifTab === "all" ? "Tất cả" : notifTab === "unread" ? "Chưa đọc" : "Đã đọc"})
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                onClick={() => !n.isRead && markAsRead(n.id)}
                                                className={`group/item relative p-3 rounded-xl border text-xs transition cursor-pointer flex items-start justify-between gap-3 ${
                                                    n.isRead
                                                        ? "bg-neutral-900/40 border-neutral-800/60 text-neutral-400"
                                                        : "bg-neutral-900 border-emerald-500/30 text-white font-medium"
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#00FF41] shrink-0" />}
                                                        <span className="font-bold text-white truncate">{n.title}</span>
                                                    </div>
                                                    <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">{n.message}</p>
                                                </div>

                                                {/* Dấu X ở bên phải để xóa thông báo cụ thể */}
                                                <button
                                                    type="button"
                                                    title="Xóa thông báo"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(n.id);
                                                    }}
                                                    className="p-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Bottom Section: Label xóa tất cả ── */}
                                {notifications.length > 0 && (
                                    <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono">
                                        <span className="text-neutral-500">Tổng: {notifications.length}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (window.confirm("Bạn có chắc muốn xóa tất cả thông báo không?")) {
                                                    deleteAllNotifications();
                                                }
                                            }}
                                            className="text-red-400 hover:text-red-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Xóa tất cả thông báo
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

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

                    {/* ── User Account CTA & Popover Dropdown ── */}
                    <div className="relative group/user">
                        {isLoggedIn ? (
                            /* Logged in CTA Button */
                            <button
                                onClick={() => navigate(ROUTES.account)}
                                className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-white/[0.04] py-1 pl-1 pr-3 text-neutral-100 transition hover:border-[#00FF41] hover:bg-white/[0.08]"
                            >
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt="Avatar"
                                        className="h-7 w-7 rounded-full object-cover border-2 border-[#00FF41]"
                                    />
                                ) : (
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#00FF41] bg-neutral-900">
                                        <User className="h-3.5 w-3.5 text-[#00FF41]" />
                                    </span>
                                )}
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
                                                 <span>{user?.level || "BROWSER"} MEMBER</span>
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
            <div
                className={`border-t border-white/[0.06] bg-black/40 backdrop-blur-md overflow-hidden transition-all duration-500 ease-in-out ${
                    !isSubHeaderVisible
                        ? "max-h-0 opacity-0 -translate-y-4 pointer-events-none py-0 border-t-0"
                        : "max-h-24 opacity-100 translate-y-0 py-3"
                }`}
            >
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
                        {STOREFRONT_CONTACT.phone && <div className="flex items-center gap-2.5 group cursor-pointer">
                            <Phone className="w-[18px] h-[18px] text-[#00FF41] group-hover:scale-110 transition-transform" />
                            <span className="text-neutral-400 group-hover:text-white transition-colors">
                                Hotline: <strong className="text-white font-medium">{STOREFRONT_CONTACT.phone}</strong>
                            </span>
                        </div>}
                        {STOREFRONT_CONTACT.phone && <span className="text-white/10 hidden sm:inline">|</span>}
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
