import { useNavigate } from "react-router-dom";
import ProductHero from "../components/product/ProductHero";
import ProductCard from "../components/product/ProductCard";
import { LaptopProduct } from "../types";
import { useProductStore, useWishlistStore } from "../stores";
import { productPath, ROUTES } from "../app/routePaths";

// Import Brand Logos
import logoAsus from "../assets/Brand/Logo-ASUS.png";
import logoApple from "../assets/Brand/Logo-Apple.svg";
import logoLenovo from "../assets/Brand/Logo-Lenovo.jpg";
import logoMsi from "../assets/Brand/Logo-MSI.jpg";
import logoDell from "../assets/Brand/Logo-dell.jpg";

const BRAND_LOGOS: Record<string, string> = {
    apple: logoApple,
    asus: logoAsus,
    dell: logoDell,
    lenovo: logoLenovo,
    msi: logoMsi,
};

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1")
    .replace(/\/api\/v1\/?$/, "");

function resolvePublicAssetUrl(path?: string | null): string | null {
    if (!path) return null;
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export interface ProductStoreViewProps {
    filteredProducts?: LaptopProduct[];
    selectedBrand?: string;
    setSelectedBrand?: (brand: string) => void;
    selectedCategory?: string;
    setSelectedCategory?: (category: string) => void;
    priceRange?: number;
    setPriceRange?: (price: number) => void;
    setSearchQuery?: (query: string) => void;
    wishlist?: number[];
    toggleWishlist?: (laptopId: number) => Promise<void>;
    setSelectedProduct: (product: LaptopProduct) => void;
    allProducts?: LaptopProduct[];
    addToCartCustom?: (
        product: LaptopProduct,
        ram: string,
        storage: string,
        colorName: string,
        colorHex: string,
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

    return (
        <main>
            {/* Hero Section */}
            <ProductHero
                onShopNowClick={() => {
                    const el = document.getElementById("catalog-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                }}
                onAiConsultClick={() => showToast("Đang mở tư vấn AI cho siêu phẩm Laptop...")}
            />

            {/* Featured Categories (Danh mục nổi bật) */}
            <section className="py-12 bg-neutral-950/20 border-b border-white/[0.04]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Danh mục nổi bật
                        </h2>
                        <div className="w-12 h-1 bg-[#00FF41] mx-auto mt-3 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* ThinkPad Column */}
                        <div className="bg-neutral-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col items-center">
                            <div className="h-14 flex items-center justify-center bg-white rounded-xl px-6 py-2 mb-6 w-full select-none">
                                <div className="text-2xl font-black text-black tracking-tight flex items-center justify-center font-sans">
                                    <span>Th</span>
                                    <span className="relative inline-block leading-none">
                                        ı
                                        <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#E2231A]"></span>
                                    </span>
                                    <span>nkPad</span>
                                </div>
                            </div>
                            <div className="space-y-4 w-full">
                                <button
                                    onClick={() => {
                                        const lenovoBrand = brands.find((b) => b.name.toLowerCase().includes("lenovo"));
                                        if (lenovoBrand) openBrand(lenovoBrand.id);
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00FF41]/10 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] text-white hover:text-[#00FF41] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">WORKSTATION</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">P - Series</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const lenovoBrand = brands.find((b) => b.name.toLowerCase().includes("lenovo"));
                                        if (lenovoBrand) openBrand(lenovoBrand.id);
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00FF41]/10 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] text-white hover:text-[#00FF41] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">BUSINESS</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">X - Series</span>
                                </button>
                            </div>
                        </div>

                        {/* Dell Column */}
                        <div className="bg-neutral-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col items-center">
                            <div className="h-14 flex items-center justify-center bg-white rounded-xl px-6 py-2 mb-6 w-full select-none">
                                <img src={logoDell} alt="Dell" className="h-8 object-contain" />
                            </div>
                            <div className="space-y-4 w-full">
                                <button
                                    onClick={() => {
                                        const dellBrand = brands.find((b) => b.name.toLowerCase().includes("dell"));
                                        if (dellBrand) openBrand(dellBrand.id);
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00FF41]/10 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] text-white hover:text-[#00FF41] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">WORKSTATION</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">Precision</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const dellBrand = brands.find((b) => b.name.toLowerCase().includes("dell"));
                                        if (dellBrand) openBrand(dellBrand.id);
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00FF41]/10 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] text-white hover:text-[#00FF41] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">GAMING</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">Alienware, G Series</span>
                                </button>
                            </div>
                        </div>

                        {/* HP Column */}
                        <div className="bg-neutral-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col items-center">
                            <div className="h-14 flex items-center justify-center bg-white rounded-xl px-6 py-2 mb-6 w-full select-none">
                                <svg viewBox="0 0 100 100" className="h-8 w-8 object-contain">
                                    <path d="M26.7,0 L20,100 L26.7,100 L33.3,0 Z M46.7,25 L40,100 L46.7,100 L53.3,25 Z M60,0 L53.3,75 L60,75 L66.7,0 Z M80,25 L73.3,75 L80,75 L86.7,25 Z" fill="#000" />
                                </svg>
                            </div>
                            <div className="space-y-4 w-full">
                                <button
                                    onClick={() => {
                                        const hpBrand = brands.find((b) => b.name.toLowerCase().includes("hp"));
                                        if (hpBrand) openBrand(hpBrand.id);
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00FF41]/10 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] text-white hover:text-[#00FF41] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">BUSINESS & GAMING</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">Spectre, Elite, OMEN</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Needs Showcase Section (Lựa chọn nhu cầu) */}
            <section className="py-12 bg-neutral-900/10 border-b border-white/[0.04]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Lựa chọn nhu cầu
                        </h2>
                        <div className="w-12 h-1 bg-[#00FF41] mx-auto mt-3 rounded-full" />
                    </div>

                    <div className="flex items-start justify-start md:justify-center gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => openCategory(category.id)}
                                className="flex flex-col items-center text-center shrink-0 w-28 cursor-pointer group"
                            >
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border border-white/10 flex items-center justify-center p-2 shadow-lg group-hover:shadow-[#00FF41]/20 group-hover:scale-105 group-hover:border-[#00FF41] transition-all duration-300">
                                    <img
                                        src={resolvePublicAssetUrl(category.imageUrl) || "https://placehold.co/160x160/ffffff/111111?text=Laptop"}
                                        alt={category.name}
                                        className="max-h-full max-w-full object-contain filter group-hover:brightness-105 transition-all"
                                    />
                                </div>
                                <span className="text-xs sm:text-[13px] text-neutral-300 font-medium mt-3 leading-snug group-hover:text-[#00FF41] transition-colors max-w-[100px] h-10 flex items-center justify-center">
                                    {category.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Brands Showcase Section */}
            <section className="py-8 bg-black/10 border-b border-white/[0.04]">
                <div className="container mx-auto px-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#00FF41] block mb-5">
                        THƯƠNG HIỆU
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {brands.map((brand) => {
                            const logoUrl = resolvePublicAssetUrl(brand.logoUrl)
                                || BRAND_LOGOS[brand.slug.toLowerCase()];
                            return (
                                <button
                                    key={brand.id}
                                    type="button"
                                    onClick={() => openBrand(brand.id)}
                                    className="flex items-center justify-center bg-white rounded-xl p-4 h-16 sm:h-20 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[#00FF41]/10 hover:scale-[1.03] hover:border-[#00FF41]/30 transition-all duration-300 cursor-pointer"
                                >
                                    {logoUrl ? (
                                        <img
                                            src={logoUrl}
                                            alt={brand.name}
                                            className="max-h-8 sm:max-h-12 max-w-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-sm font-black uppercase tracking-wide text-neutral-900">
                                            {brand.name}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Catalog Section (Brand Product Rows) */}
            <section id="catalog-section" className="py-12 container mx-auto px-6">
                {isLoading ? (
                    <div className="text-center py-20 bg-[#0f1112]/40 rounded-2xl border border-white/[0.06]">
                        <div className="inline-block w-8 h-8 border-2 border-[#00FF41] border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-neutral-400 text-xs font-mono">Đang nạp dữ liệu Laptop từ Backend API...</p>
                    </div>
                ) : productsList.length > 0 ? (
                    <div className="space-y-16">
                        {/* Tất Cả Sản Phẩm Grid */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 gap-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div
                                        className="bg-[#00FF41] text-black font-black px-6 py-2.5 text-xs sm:text-sm tracking-wider uppercase shrink-0 rounded-r-full shadow-lg shadow-[#00FF41]/20"
                                    >
                                        DANH SÁCH LAPTOP MỚI NHẤT ({productsList.length})
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(ROUTES.products)}
                                    className="text-xs sm:text-sm font-bold text-[#00FF41] hover:underline shrink-0 text-right"
                                >
                                    Xem tất cả ({productsList.length}) &rarr;
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
                                            void addToCartCustom?.(p, p.ram || "", p.rom || "", "", "", 1);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Phân nhóm theo thương hiệu nếu có */}
                        {brands.map((brand) => {
                            const brandProducts = productsList.filter(
                                (product) => product.brandId === brand.id
                                    || product.brand.toLowerCase() === brand.name.toLowerCase()
                            );
                            if (brandProducts.length === 0) return null;
                            return (
                                <div key={brand.id} className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 gap-4">
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div
                                                className="bg-[#0a3a60] text-white font-extrabold px-6 py-2.5 text-xs sm:text-sm tracking-wider uppercase shrink-0"
                                                style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
                                            >
                                                LAPTOP {brand.name}
                                            </div>
                                            <span className="text-xs font-bold uppercase text-neutral-400">
                                                {brandProducts.length} sản phẩm
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => openBrand(brand.id)}
                                            className="text-xs sm:text-sm font-bold text-[#00FF41] hover:underline shrink-0 text-right"
                                        >
                                            Xem tất cả &rarr;
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
                                                    void addToCartCustom?.(p, p.ram || "", p.rom || "", "", "", 1);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-[#0f1112]/40 rounded-2xl border border-white/[0.06]">
                        <p className="text-neutral-400 text-sm font-medium">Chưa có sản phẩm nào trong cơ sở dữ liệu.</p>
                    </div>
                )}
            </section>
        </main>
    );
}
