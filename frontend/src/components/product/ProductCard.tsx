import React from "react";
import { Star, Heart, Monitor, Cpu, HardDrive, ShoppingCart, Info, ImageOff, Tag, Zap } from "lucide-react";
import { LaptopProduct, formatVND } from "../../types";

export interface ProductCardProps {
    laptop: LaptopProduct;
    isWishlisted: boolean;
    onToggleWishlist: (laptopId: number) => void;
    onSelectProduct: (laptop: LaptopProduct) => void;
    onAddToCart: (laptop: LaptopProduct) => void;
}

export default function ProductCard({
    laptop,
    isWishlisted,
    onToggleWishlist,
    onSelectProduct,
    onAddToCart,
}: ProductCardProps) {
    const inStock = laptop.variants ? laptop.variants.some((variant) => variant.stockQuantity > 0) : laptop.stockQuantity > 0;
    const finalPrice = laptop.discountPrice && laptop.discountPrice < laptop.price ? laptop.discountPrice : laptop.price;

    return (
        <div 
            onClick={() => onSelectProduct(laptop)}
            className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#090a0d] p-4 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.7)] hover:shadow-[0_0_30px_rgba(0,255,85,0.25)] hover:border-[#00FF55]/50 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between h-full select-none text-white cursor-pointer"
        >
            {/* Ambient Corner Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF55]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#00FF55]/15 transition-all duration-500" />

            <div>
                {/* ── TOP IMAGE CONTAINER ── */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#14161c] to-[#0a0b0e] border border-white/[0.08] flex items-center justify-center">
                    {/* Background Radial Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,85,0.12)_0%,transparent_70%)] group-hover:bg-[radial-gradient(circle_at_center,rgba(0,255,85,0.28)_0%,transparent_75%)] transition-all duration-500" />

                    {/* Wishlist Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(laptop.id);
                        }}
                        aria-label={isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                        className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 cursor-pointer ${
                            isWishlisted
                                ? "border-[#00FF55] bg-[#00FF55]/20 text-[#00FF55] shadow-[0_0_15px_rgba(0,255,85,0.4)]"
                                : "border-white/15 bg-black/60 text-neutral-400 hover:border-[#00FF55] hover:text-[#00FF55] hover:bg-black/80"
                        }`}
                    >
                        <Heart className={`h-4 w-4 ${isWishlisted ? "fill-[#00FF55]" : ""}`} />
                    </button>

                    {/* Product Image */}
                    {laptop.images && laptop.images[0] ? (
                        <img
                            src={laptop.images[0]}
                            alt={laptop.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] z-10"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-600 z-10">
                            <ImageOff className="h-8 w-8" />
                            <span className="text-xs font-mono">Chưa có ảnh</span>
                        </div>
                    )}
                </div>

                {/* ── PRODUCT TITLE ── */}
                <h3 className="font-black text-base sm:text-lg text-white text-center leading-tight line-clamp-2 mt-3.5 px-1 group-hover:text-[#00FF55] transition-colors">
                    {laptop.name}
                </h3>

                {/* ── GLOWING LASER DIVIDER ── */}
                <div className="relative flex items-center justify-center my-3">
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00FF55]/50 to-transparent" />
                    <div className="absolute h-1.5 w-1.5 rounded-full bg-[#00FF55] shadow-[0_0_8px_#00FF55]" />
                </div>

                {/* ── 2x2 SPECS GRID ── */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-[#101216]/90 border border-white/[0.07] rounded-xl p-2.5 hover:border-white/20 transition-colors overflow-hidden">
                        <Monitor className="w-4 h-4 text-[#00FF55] shrink-0" />
                        <span className="text-[11px] font-semibold text-neutral-200 truncate">
                            {laptop.display || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#101216]/90 border border-white/[0.07] rounded-xl p-2.5 hover:border-white/20 transition-colors overflow-hidden">
                        <Cpu className="w-4 h-4 text-[#00FF55] shrink-0" />
                        <span className="text-[11px] font-semibold text-neutral-200 truncate">
                            {laptop.cpu || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#101216]/90 border border-white/[0.07] rounded-xl p-2.5 hover:border-white/20 transition-colors overflow-hidden">
                        <Cpu className="w-4 h-4 text-[#00FF55] shrink-0" />
                        <span className="text-[11px] font-semibold text-neutral-200 truncate">
                            {laptop.ram || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#101216]/90 border border-white/[0.07] rounded-xl p-2.5 hover:border-white/20 transition-colors overflow-hidden">
                        <HardDrive className="w-4 h-4 text-[#00FF55] shrink-0" />
                        <span className="text-[11px] font-semibold text-neutral-200 truncate">
                            {laptop.rom || "N/A"}
                        </span>
                    </div>
                </div>

                {/* ── GPU HIGHLIGHT BANNER ── */}
                {laptop.gpu && (
                    <div className="relative overflow-hidden rounded-xl border border-[#00FF55]/30 bg-gradient-to-r from-[#0a180f] via-[#10141a] to-[#0a180f] p-2.5 flex items-center justify-between gap-2 mt-2">
                        <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-[#00FF55]/20 rotate-45 blur-sm pointer-events-none" />
                        <div className="flex items-center gap-1.5 shrink-0 text-[#00FF55]">
                            <Zap className="w-4 h-4 text-[#00FF55] fill-[#00FF55]/20" />
                            <span className="text-[10px] font-black tracking-wider uppercase">GPU</span>
                        </div>
                        <span className="text-[11px] font-bold text-neutral-100 truncate text-right">
                            {laptop.gpu}
                        </span>
                    </div>
                )}

                {/* ── PRICE SECTION ── */}
                <div className="flex items-center justify-between mt-3.5 px-0.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-neutral-400 shrink-0">
                            <Tag className="w-4 h-4 text-[#ff3b3b]" />
                        </div>
                        <div className="flex flex-col text-left">
                            {laptop.discountPrice && laptop.discountPrice < laptop.price && (
                                <span className="text-[11px] text-neutral-400 line-through leading-none mb-0.5">
                                    {formatVND(laptop.price)}
                                </span>
                            )}
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-bold text-neutral-300">Giá Sale:</span>
                                <span className="text-xl sm:text-2xl font-black text-[#ff3b3b] tracking-tight drop-shadow-[0_0_12px_rgba(255,59,59,0.35)]">
                                    {finalPrice.toLocaleString("vi-VN")}{" "}
                                    <span className="underline decoration-2 underline-offset-4">đ</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BOTTOM ACTIONS & RATING ── */}
            <div className="mt-4 pt-1 flex flex-col gap-2.5">
                {/* Rating Bar Pill */}
                <div className="flex items-center justify-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-full py-1.5 px-4 text-xs font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-400">
                        {laptop.rating ? laptop.rating.toFixed(1) : "5.0"}
                    </span>
                    <span className="text-neutral-500 font-normal">
                        ({laptop.reviewCount || 0} đánh giá)
                    </span>
                </div>

                {/* Dual Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(laptop);
                        }}
                        className="flex items-center justify-center gap-1.5 bg-[#14161c] hover:bg-[#1e222b] border border-white/15 hover:border-white/40 text-neutral-200 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-md cursor-pointer group/btn"
                    >
                        <Info className="w-4 h-4 text-neutral-400 group-hover/btn:text-white transition-colors" />
                        <span>Chi tiết</span>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(laptop);
                        }}
                        disabled={!inStock}
                        className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#00FF55] via-[#00EE44] to-[#00DD33] hover:from-[#33FF77] hover:to-[#00FF55] text-black font-extrabold py-2.5 rounded-xl text-xs shadow-[0_0_20px_rgba(0,255,85,0.35)] hover:shadow-[0_0_25px_rgba(0,255,85,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                    >
                        <ShoppingCart className="w-4 h-4 text-black stroke-[2.5]" />
                        <span>Thêm giỏ</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
