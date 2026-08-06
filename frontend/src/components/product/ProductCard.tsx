import React from "react";
import { Star, Heart, Monitor, Cpu, HardDrive, ShoppingCart, Info, ImageOff } from "lucide-react";
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
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#121214] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(0,255,65,0.1)] hover:border-[#00FF41]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full select-none text-white">
            {/* Wishlist Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(laptop.id);
                }}
                aria-label={isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                className={`absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${isWishlisted
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-white/10 bg-[#121214]/85 text-neutral-400 hover:border-red-500 hover:text-red-500 hover:bg-[#121214]"
                    }`}
            >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>

            <div className="cursor-pointer" onClick={() => onSelectProduct(laptop)}>
                {/* Product Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white/[0.02] mb-4 border border-white/[0.04]">
                    {laptop.images[0] ? (
                        <img
                            src={laptop.images[0]}
                            alt={laptop.name}
                            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-600">
                            <ImageOff className="h-8 w-8" />
                            <span className="text-[10px]">Chưa có ảnh</span>
                        </div>
                    )}
                </div>

                {/* Product Title */}
                <h3 className="font-bold text-[14px] leading-snug line-clamp-2 text-white group-hover:text-[#00FF41] transition-colors text-center h-[2.5rem] flex items-center justify-center px-1">
                    {laptop.name}
                </h3>

                {/* Specs badges box */}
                <div className="bg-[#1c1c1f] rounded-xl p-3 text-[11px] text-neutral-300 mt-3 space-y-1.5 border border-white/[0.03]">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-left">
                        <div className="flex items-center gap-1.5 truncate">
                            <Monitor className="w-3.5 h-3.5 text-[#00FF41] shrink-0" />
                            <span className="truncate">{laptop.display || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                            <Cpu className="w-3.5 h-3.5 text-[#00FF41] shrink-0" />
                            <span className="truncate">{laptop.cpu || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                            <Cpu className="w-3.5 h-3.5 text-[#00FF41] shrink-0" />
                            <span className="truncate">{laptop.ram || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                            <HardDrive className="w-3.5 h-3.5 text-[#00FF41] shrink-0" />
                            <span className="truncate">{laptop.rom || "Chưa cập nhật"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/[0.05] truncate text-left">
                        <Cpu className="w-3.5 h-3.5 text-[#00FF41] shrink-0" />
                        <span className="truncate font-medium text-neutral-200">{laptop.gpu || "Chưa cập nhật"}</span>
                    </div>
                </div>

                {/* Price block */}
                <div className="mt-4 space-y-0.5 text-left pl-1">
                    {laptop.discountPrice && laptop.discountPrice < laptop.price && (
                        <div className="text-[14px] text-neutral-400">
                            Giá gốc: <span className="line-through">{formatVND(laptop.price)}</span>
                        </div>
                    )}
                    <div className="text-[20px] font-bold text-[#ff4a4a] flex items-baseline gap-1">
                        <span>Giá Sale:</span>
                        <span className="text-[20px] font-extrabold text-[#ff4a4a]">{formatVND(laptop.discountPrice || laptop.price)}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Actions and Rating */}
            <div className="mt-4 pt-3 border-t border-white/[0.05] flex flex-col gap-3">
                {/* Rating */}
                {laptop.reviewCount > 0 ? (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-bold">
                        <span>{laptop.rating.toFixed(1)}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-neutral-400 font-normal">({laptop.reviewCount} đánh giá)</span>
                    </div>
                ) : (
                    <div className="text-center text-[11px] text-neutral-500">Chưa có đánh giá</div>
                )}

                {/* Buy buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onSelectProduct(laptop)}
                        className="flex items-center justify-center gap-1 border border-white/10 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05] py-1.5 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white transition-all duration-200"
                    >
                        <Info className="w-3.5 h-3.5" />
                        <span>Chi tiết</span>
                    </button>
                    <button
                        onClick={() => onAddToCart(laptop)}
                        disabled={!laptop.variants.some((variant) => variant.stockQuantity > 0)}
                        className="flex items-center justify-center gap-1 bg-[#00FF41] text-black py-1.5 rounded-lg text-xs font-bold hover:bg-[#00cc34] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Thêm giỏ</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
