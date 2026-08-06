import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Flame,
    Layers,
    Sparkles,
    Gamepad2,
    Briefcase,
    Feather,
    Palette,
    UserCheck,
    GraduationCap,
} from "lucide-react";
import ProductHero from "../components/product/ProductHero";
import ProductCard from "../components/product/ProductCard";
import { LaptopProduct } from "../types";
import { useProductStore, useWishlistStore } from "../stores";
import { productPath, ROUTES } from "../app/routePaths";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1")
    .replace(/\/api\/v1\/?$/, "");

function resolvePublicAssetUrl(path?: string | null): string | null {
    if (!path) return null;
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export interface ProductStoreViewProps {
    filteredProducts?: LaptopProduct[];
    toggleWishlist?: (laptopId: number) => Promise<void>;
    setSelectedProduct: (product: LaptopProduct) => void;
    addToCartCustom?: (
        product: LaptopProduct,
        variantId: number,
        quantity: number
    ) => Promise<boolean>;
    showToast: (msg: string) => void;
}

export default function ProductStoreView({
    filteredProducts,
    toggleWishlist,
    setSelectedProduct,
    addToCartCustom,
    showToast,
}: ProductStoreViewProps) {
    const navigate = useNavigate();
    const { brands, categories, setBrandFilter, setCategoryFilter, isLoading } = useProductStore();
    const { wishlistProductIds } = useWishlistStore();

    const productsList = filteredProducts || [];

    const openBrand = (brandId: number) => {
        setBrandFilter(brandId);
        navigate(ROUTES.products);
    };

    const openCategory = (categoryId: number) => {
        setCategoryFilter(categoryId);
        navigate(ROUTES.products);
    };

    const categoryCardConfigs = [
        {
            key: "gaming",
            title: "Laptop Gaming",
            icon: Gamepad2,
            desc: "Hiệu năng đỉnh cao cho trải nghiệm chơi game mượt mà.",
            keyword: "gaming",
            glowColor: "bg-red-500/20",
            defaultImg: `${API_ORIGIN}/uploads/categories/categories_laptop_gaming.webp`,
        },
        {
            key: "van-phong",
            title: "Laptop Văn Phòng",
            icon: Briefcase,
            desc: "Ổn định, bền bỉ cho công việc hàng ngày hiệu quả.",
            keyword: "văn phòng",
            glowColor: "bg-cyan-500/20",
            defaultImg: `${API_ORIGIN}/uploads/categories/categories_laptop_van_phong.webp`,
        },
        {
            key: "ultrabook",
            title: "Ultrabook Mỏng Nhẹ",
            icon: Feather,
            desc: "Mỏng nhẹ, thời trang, đồng hành cùng bạn mọi lúc mọi nơi.",
            keyword: "ultrabook",
            glowColor: "bg-purple-500/20",
            defaultImg: `${API_ORIGIN}/uploads/categories/categories_ultrabook_mong_nhe.jpg`,
        },
        {
            key: "do-hoa",
            title: "Laptop Đồ Họa",
            icon: Palette,
            desc: "Mạnh mẽ cho thiết kế, dựng phim và sáng tạo chuyên nghiệp.",
            keyword: "đồ họa",
            glowColor: "bg-emerald-500/20",
            defaultImg: `${API_ORIGIN}/uploads/categories/categories_laptop_do_hoa.png`,
        },
        {
            key: "doanh-nhan",
            title: "Laptop Doanh Nhân",
            icon: UserCheck,
            desc: "Sang trọng, bảo mật, nâng tầm đẳng cấp doanh nhân.",
            keyword: "doanh nhân",
            glowColor: "bg-amber-500/20",
            defaultImg: `${API_ORIGIN}/uploads/categories/categories_laptop_doanh_nhan.webp`,
        },
        {
            key: "sinh-vien",
            title: "Laptop Sinh Viên",
            icon: GraduationCap,
            desc: "Hiệu năng tốt, giá hợp lý cho học tập và giải trí.",
            keyword: "sinh viên",
            glowColor: "bg-blue-500/20",
            defaultImg: `${API_ORIGIN}/uploads/categories/categories_laptop_sinh_vien.jpg`,
        },
    ];

    return (
        <main className="min-h-screen bg-black text-white select-none">
            {/* ── AAA Hero Section ── */}
            <ProductHero
                onShopNowClick={() => {
                    const el = document.getElementById("catalog-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                }}
                onAiConsultClick={() => showToast("Đang mở tư vấn AI cho siêu phẩm Laptop...")}
            />

            {/* ── Needs Showcase Section (Chọn Laptop Đúng Nhu Cầu - 6 Cards UI) ── */}
            <section className="py-14 border-b border-white/[0.08] bg-neutral-950/60 backdrop-blur-xl relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[60rem] rounded-full bg-[#00FF55]/[0.03] blur-3xl" />

                <div className="container mx-auto px-6 sm:px-10 lg:px-16">
                    {/* Header */}
                    <div className="text-center mb-10 space-y-3 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00FF55]/40 bg-[#00FF55]/10 text-xs font-mono font-bold uppercase tracking-wider text-[#00FF55] shadow-[0_0_15px_rgba(0,255,85,0.15)]">
                            <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>PHÂN LOẠI THEO NHU CẦU</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 max-w-3xl mx-auto">
                            <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-transparent via-[#00FF55]/60 to-transparent" />
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white shrink-0">
                                Chọn Laptop Đúng Nhu Cầu
                            </h2>
                            <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-transparent via-[#00FF55]/60 to-transparent" />
                        </div>
                        <p className="text-neutral-400 text-xs sm:text-sm font-medium max-w-lg mx-auto">
                            Tìm chiếc laptop hoàn hảo phù hợp với nhu cầu và phong cách của bạn.
                        </p>
                    </div>

                    {/* 6 Category Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
                        {categoryCardConfigs.map((cfg) => {
                            const matchedCat =
                                categories.find(
                                    (c) =>
                                        c.name.toLowerCase().includes(cfg.keyword) ||
                                        (c.slug && c.slug.toLowerCase().includes(cfg.key))
                                ) || categories[0];

                            const categoryId = matchedCat?.id;
                            const imgUrl = matchedCat?.imageUrl
                                ? resolvePublicAssetUrl(matchedCat.imageUrl)
                                : cfg.defaultImg;
                            const Icon = cfg.icon;

                            return (
                                <div
                                    key={cfg.key}
                                    onClick={() => categoryId && openCategory(categoryId)}
                                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/90 p-6 flex flex-col justify-between h-[210px] sm:h-[225px] shadow-2xl transition-all duration-300 hover:border-[#00FF55]/50 hover:shadow-[0_12px_40px_rgba(0,255,85,0.15)] cursor-pointer select-none"
                                >
                                    {/* Background Glow Aura */}
                                    <div
                                        className={`pointer-events-none absolute right-0 bottom-0 w-48 h-48 rounded-full ${cfg.glowColor} blur-3xl opacity-30 group-hover:opacity-60 transition-opacity`}
                                    />

                                    {/* Left Content Side */}
                                    <div className="relative z-10 max-w-[56%] flex flex-col justify-between h-full">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#00FF55]/40 bg-[#00FF55]/10 text-[#00FF55] group-hover:bg-[#00FF55] group-hover:text-black transition-colors">
                                                    <Icon className="h-4.5 w-4.5 stroke-[2.2]" />
                                                </div>
                                                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#00FF55] transition-colors leading-tight">
                                                    {cfg.title}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                                                {cfg.desc}
                                            </p>
                                        </div>

                                        <div className="pt-2">
                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#00FF55]/40 bg-[#00FF55]/10 text-[#00FF55] text-xs font-bold group-hover:bg-[#00FF55] group-hover:text-black transition-all">
                                                <span>Khám phá</span>
                                                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Laptop Image Container with Left Edge Fade Mask */}
                                    <div className="absolute right-0 top-0 bottom-0 w-[60%] flex items-center justify-end pointer-events-none overflow-hidden rounded-r-2xl [mask-image:linear-gradient(to_right,transparent_0%,black_35%)] z-1">
                                        <img
                                            src={imgUrl || cfg.defaultImg}
                                            alt={cfg.title}
                                            className="w-full h-full object-cover object-right filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] group-hover:scale-108 transition-transform duration-500 ease-out"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = cfg.defaultImg;
                                            }}
                                        />
                                        <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Brands Showcase Section ── */}
            {brands.length > 0 && (
                <section className="py-12 border-b border-white/[0.08] bg-black">
                    <div className="container mx-auto px-6 sm:px-10 lg:px-16">
                        {/* Title & Subtitle Centered */}
                        <div className="text-center mb-8 space-y-2">
                            <div className="inline-flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#00FF55] animate-pulse" />
                                <h2 className="text-sm sm:text-base font-mono font-bold uppercase tracking-widest text-[#00FF55]">
                                    THƯƠNG HIỆU ĐỐI TÁC HÀNG ĐẦU
                                </h2>
                            </div>
                            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#00FF55] to-transparent mx-auto rounded-full shadow-[0_0_8px_#00FF55]" />
                            <p className="text-xs text-neutral-400 font-medium">
                                Hợp tác cùng những thương hiệu công nghệ hàng đầu thế giới, mang đến trải nghiệm vượt trội cho bạn.
                            </p>
                        </div>

                        {/* Outer Border Box Container Wrapping 12 Brand Cards */}
                        <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0d0e10]/90 backdrop-blur-xl p-4 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden">
                            {/* Subtle Top Border Glow Line */}
                            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#00FF55]/60 to-transparent" />
                            <div className="absolute top-0 left-10 w-24 h-[1px] bg-[#00FF55]/30 blur-[1px]" />
                            <div className="absolute top-0 right-10 w-24 h-[1px] bg-[#00FF55]/30 blur-[1px]" />

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
                                {brands.map((brand) => {
                                    const logoUrl = resolvePublicAssetUrl(brand.logoUrl);
                                    return (
                                        <button
                                            key={brand.id}
                                            type="button"
                                            onClick={() => openBrand(brand.id)}
                                            className="flex items-center justify-center bg-[#131518] hover:bg-[#1a1d21] rounded-xl sm:rounded-2xl p-4 h-20 sm:h-24 border border-white/[0.08] hover:border-[#00FF55]/60 shadow-lg hover:shadow-[0_0_20px_rgba(0,255,85,0.2)] hover:scale-[1.03] transition-all duration-300 cursor-pointer group relative overflow-hidden"
                                        >
                                            {/* Inner Top Edge Glow on Hover */}
                                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00FF55]/0 group-hover:via-[#00FF55]/80 to-transparent transition-all duration-300" />
                                            {logoUrl ? (
                                                <img
                                                    src={logoUrl}
                                                    alt={brand.name}
                                                    className="max-h-8 sm:max-h-12 max-w-full object-contain filter group-hover:contrast-125 transition-all duration-300"
                                                />
                                            ) : (
                                                <span className="text-sm font-black uppercase tracking-wide text-white group-hover:text-[#00FF55] transition-colors">
                                                    {brand.name}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Main Catalog Showcase Section ── */}
            <section id="catalog-section" className="py-14 container mx-auto px-6 sm:px-10 lg:px-16">
                {isLoading ? (
                    <div className="text-center py-20 bg-neutral-950/60 rounded-3xl border border-white/[0.08] backdrop-blur-xl">
                        <div className="inline-block w-8 h-8 border-2 border-[#00FF55] border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-neutral-400 text-xs font-mono">Đang tải danh sách Laptop cao cấp...</p>
                    </div>
                ) : productsList.length > 0 ? (
                    <div className="space-y-16">
                        {/* ── ALL PRODUCTS GRID ── */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.1] pb-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00FF55]/40 bg-[#00FF55]/10 text-[#00FF55]">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                                        DANH SÁCH LAPTOP MỚI NHẤT ({productsList.length})
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.products)}
                                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#00FF55] hover:underline cursor-pointer"
                                >
                                    <span>Xem tất cả ({productsList.length})</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {productsList.map((laptop) => (
                                    <ProductCard
                                        key={laptop.id}
                                        laptop={laptop}
                                        isWishlisted={wishlistProductIds.includes(laptop.id)}
                                        onToggleWishlist={(id) => {
                                            void toggleWishlist?.(id);
                                        }}
                                        onSelectProduct={(p) => {
                                            setSelectedProduct(p);
                                            navigate(productPath(p.id));
                                        }}
                                        onAddToCart={(p) => {
                                            const variant =
                                                p.variants.find(
                                                    (item) => item.id === p.defaultVariantId && item.stockQuantity > 0
                                                ) ?? p.variants.find((item) => item.stockQuantity > 0);
                                            if (variant) void addToCartCustom?.(p, variant.id, 1);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* ── BRAND SPECIFIC PRODUCT ROWS ── */}
                        {brands.map((brand) => {
                            const brandProducts = productsList.filter(
                                (product) =>
                                    product.brandId === brand.id ||
                                    product.brand.toLowerCase() === brand.name.toLowerCase()
                            );
                            if (brandProducts.length === 0) return null;
                            return (
                                <div key={brand.id} className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.1] pb-4 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-mono font-bold text-xs">
                                                {brand.name.substring(0, 1)}
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                                                LAPTOP {brand.name} ({brandProducts.length})
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openBrand(brand.id)}
                                            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#00FF55] hover:underline cursor-pointer"
                                        >
                                            <span>Xem tất cả</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {brandProducts.slice(0, 4).map((laptop) => (
                                            <ProductCard
                                                key={laptop.id}
                                                laptop={laptop}
                                                isWishlisted={wishlistProductIds.includes(laptop.id)}
                                                onToggleWishlist={(id) => {
                                                    void toggleWishlist?.(id);
                                                }}
                                                onSelectProduct={(p) => {
                                                    setSelectedProduct(p);
                                                    navigate(productPath(p.id));
                                                }}
                                                onAddToCart={(p) => {
                                                    const variant =
                                                        p.variants.find(
                                                            (item) => item.id === p.defaultVariantId && item.stockQuantity > 0
                                                        ) ?? p.variants.find((item) => item.stockQuantity > 0);
                                                    if (variant) void addToCartCustom?.(p, variant.id, 1);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-neutral-950/60 rounded-3xl border border-white/[0.08] backdrop-blur-xl">
                        <p className="text-neutral-400 text-sm font-mono">Chưa có sản phẩm nào trong cơ sở dữ liệu.</p>
                    </div>
                )}
            </section>
        </main>
    );
}
