import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { CartItem, CouponItem, LaptopProduct, formatVND, mapProductResponseToLaptopProduct } from "../types";
import { useCartStore } from "../stores";
import { productPath, ROUTES } from "../app/routePaths";

export interface CartViewProps {
    cartItems?: CartItem[];
    updateCartQuantity?: (index: number, quantity: number) => void;
    appliedCoupon?: CouponItem | null;
    setSelectedProduct: (product: LaptopProduct) => void;
}

export default function CartView({
    appliedCoupon,
    setSelectedProduct,
}: CartViewProps) {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeItem, isLoading } = useCartStore();

    const cartItemsList = cart?.items || [];
    const totalCount = cartItemsList.reduce((acc, i) => acc + i.quantity, 0);
    const subTotal = cart?.totalPrice || 0;
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const finalAmount = Math.max(0, subTotal - discountAmount);

    return (
        <main className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-6 mb-8">
                <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#00FF41]">
                        GIỎ HÀNG LADUX ({totalCount})
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                        SẢN PHẨM ĐÃ CHỌN
                    </h1>
                </div>
                <button
                    onClick={() => navigate(ROUTES.products)}
                    className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00FF41] transition"
                >
                    ← Tiếp tục xem sản phẩm
                </button>
            </div>

            {isLoading ? (
                <div className="py-20 text-center space-y-4">
                    <div className="inline-block w-8 h-8 border-2 border-[#00FF41] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-neutral-400 text-xs font-mono">Đang cập nhật giỏ hàng từ máy chủ...</p>
                </div>
            ) : cartItemsList.length === 0 ? (
                /* Empty Cart State */
                <div className="py-20 text-center space-y-6 max-w-md mx-auto">
                    <div className="w-24 h-24 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-600">
                        <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">Giỏ hàng của bạn đang trống</h2>
                        <p className="text-xs text-neutral-400">
                            Chưa có sản phẩm Laptop cao cấp nào được chọn. Hãy khám phá ngay các siêu phẩm tại LADUX!
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(ROUTES.products)}
                        className="bg-[#00FF41] text-black font-extrabold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-[#00cc34] transition shadow-lg shadow-[#00FF41]/20"
                    >
                        Khám phá Laptop ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Item List */}
                    <div className="lg:col-span-8 space-y-4">
                        {cartItemsList.map((item) => {
                            if (!item.product) return null;
                            const mappedProduct = mapProductResponseToLaptopProduct(item.product);
                            const itemPrice = mappedProduct.discountPrice || mappedProduct.price;

                            return (
                                <div
                                    key={item.id}
                                    className="p-5 bg-neutral-950 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-6 transition hover:border-neutral-800"
                                >
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="w-24 h-24 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shrink-0 p-2 flex items-center justify-center">
                                            <img
                                                src={mappedProduct.images[0]}
                                                alt={mappedProduct.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-mono text-[#00FF41] font-bold uppercase">
                                                {mappedProduct.brand}
                                            </span>
                                            <h3
                                                onClick={() => {
                                                    setSelectedProduct(mappedProduct);
                                                    navigate(productPath(mappedProduct.id));
                                                }}
                                                className="font-bold text-sm text-white line-clamp-1 hover:underline cursor-pointer"
                                            >
                                                {mappedProduct.name}
                                            </h3>
                                            <p className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                                                <span>
                                                    {mappedProduct.ram || "Standard"} / {mappedProduct.rom || "SSD"}
                                                </span>
                                            </p>
                                            <p className="text-sm font-mono font-bold text-[#00FF41] pt-1">
                                                {formatVND(itemPrice)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-neutral-900 pt-4 sm:pt-0">
                                        {/* Quantity Stepper */}
                                        <div className="flex items-center border border-neutral-800 bg-neutral-900 rounded-xl p-1">
                                            <button
                                                onClick={() => {
                                                    if (item.quantity > 1) {
                                                        updateQuantity(item.product!.id, item.quantity - 1);
                                                    } else {
                                                        removeItem(item.product!.id);
                                                    }
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white font-bold transition"
                                            >
                                                -
                                            </button>
                                            <span className="w-10 text-center font-mono font-bold text-xs text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.product!.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white font-bold transition"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="text-right font-mono text-sm font-bold text-white min-w-[100px]">
                                            {formatVND(itemPrice * item.quantity)}
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.product!.id)}
                                            aria-label="Xóa sản phẩm"
                                            className="p-2.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-6">
                            <h2 className="text-lg font-black text-white uppercase tracking-wider pb-4 border-b border-neutral-900">
                                TỔNG ĐƠN HÀNG
                            </h2>

                            <div className="space-y-3 font-mono text-xs">
                                <div className="flex justify-between text-neutral-400">
                                    <span>Tạm tính ({totalCount} máy):</span>
                                    <span className="text-white font-semibold">
                                        {formatVND(subTotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-neutral-400">
                                    <span>Phí vận chuyển bảo hiểm:</span>
                                    <span className="text-[#00FF41] font-semibold">MIỄN PHÍ</span>
                                </div>

                                {appliedCoupon && (
                                    <div className="flex justify-between text-[#00FF41]">
                                        <span>Giảm giá ({appliedCoupon.code}):</span>
                                        <span className="font-semibold">
                                            -{formatVND(appliedCoupon.discountAmount)}
                                        </span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-neutral-900 flex justify-between items-baseline">
                                    <span className="text-sm font-bold text-white uppercase">Tổng thanh toán:</span>
                                    <span className="text-2xl font-black text-[#00FF41]">
                                        {formatVND(finalAmount)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(ROUTES.checkout)}
                                className="w-full bg-[#00FF41] text-black py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-[#00cc34] transition shadow-lg shadow-[#00FF41]/20 flex items-center justify-center gap-2"
                            >
                                <span>TIẾN HÀNH THANH TOÁN</span>
                                <ChevronRight className="w-4 h-4 stroke-[3]" />
                            </button>

                            <div className="pt-2 text-[10px] text-neutral-500 font-mono space-y-2">
                                <p className="flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
                                    Cam kết bảo mật thông tin thanh toán 100%
                                </p>
                                <p className="flex items-center gap-2">
                                    <Truck className="w-3.5 h-3.5 text-[#00FF41]" />
                                    Giao hàng hỏa tốc trong 2h tại Hà Nội & TP.HCM
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
