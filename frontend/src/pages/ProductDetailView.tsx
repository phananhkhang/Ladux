import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Star, Check, ShoppingBag, MessageSquare, Send, Heart } from "lucide-react";
import { LaptopProduct, formatVND } from "../types";
import { useWishlistStore } from "../stores";
import { ROUTES } from "../app/routePaths";

export interface ProductDetailViewProps {
    selectedProduct: LaptopProduct;
    toggleWishlist?: (id: number) => void;
    addToCartCustom: (
        product: LaptopProduct,
        ram: string,
        storage: string,
        colorName: string,
        colorHex: string,
        quantity: number
    ) => void;
    handleAddReview: (e: React.FormEvent) => void;
    newRating: number;
    setNewRating: (rating: number) => void;
    newComment: string;
    setNewComment: (comment: string) => void;
}

export default function ProductDetailView({
    selectedProduct,
    toggleWishlist,
    addToCartCustom,
    handleAddReview,
    newRating,
    setNewRating,
    newComment,
    setNewComment,
}: ProductDetailViewProps) {
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [selectedProduct?.id]);

    const [selectedRam, setSelectedRam] = useState<"16GB" | "32GB" | "64GB">("32GB");
    const [selectedStorage, setSelectedStorage] = useState<"512GB SSD" | "1TB SSD" | "2TB SSD">("1TB SSD");
    const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>({
        name: "Space Black",
        hex: "#1D1D1F",
    });
    const [productQuantity, setProductQuantity] = useState<number>(1);

    const wishlistStore = useWishlistStore();
    const isWishlisted = wishlistStore.isInWishlist(selectedProduct.id);

    const computeVariantPrice = (basePrice: number, ram: string, storage: string) => {
        let extra = 0;
        if (ram === "32GB") extra += 3000000;
        if (ram === "64GB") extra += 8000000;
        if (storage === "1TB SSD") extra += 2500000;
        if (storage === "2TB SSD") extra += 6000000;
        return basePrice + extra;
    };

    return (
        <main className="container mx-auto px-6 py-12">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-8 flex-wrap">
                <Link to={ROUTES.home} className="hover:text-[#00FF41] hover:underline transition-colors">
                    Trang chủ
                </Link>
                <ChevronRight className="w-3 h-3" />
                <Link to={ROUTES.products} className="hover:text-[#00FF41] hover:underline transition-colors">
                    Sản phẩm
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white font-semibold truncate max-w-[300px] sm:max-w-none">
                    {selectedProduct.name}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Product Gallery & Overview */}
                <div className="lg:col-span-6 space-y-6">
                    <div className="aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center p-6 relative group">
                        <img
                            src={selectedProduct.images[0]}
                            alt={selectedProduct.name}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-4 left-4 bg-black/60 border border-[#00FF41]/40 text-[#00FF41] text-[10px] font-mono font-bold px-3 py-1 rounded-full backdrop-blur-md">
                            CHÍNH HÃNG NGUYÊN SEAL
                        </span>
                    </div>

                    {/* Specifications Overview Cards */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-400">
                            Thông số kỹ thuật chi tiết
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                            <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
                                <span className="text-neutral-500 block text-[10px] uppercase">Bộ xử lý (CPU)</span>
                                <span className="font-semibold text-neutral-200 block truncate">
                                    {selectedProduct.cpu || "Intel Core i7 Gen 13/14 / Apple M-Series"}
                                </span>
                            </div>
                            <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
                                <span className="text-neutral-500 block text-[10px] uppercase">Đồ họa (GPU)</span>
                                <span className="font-semibold text-neutral-200 block truncate">
                                    {selectedProduct.gpu || "NVIDIA GeForce RTX 40-Series / Integrated"}
                                </span>
                            </div>
                            <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
                                <span className="text-neutral-500 block text-[10px] uppercase">Màn hình</span>
                                <span className="font-semibold text-neutral-200 block truncate">
                                    {selectedProduct.display || "15.6 inch 2.5K 165Hz / Liquid Retina"}
                                </span>
                            </div>
                            <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
                                <span className="text-neutral-500 block text-[10px] uppercase">Tình trạng kho</span>
                                <span className="font-semibold text-emerald-500 block">Sẵn hàng ({selectedProduct.stockQuantity || 10} máy)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Variant & Quantity Selector */}
                <div className="lg:col-span-6 space-y-8">
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="inline-block px-3 py-1 bg-neutral-900 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-bold rounded-md mb-3">
                                    {selectedProduct.brand} • {selectedProduct.category}
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                    {selectedProduct.name}
                                </h1>
                            </div>
                            <button
                                onClick={() => (toggleWishlist ? toggleWishlist(selectedProduct.id) : wishlistStore.toggleWishlist(selectedProduct.id))}
                                className={`p-3 rounded-xl border transition ${
                                    isWishlisted
                                        ? "bg-red-500/10 border-red-500 text-red-500"
                                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-red-400"
                                }`}
                                title={isWishlisted ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                            </button>
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
                            <div className="flex items-center gap-1 text-amber-400 font-bold">
                                <Star className="w-4 h-4 fill-amber-400" /> {selectedProduct.rating}
                            </div>
                            <span>•</span>
                            <span>{selectedProduct.reviewCount} Đánh giá từ khách hàng</span>
                            <span>•</span>
                            <span className="text-[#00FF41] font-mono">Bảo hành 24 Tháng</span>
                        </div>
                    </div>

                    {/* Dynamic Price Display */}
                    <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-mono text-neutral-500 uppercase block mb-1">
                                Giá chính thức (Đã có VAT)
                            </span>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black font-mono text-[#00FF41]">
                                    {formatVND(
                                        computeVariantPrice(
                                            selectedProduct.discountPrice || selectedProduct.price,
                                            selectedRam,
                                            selectedStorage
                                        )
                                    )}
                                </span>
                                {selectedProduct.discountPrice && (
                                    <span className="text-sm font-mono text-neutral-500 line-through">
                                        {formatVND(
                                            computeVariantPrice(selectedProduct.price, selectedRam, selectedStorage)
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="self-start sm:self-center text-[10px] font-bold uppercase tracking-widest text-[#00FF41] bg-[#00FF41]/10 border border-[#00FF41]/30 px-3 py-1.5 rounded-full">
                            Miễn phí giao hàng toàn quốc
                        </span>
                    </div>

                    {/* Variant Selectors */}
                    <div className="space-y-6 border-t border-neutral-900 pt-6">
                        {/* RAM Selection */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                                    1. Chọn Bộ Nhớ RAM:
                                </label>
                                <span className="text-xs font-mono text-[#00FF41] font-bold">{selectedRam}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {(["16GB", "32GB", "64GB"] as const).map((ram) => (
                                    <button
                                        key={ram}
                                        onClick={() => setSelectedRam(ram)}
                                        className={`py-3 px-4 rounded-xl font-mono text-xs font-bold border transition-all ${
                                            selectedRam === ram
                                                ? "border-[#00FF41] bg-[#00FF41]/10 text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                                                : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white"
                                        }`}
                                    >
                                        {ram}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Storage Selection */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                                    2. Chọn Ổ Cứng (SSD):
                                </label>
                                <span className="text-xs font-mono text-[#00FF41] font-bold">{selectedStorage}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {(["512GB SSD", "1TB SSD", "2TB SSD"] as const).map((storage) => (
                                    <button
                                        key={storage}
                                        onClick={() => setSelectedStorage(storage)}
                                        className={`py-3 px-4 rounded-xl font-mono text-xs font-bold border transition-all ${
                                            selectedStorage === storage
                                                ? "border-[#00FF41] bg-[#00FF41]/10 text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                                                : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white"
                                        }`}
                                    >
                                        {storage}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Swatches */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                                    3. Chọn Màu Sắc Vỏ Máy:
                                </label>
                                <span className="text-xs font-mono text-[#00FF41] font-bold">{selectedColor.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {[
                                    { name: "Space Black", hex: "#1D1D1F" },
                                    { name: "Silver", hex: "#E3E4E5" },
                                    { name: "Midnight Green", hex: "#1B2824" },
                                ].map((col) => (
                                    <button
                                        key={col.name}
                                        onClick={() => setSelectedColor(col)}
                                        className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                                            selectedColor.name === col.name
                                                ? "border-[#00FF41] bg-[#00FF41]/10 text-white"
                                                : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                                        }`}
                                    >
                                        <span
                                            className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                                            style={{ backgroundColor: col.hex }}
                                        />
                                        <span>{col.name}</span>
                                        {selectedColor.name === col.name && (
                                            <Check className="w-3.5 h-3.5 text-[#00FF41] ml-1" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quantity Stepper & Add to Cart Action */}
                    <div className="pt-4 space-y-4">
                        <div className="flex items-center gap-4">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-neutral-800 bg-neutral-950 rounded-xl p-1">
                                <button
                                    onClick={() => setProductQuantity((q) => Math.max(1, q - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white font-bold transition"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center font-mono font-bold text-sm text-white">
                                    {productQuantity}
                                </span>
                                <button
                                    onClick={() => setProductQuantity((q) => q + 1)}
                                    className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white font-bold transition"
                                >
                                    +
                                </button>
                            </div>

                             {/* Add to Cart Button */}
                            <button
                                onClick={() => {
                                    addToCartCustom(
                                        selectedProduct,
                                        selectedRam,
                                        selectedStorage,
                                        selectedColor.name,
                                        selectedColor.hex,
                                        productQuantity
                                    );
                                }}
                                className="flex-1 bg-[#00FF41] text-black py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-[#00cc34] transition shadow-lg shadow-[#00FF41]/20 flex items-center justify-center gap-2"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Thêm Vào Giỏ Hàng</span>
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                addToCartCustom(
                                    selectedProduct,
                                    selectedRam,
                                    selectedStorage,
                                    selectedColor.name,
                                    selectedColor.hex,
                                    productQuantity
                                );
                                navigate(ROUTES.checkout);
                            }}
                            className="w-full bg-white text-black py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-neutral-200 transition"
                        >
                            Mua Ngay Với Cấu Hình Này
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <section className="mt-16 pt-12 border-t border-neutral-900 max-w-4xl">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-[#00FF41]" />
                    <span>ĐÁNH GIÁ TỪ NGƯỜI DÙNG ({selectedProduct.reviews.length})</span>
                </h2>

                <form
                    onSubmit={handleAddReview}
                    className="mb-10 p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-4"
                >
                    <h3 className="text-sm font-bold text-white uppercase">Viết Đánh Giá Của Bạn</h3>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">Đánh giá số sao:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                className="p-1 hover:scale-110 transition-transform"
                            >
                                <Star
                                    className={`w-5 h-5 ${
                                        star <= newRating ? "fill-amber-400 text-amber-400" : "text-neutral-700"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>

                    <textarea
                        required
                        rows={3}
                        placeholder="Chia sẻ trải nghiệm sử dụng mẫu Laptop này..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    ></textarea>

                    <button
                        type="submit"
                        className="bg-[#00FF41] text-black px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#00cc34]"
                    >
                        <Send className="w-3.5 h-3.5" /> Gửi Đánh Giá
                    </button>
                </form>

                <div className="space-y-6">
                    {selectedProduct.reviews.map((rev) => (
                        <div
                            key={rev.id}
                            className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={rev.avatar}
                                        alt={rev.reviewerName}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div>
                                        <span className="font-bold text-xs text-white block">
                                            {rev.reviewerName}
                                        </span>
                                        <span className="text-[10px] text-neutral-500 font-mono">
                                            {rev.createdAt}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[...Array(rev.rating)].map((_, i) => (
                                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-neutral-300 leading-relaxed">{rev.comment}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
