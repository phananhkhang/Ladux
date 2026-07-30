import React from "react";
import { Heart, Star } from "lucide-react";
import { LaptopProduct, formatVND, ViewType } from "../types";

export interface WishlistViewProps {
    wishlist: number[];
    toggleWishlist: (laptopId: number) => void;
    products: LaptopProduct[];
    setCurrentView: (view: ViewType) => void;
    setSelectedProduct: (product: LaptopProduct) => void;
}

export default function WishlistView({
    wishlist,
    toggleWishlist,
    products,
    setCurrentView,
    setSelectedProduct,
}: WishlistViewProps) {
    const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

    return (
        <main className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-6 mb-8">
                <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#00D492]">
                        LADUX FAVORITES ({wishlist.length})
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                        DANH SÁCH LAPTOP YÊU THÍCH
                    </h1>
                </div>
                <button
                    onClick={() => setCurrentView("store")}
                    className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00D492] transition"
                >
                    ← Trở lại cửa hàng
                </button>
            </div>

            {wishlist.length === 0 ? (
                <div className="py-20 text-center space-y-6 max-w-md mx-auto">
                    <div className="w-24 h-24 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-600">
                        <Heart className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">Chưa có sản phẩm yêu thích</h2>
                        <p className="text-xs text-neutral-400">
                            Hãy nhấn vào biểu tượng trái tim ở các sản phẩm Laptop cao cấp để lưu lại danh sách quan tâm của bạn.
                        </p>
                    </div>
                    <button
                        onClick={() => setCurrentView("store")}
                        className="bg-[#00D492] text-black font-extrabold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20"
                    >
                        Khám phá Laptop ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistedProducts.map((laptop) => (
                        <div
                            key={laptop.id}
                            className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.035] shadow-[0_18px_60px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-1 hover:border-[#00D492]/60 hover:shadow-[0_22px_80px_rgba(0,212,146,0.12)] flex flex-col justify-between"
                        >
                            <div>
                                <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                                    <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent to-transparent pointer-events-none" />
                                    <button
                                        onClick={() => toggleWishlist(laptop.id)}
                                        aria-label="Xóa khỏi yêu thích"
                                        className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#00D492]/60 bg-[#00D492] text-[#07100e] backdrop-blur-md transition-all duration-300 hover:scale-110"
                                    >
                                        <Heart className="h-4 w-4 fill-current" />
                                    </button>
                                    <img
                                        src={laptop.images[0]}
                                        alt={laptop.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-2">
                                        <span>{laptop.brand}</span>
                                        <span className="flex items-center gap-1 text-amber-400">
                                            <Star className="w-3.5 h-3.5 fill-amber-400" /> {laptop.rating} (
                                            {laptop.reviewCount})
                                        </span>
                                    </div>
                                    <h3
                                        onClick={() => {
                                            setSelectedProduct(laptop);
                                            setCurrentView("product-detail");
                                        }}
                                        className="font-bold text-sm leading-snug line-clamp-2 hover:underline cursor-pointer min-h-[2.5rem] text-white"
                                    >
                                        {laptop.name}
                                    </h3>
                                    <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                                        {laptop.description}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 pt-0 border-t border-neutral-900 mt-2">
                                <div className="my-3 text-lg font-bold font-mono text-[#00D492]">
                                    {formatVND(laptop.discountPrice || laptop.price)}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(laptop);
                                            setCurrentView("product-detail");
                                        }}
                                        className="border border-neutral-800 hover:border-white py-2.5 rounded-xl text-xs font-semibold text-neutral-300 transition"
                                    >
                                        Chi Tiết
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(laptop);
                                            setCurrentView("product-detail");
                                        }}
                                        className="bg-[#00D492] text-black py-2.5 rounded-xl text-xs font-bold hover:bg-[#00bc82] transition"
                                    >
                                        Chọn Cấu Hình
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
