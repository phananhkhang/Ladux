import React, { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useProductStore, useWishlistStore, useCartStore } from "../stores";
import ProductCard from "../components/product/ProductCard";
import { LaptopProduct, ViewType, mapProductResponseToLaptopProduct } from "../types";

export interface AllProductsViewProps {
    allProducts?: LaptopProduct[];
    selectedBrand?: string;
    setSelectedBrand?: (brand: string) => void;
    selectedCategory?: string;
    setSelectedCategory?: (category: string) => void;
    wishlist?: number[];
    toggleWishlist?: (laptopId: number) => void;
    setSelectedProduct: (product: LaptopProduct) => void;
    setCurrentView: (view: ViewType) => void;
    addToCartCustom?: (
        product: LaptopProduct,
        ram: string,
        storage: string,
        colorName: string,
        colorHex: string,
        quantity: number
    ) => void;
}

export default function AllProductsView({
    toggleWishlist,
    setSelectedProduct,
    setCurrentView,
}: AllProductsViewProps) {
    const {
        products,
        brands,
        categories,
        filters,
        isLoading,
        setBrandFilter,
        setCategoryFilter,
    } = useProductStore();

    const { wishlistProductIds, toggleWishlist: storeToggleWishlist } = useWishlistStore();
    const { addToCart } = useCartStore();

    const [selectedRam, setSelectedRam] = useState<string>("All");
    const [selectedRom, setSelectedRom] = useState<string>("All");
    const [maxPrice, setMaxPrice] = useState<number>(280000000);
    const [sortBy, setSortBy] = useState<string>("featured");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 8;

    // Chuyển đổi dữ liệu Backend ProductResponse DTO sang LaptopProduct UI model
    const mappedProducts = useMemo(() => {
        return products.map((p) => mapProductResponseToLaptopProduct(p));
    }, [products]);

    // Client-side filtering bổ sung cho RAM, ROM, Giá & Sắp xếp
    const filteredProducts = useMemo(() => {
        let list = [...mappedProducts];

        // RAM filter
        if (selectedRam !== "All") {
            list = list.filter((p) => p && p.ram && p.ram.includes(selectedRam));
        }

        // ROM filter
        if (selectedRom !== "All") {
            list = list.filter((p) => p && p.rom && p.rom.includes(selectedRom));
        }

        // Price filter
        list = list.filter((p) => (p.discountPrice || p.price) <= maxPrice);

        // Sorting
        if (sortBy === "price-asc") {
            list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (sortBy === "price-desc") {
            list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        } else if (sortBy === "newest") {
            list.sort((a, b) => b.id - a.id);
        } else if (sortBy === "rating") {
            list.sort((a, b) => b.rating - a.rating);
        }

        return list;
    }, [mappedProducts, selectedRam, selectedRom, maxPrice, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage]);

    return (
        <div className="bg-[#080a0b] text-white min-h-screen py-8">
            <div className="container mx-auto px-5 sm:px-6">
                {/* ── Breadcrumb & Top Bar ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium mb-2">
                            <button
                                onClick={() => setCurrentView("store")}
                                className="hover:text-white transition-colors"
                            >
                                Trang chủ
                            </button>
                            <ChevronRight className="w-3 h-3 text-neutral-600" />
                            <span className="text-neutral-200">Cửa hàng</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
                            TẤT CẢ LAPTOP
                        </h1>
                        <p className="text-xs text-neutral-400 font-mono mt-1">
                            {filteredProducts.length} sản phẩm
                        </p>
                    </div>

                    {/* Top Right Sort */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-400 font-medium hidden sm:inline">Sắp xếp:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-[#181a1b] border border-white/10 rounded-full px-5 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00D492] cursor-pointer hover:border-white/20 transition-all appearance-none pr-8 relative"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 1rem center",
                                backgroundSize: "1em"
                            }}
                        >
                            <option value="featured" className="bg-[#121214] text-white">Nổi bật nhất</option>
                            <option value="price-asc" className="bg-[#121214] text-white">Giá: Thấp đến Cao</option>
                            <option value="price-desc" className="bg-[#121214] text-white">Giá: Cao đến Thấp</option>
                            <option value="newest" className="bg-[#121214] text-white">Mới nhất</option>
                            <option value="rating" className="bg-[#121214] text-white">Đánh giá cao nhất</option>
                        </select>
                    </div>
                </div>

                {/* ── Main Layout: Sidebar Filter + Products Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Sidebar Filter Column */}
                    <aside className="lg:col-span-3 space-y-8 bg-[#0f1112]/60 p-6 rounded-2xl border border-white/[0.06] backdrop-blur-md">
                        {/* 1. THƯƠNG HIỆU ĐỘNG TỪ BACKEND */}
                        <div>
                            <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase mb-3">
                                THƯƠNG HIỆU
                            </h3>
                            <div className="space-y-1.5 flex flex-col items-start">
                                <button
                                    onClick={() => {
                                        setBrandFilter(null);
                                        setCurrentPage(1);
                                    }}
                                    className={`text-xs font-bold transition-all text-left ${
                                        filters.brandId === null
                                            ? "bg-[#00D492] text-black rounded-full py-1.5 px-4 shadow-md shadow-[#00D492]/20"
                                            : "text-neutral-400 hover:text-white py-1.5 px-4"
                                    }`}
                                >
                                    Tất cả thương hiệu
                                </button>
                                {brands.map((b) => {
                                    const isActive = filters.brandId === b.id;
                                    return (
                                        <button
                                            key={b.id}
                                            onClick={() => {
                                                setBrandFilter(b.id);
                                                setCurrentPage(1);
                                            }}
                                            className={`text-xs font-bold transition-all text-left ${
                                                isActive
                                                    ? "bg-[#00D492] text-black rounded-full py-1.5 px-4 shadow-md shadow-[#00D492]/20"
                                                    : "text-neutral-400 hover:text-white py-1.5 px-4"
                                            }`}
                                        >
                                            {b.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. DÒNG MÁY / DANH MỤC ĐỘNG TỪ BACKEND */}
                        <div className="pt-4 border-t border-white/[0.06]">
                            <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase mb-3">
                                DÒNG MÁY
                            </h3>
                            <div className="space-y-1.5 flex flex-col items-start">
                                <button
                                    onClick={() => {
                                        setCategoryFilter(null);
                                        setCurrentPage(1);
                                    }}
                                    className={`text-xs font-bold transition-all text-left ${
                                        filters.categoryId === null
                                            ? "bg-[#00D492] text-black rounded-full py-1.5 px-4 shadow-md shadow-[#00D492]/20"
                                            : "text-neutral-400 hover:text-white py-1.5 px-4"
                                    }`}
                                >
                                    Tất cả dòng máy
                                </button>
                                {categories.map((c) => {
                                    const isActive = filters.categoryId === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                setCategoryFilter(c.id);
                                                setCurrentPage(1);
                                            }}
                                            className={`text-xs font-bold transition-all text-left ${
                                                isActive
                                                    ? "bg-[#00D492] text-black rounded-full py-1.5 px-4 shadow-md shadow-[#00D492]/20"
                                                    : "text-neutral-400 hover:text-white py-1.5 px-4"
                                            }`}
                                        >
                                            {c.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. TẦM GIÁ */}
                        <div className="pt-4 border-t border-white/[0.06]">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase">
                                    TẦM GIÁ
                                </h3>
                                <button
                                    onClick={() => setMaxPrice(280000000)}
                                    className="text-[11px] font-medium text-[#00D492] hover:underline"
                                >
                                    Tất cả
                                </button>
                            </div>
                            <input
                                type="range"
                                min={20000000}
                                max={280000000}
                                step={10000000}
                                value={maxPrice}
                                onChange={(e) => {
                                    setMaxPrice(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full accent-[#00D492] bg-neutral-800 rounded-lg cursor-pointer h-2"
                            />
                            <div className="flex justify-between text-[11px] font-mono text-neutral-400 mt-2">
                                <span>20tr</span>
                                <span>280tr</span>
                            </div>
                        </div>

                        {/* 4. DUNG LƯỢNG RAM */}
                        <div className="pt-4 border-t border-white/[0.06]">
                            <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase mb-3">
                                DUNG LƯỢNG RAM
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "Tất cả", value: "All" },
                                    { label: "16GB", value: "16GB" },
                                    { label: "32GB", value: "32GB" },
                                    { label: "64GB", value: "64GB" },
                                    { label: "128GB", value: "128GB" },
                                ].map((item) => {
                                    const isActive = selectedRam === item.value;
                                    return (
                                        <button
                                            key={item.value}
                                            onClick={() => {
                                                setSelectedRam(item.value);
                                                setCurrentPage(1);
                                            }}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                isActive
                                                    ? "bg-[#00D492] text-black shadow-md shadow-[#00D492]/20"
                                                    : "border border-neutral-800 text-neutral-300 hover:border-neutral-600"
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 5. DUNG LƯỢNG Ổ CỨNG (ROM) */}
                        <div className="pt-4 border-t border-white/[0.06]">
                            <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase mb-3">
                                DUNG LƯỢNG Ổ CỨNG (ROM)
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "Tất cả", value: "All" },
                                    { label: "512GB", value: "512GB" },
                                    { label: "1TB", value: "1TB" },
                                    { label: "2TB", value: "2TB" },
                                    { label: "4TB", value: "4TB" },
                                ].map((item) => {
                                    const isActive = selectedRom === item.value;
                                    return (
                                        <button
                                            key={item.value}
                                            onClick={() => {
                                                setSelectedRom(item.value);
                                                setCurrentPage(1);
                                            }}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                isActive
                                                    ? "bg-[#00D492] text-black shadow-md shadow-[#00D492]/20"
                                                    : "border border-neutral-800 text-neutral-300 hover:border-neutral-600"
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Right Products Grid Column */}
                    <main className="lg:col-span-9 space-y-8">
                        {isLoading ? (
                            <div className="text-center py-20 bg-[#0f1112]/40 rounded-2xl border border-white/[0.06]">
                                <div className="inline-block w-8 h-8 border-2 border-[#00D492] border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-neutral-400 text-xs font-mono">Đang tải sản phẩm từ Database...</p>
                            </div>
                        ) : paginatedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {paginatedProducts.map((laptop) => (
                                    <ProductCard
                                        key={laptop.id}
                                        laptop={laptop}
                                        isWishlisted={wishlistProductIds.includes(laptop.id)}
                                        onToggleWishlist={(id) => (toggleWishlist ? toggleWishlist(id) : storeToggleWishlist(id))}
                                        onSelectProduct={(p) => {
                                            setSelectedProduct(p);
                                            setCurrentView("product-detail");
                                        }}
                                        onAddToCart={(p) => {
                                            const rawProduct = products.find((prod) => prod.id === p.id);
                                            const activeVariant = rawProduct?.variants?.find((v) => v.isActive) ?? rawProduct?.variants?.[0];
                                            const targetVariantId = activeVariant ? activeVariant.id : p.id;
                                            addToCart({ productId: targetVariantId, quantity: 1 });
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-[#0f1112]/40 rounded-2xl border border-white/[0.06]">
                                <p className="text-neutral-400 text-sm font-medium">
                                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                                </p>
                                <button
                                    onClick={() => {
                                        setBrandFilter(null);
                                        setCategoryFilter(null);
                                        setSelectedRam("All");
                                        setSelectedRom("All");
                                        setMaxPrice(280000000);
                                    }}
                                    className="mt-4 bg-[#00D492] text-black font-bold text-xs px-5 py-2 rounded-full hover:bg-[#00bc82] transition-colors"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-8 border-t border-white/[0.06]">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-full border border-neutral-800 text-xs font-medium text-neutral-400 hover:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    &larr; Trước
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                    const isActive = currentPage === pageNum;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                                                isActive
                                                    ? "bg-[#00D492] text-black shadow-md shadow-[#00D492]/20"
                                                    : "border border-neutral-800 text-neutral-300 hover:border-neutral-600"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-full border border-neutral-800 text-xs font-medium text-neutral-400 hover:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Sau &rarr;
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
