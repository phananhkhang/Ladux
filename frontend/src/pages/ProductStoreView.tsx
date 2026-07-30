import React from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import ProductHero from "../components/product/ProductHero";
import ProductCard from "../components/product/ProductCard";
import { LaptopProduct, formatVND, ViewType } from "../types";
import { MOCK_PRODUCTS } from "../data/mockProducts";

const BRAND_SECTIONS = [
    {
        brandId: "MSI",
        title: "LAPTOP MSI",
        tabs: [
            { label: "MSI PRESTIGE", query: "Prestige" },
            { label: "MSI MODERN", query: "Modern" },
            { label: "MSI CYBORG", query: "Cyborg" },
            { label: "MSI KATANA", query: "Katana" }
        ]
    },
    {
        brandId: "Dell",
        title: "LAPTOP DELL",
        tabs: [
            { label: "DELL XPS", query: "XPS" },
            { label: "DELL PRECISION", query: "Precision" },
            { label: "DELL LATITUDE", query: "Latitude" },
            { label: "DELL ALIENWARE", query: "Alienware" }
        ]
    },
    {
        brandId: "Apple",
        title: "LAPTOP APPLE",
        tabs: [
            { label: "MACBOOK PRO", query: "Pro" },
            { label: "MACBOOK AIR", query: "Air" }
        ]
    },
    {
        brandId: "Lenovo",
        title: "LAPTOP LENOVO",
        tabs: [
            { label: "THINKPAD X1", query: "X1" },
            { label: "THINKPAD T", query: "T" }
        ]
    },
    {
        brandId: "ASUS ROG",
        title: "LAPTOP ASUS",
        tabs: [
            { label: "ROG DUO", query: "Duo" }
        ]
    }
];

// Import Brand Logos
import logoAsus from "../assets/Brand/Logo-ASUS.png";
import logoApple from "../assets/Brand/Logo-Apple.svg";
import logoLenovo from "../assets/Brand/Logo-Lenovo.jpg";
import logoMsi from "../assets/Brand/Logo-MSI.jpg";
import logoDell from "../assets/Brand/Logo-dell.jpg";

const BRANDS = [
    { id: "dell", logo: logoDell, alt: "Dell" },
    { id: "apple", logo: logoApple, alt: "Apple" },
    { id: "asus", logo: logoAsus, alt: "ASUS" },
    { id: "lenovo", logo: logoLenovo, alt: "Lenovo" },
    { id: "msi", logo: logoMsi, alt: "MSI" },
];

const NEEDS = [
    {
        id: "doanh-nhan",
        label: "Laptop Doanh nhân",
        category: "Doanh Nhân",
        image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&fit=crop&auto=format"
    },
    {
        id: "gaming",
        label: "Laptop Gaming",
        category: "Gaming",
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&fit=crop&auto=format"
    },
    {
        id: "van-phong",
        label: "Laptop văn phòng mới",
        category: "Doanh Nhân",
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&fit=crop&auto=format"
    },
    {
        id: "sinh-vien",
        label: "Laptop sinh viên",
        category: "Ultrabook",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&fit=crop&auto=format"
    },
    {
        id: "mong-nhe",
        label: "Laptop mỏng nhẹ",
        category: "Ultrabook",
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&fit=crop&auto=format"
    },
    {
        id: "workstation",
        label: "Laptop Workstation",
        category: "Workstation",
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&fit=crop&auto=format"
    },
    {
        id: "do-hoa",
        label: "Laptop đồ họa",
        category: "Workstation",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&fit=crop&auto=format"
    }
];

export interface ProductStoreViewProps {
    filteredProducts: LaptopProduct[];
    selectedBrand: string;
    setSelectedBrand: (brand: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    priceRange: number;
    setPriceRange: (price: number) => void;
    setSearchQuery: (query: string) => void;
    wishlist: number[];
    toggleWishlist: (laptopId: number) => void;
    setSelectedProduct: (product: LaptopProduct) => void;
    setCurrentView: (view: ViewType) => void;
    addToCartCustom: (
        product: LaptopProduct,
        ram: string,
        storage: string,
        colorName: string,
        colorHex: string,
        quantity: number
    ) => void;
    showToast: (msg: string) => void;
}

export default function ProductStoreView({
    filteredProducts,
    selectedBrand,
    setSelectedBrand,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    setSearchQuery,
    wishlist,
    toggleWishlist,
    setSelectedProduct,
    setCurrentView,
    addToCartCustom,
    showToast,
}: ProductStoreViewProps) {
    const isFilteringActive =
        selectedBrand !== "All" ||
        selectedCategory !== "All" ||
        priceRange < 150000000 ||
        filteredProducts.length < MOCK_PRODUCTS.length;

    return (
        <main>
            {/* Hero Section */}
            <ProductHero
                onShopNowClick={() => {
                    const el = document.getElementById("catalog-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                }}
                onAiConsultClick={() => showToast("Đang mở video giới thiệu Laptop...")}
            />

            {/* Featured Categories (Danh mục nổi bật) */}
            <section className="py-12 bg-neutral-950/20 border-b border-white/[0.04]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Danh mục nổi bật
                        </h2>
                        <div className="w-12 h-1 bg-[#00D492] mx-auto mt-3 rounded-full" />
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
                                        setSelectedBrand("Lenovo");
                                        setSelectedCategory("Workstation");
                                        setSearchQuery("");
                                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00D492]/10 hover:border-[#00D492] hover:shadow-[0_0_15px_rgba(0,212,146,0.15)] text-white hover:text-[#00D492] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">WORKSTATION</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">P - Series</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedBrand("Lenovo");
                                        setSelectedCategory("Doanh Nhân");
                                        setSearchQuery("");
                                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00D492]/10 hover:border-[#00D492] hover:shadow-[0_0_15px_rgba(0,212,146,0.15)] text-white hover:text-[#00D492] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">BUSINESS</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">X - Series</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedBrand("Lenovo");
                                        setSelectedCategory("Doanh Nhân");
                                        setSearchQuery("");
                                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00D492]/10 hover:border-[#00D492] hover:shadow-[0_0_15px_rgba(0,212,146,0.15)] text-white hover:text-[#00D492] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">BUSINESS</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">T - Series</span>
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
                                        setSelectedBrand("Dell");
                                        setSelectedCategory("Workstation");
                                        setSearchQuery("");
                                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00D492]/10 hover:border-[#00D492] hover:shadow-[0_0_15px_rgba(0,212,146,0.15)] text-white hover:text-[#00D492] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">WORKSTATION</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">Precision</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedBrand("Dell");
                                        setSelectedCategory("Doanh Nhân");
                                        setSearchQuery("");
                                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00D492]/10 hover:border-[#00D492] hover:shadow-[0_0_15px_rgba(0,212,146,0.15)] text-white hover:text-[#00D492] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">BUSINESS</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">XPS, Latitude</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedBrand("Dell");
                                        setSelectedCategory("Gaming");
                                        setSearchQuery("");
                                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00D492]/10 hover:border-[#00D492] hover:shadow-[0_0_15px_rgba(0,212,146,0.15)] text-white hover:text-[#00D492] transition-all duration-300 group"
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
                                        setSelectedBrand("HP");
                                        setSelectedCategory("Workstation");
                                        setSearchQuery("");
                                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00D492]/10 hover:border-[#00D492] hover:shadow-[0_0_15px_rgba(0,212,146,0.15)] text-white hover:text-[#00D492] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">WORKSTATION</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">(ZBook)</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedBrand("HP");
                                        setSelectedCategory("Doanh Nhân");
                                        setSearchQuery("");
                                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00D492]/10 hover:border-[#00D492] hover:shadow-[0_0_15px_rgba(0,212,146,0.15)] text-white hover:text-[#00D492] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">BUSINESS</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">Spectre, Elite, ENVY</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedBrand("HP");
                                        setSelectedCategory("Gaming");
                                        setSearchQuery("");
                                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00D492]/10 hover:border-[#00D492] hover:shadow-[0_0_15px_rgba(0,212,146,0.15)] text-white hover:text-[#00D492] transition-all duration-300 group"
                                >
                                    <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase">GAMING</span>
                                    <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-300 font-medium mt-0.5">OMEN</span>
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
                        <div className="w-12 h-1 bg-[#00D492] mx-auto mt-3 rounded-full" />
                    </div>

                    <div className="flex items-start justify-start md:justify-center gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {NEEDS.map((need) => (
                            <div
                                key={need.id}
                                onClick={() => {
                                    setSelectedCategory(need.category);
                                    setSelectedBrand("All");
                                    setSearchQuery("");
                                    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="flex flex-col items-center text-center shrink-0 w-28 cursor-pointer group"
                            >
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border border-white/10 flex items-center justify-center p-2 shadow-lg group-hover:shadow-[#00D492]/20 group-hover:scale-105 group-hover:border-[#00D492] transition-all duration-300">
                                    <img
                                        src={need.image}
                                        alt={need.label}
                                        className="max-h-full max-w-full object-contain filter group-hover:brightness-105 transition-all"
                                    />
                                </div>
                                <span className="text-xs sm:text-[13px] text-neutral-300 font-medium mt-3 leading-snug group-hover:text-[#00D492] transition-colors max-w-[100px] h-10 flex items-center justify-center">
                                    {need.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Brands Showcase Section */}
            <section className="py-8 bg-black/10 border-b border-white/[0.04]">
                <div className="container mx-auto px-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#00D492] block mb-5">
                        THƯƠNG HIỆU
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {BRANDS.map((brand) => {
                            const filterMap: Record<string, string> = {
                                dell: "Dell",
                                apple: "Apple",
                                asus: "ASUS ROG",
                                lenovo: "Lenovo",
                                msi: "MSI",
                            };
                            const isSelected = selectedBrand === filterMap[brand.id];
                            return (
                                <div
                                    key={brand.id}
                                    onClick={() => {
                                        setSelectedBrand(isSelected ? "All" : filterMap[brand.id]);
                                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className={`flex items-center justify-center bg-white rounded-xl p-4 h-16 sm:h-20 border transition-all duration-300 cursor-pointer ${
                                        isSelected
                                            ? "border-[#00D492] shadow-[0_0_15px_rgba(0,212,146,0.3)] scale-[1.03]"
                                            : "border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[#00D492]/10 hover:scale-[1.03] hover:border-[#00D492]/30"
                                    }`}
                                >
                                    <img
                                        src={brand.logo}
                                        alt={brand.alt}
                                        className="max-h-8 sm:max-h-12 max-w-full object-contain"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Catalog Section (Brand Product Rows) */}
            <section id="catalog-section" className="py-12 container mx-auto px-6">

                {isFilteringActive ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((laptop) => (
                            <ProductCard
                                key={laptop.id}
                                laptop={laptop}
                                isWishlisted={wishlist.includes(laptop.id)}
                                onToggleWishlist={toggleWishlist}
                                onSelectProduct={(p) => {
                                    setSelectedProduct(p);
                                    setCurrentView("product-detail");
                                }}
                                onAddToCart={(p) => {
                                    addToCartCustom(p, "32GB", "1TB SSD", "Space Black", "#1D1D1F", 1);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-16">
                        {BRAND_SECTIONS.map((section) => {
                            const brandProducts = MOCK_PRODUCTS.filter(
                                (p) => p.brand.toLowerCase() === section.brandId.toLowerCase()
                            );
                            if (brandProducts.length === 0) return null;
                            return (
                                <div key={section.brandId} className="space-y-6">
                                    {/* Section Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 gap-4">
                                        <div className="flex items-center gap-4 flex-wrap">
                                            {/* Trapezoid title badge */}
                                            <div
                                                className="bg-[#0a3a60] text-white font-extrabold px-6 py-2.5 text-xs sm:text-sm tracking-wider uppercase shrink-0"
                                                style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
                                            >
                                                {section.title}
                                            </div>
                                            {/* Sub tabs */}
                                            <div className="flex items-center gap-4 text-xs font-bold text-neutral-400 overflow-x-auto py-1">
                                                {section.tabs.map((tab) => (
                                                    <button
                                                        key={tab.label}
                                                        onClick={() => {
                                                            setSelectedBrand(section.brandId);
                                                            setSearchQuery(tab.query);
                                                            document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                                        }}
                                                        className="hover:text-[#00D492] transition-colors shrink-0 uppercase whitespace-nowrap"
                                                    >
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedBrand(section.brandId);
                                                setSelectedCategory("All");
                                                setSearchQuery("");
                                                setCurrentView("all-products");
                                            }}
                                            className="text-xs sm:text-sm font-bold text-[#00D492] hover:underline shrink-0 text-right"
                                        >
                                            Xem tất cả &rarr;
                                        </button>
                                    </div>

                                    {/* Products Grid (Max 4 items per brand row) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {brandProducts.slice(0, 4).map((laptop) => (
                                            <ProductCard
                                                key={laptop.id}
                                                laptop={laptop}
                                                isWishlisted={wishlist.includes(laptop.id)}
                                                onToggleWishlist={toggleWishlist}
                                                onSelectProduct={(p) => {
                                                    setSelectedProduct(p);
                                                    setCurrentView("product-detail");
                                                }}
                                                onAddToCart={(p) => {
                                                    addToCartCustom(p, "32GB", "1TB SSD", "Space Black", "#1D1D1F", 1);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
