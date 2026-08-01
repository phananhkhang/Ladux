import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Plus,
    Zap,
    AlertCircle,
    Trash2,
    Lock,
    CheckCircle2,
} from "lucide-react";
import {
    CouponItem,
    PaymentProvider,
    formatVND,
    mapProductResponseToLaptopProduct,
} from "../types";
import { orderService, paymentService, couponService } from "../services";
import { useCartStore, useAddressStore, useOrderStore } from "../stores";
import { ROUTES } from "../app/routePaths";

export interface CheckoutViewProps {
    cartItems?: any[];
    savedAddresses?: any[];
    setSavedAddresses?: (addresses: any[]) => void;
    selectedAddressId?: number;
    setSelectedAddressId?: (id: number) => void;
    appliedCoupon?: CouponItem | null;
    setAppliedCoupon?: (coupon: CouponItem | null) => void;
    paymentMethod?: PaymentProvider;
    setPaymentMethod?: (method: PaymentProvider) => void;
    orders?: any[];
    setOrders?: (orders: any[]) => void;
    setSelectedAddressOrderId?: (id: string) => void;
    setCartItems?: (items: any[]) => void;
    showToast: (msg: string) => void;
    handleApplyCoupon?: () => void;
    couponInput?: string;
    setCouponInput?: (val: string) => void;
    couponError?: string;
}

export default function CheckoutView({
    setSelectedAddressOrderId,
    showToast,
}: CheckoutViewProps) {
    const navigate = useNavigate();
    const { cart, clearCart } = useCartStore();
    const { addresses, createAddress, fetchAddresses } = useAddressStore();
    const { fetchOrders } = useOrderStore();

    const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null);
    const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("COD");
    const [couponCodeInput, setCouponCodeInput] = useState<string>("");
    const [appliedCouponItem, setAppliedCouponItem] = useState<CouponItem | null>(null);
    const [couponErrMsg, setCouponErrMsg] = useState<string>("");

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newAddress, setNewAddress] = useState({
        receiverName: "",
        phone: "",
        street: "",
        ward: "",
        district: "",
        city: "Hà Nội",
        isDefault: false,
    });

    useEffect(() => {
        void fetchAddresses();
    }, [fetchAddresses]);

    useEffect(() => {
        if (addresses.length > 0 && selectedAddrId === null) {
            const def = addresses.find((a) => a.isDefault) || addresses[0];
            setSelectedAddrId(def.id);
        }
    }, [addresses, selectedAddrId]);

    const cartItemsList = cart?.items || [];
    const subTotal = cart?.totalPrice || 0;
    const discountAmount = appliedCouponItem?.discountAmount || 0;
    const finalAmount = Math.max(0, subTotal - discountAmount);

    const handleApplyCoupon = async () => {
        if (!couponCodeInput.trim()) {
            setCouponErrMsg("Vui lòng nhập mã giảm giá");
            return;
        }
        setCouponErrMsg("");
        try {
            const res = await couponService.applyCoupon(couponCodeInput.trim());

            if (res.minOrderValue && subTotal < res.minOrderValue) {
                setCouponErrMsg(`Đơn hàng tối thiểu phải từ ${formatVND(res.minOrderValue)} để áp dụng mã này!`);
                return;
            }

            let calculatedDiscount = 0;
            const isPercent = res.discountType === "PERCENT" || (res.discountType as string) === "PERCENTAGE";
            if (isPercent) {
                calculatedDiscount = (subTotal * res.discountValue) / 100;
            } else {
                calculatedDiscount = res.discountValue;
            }

            setAppliedCouponItem({
                code: res.code || couponCodeInput.trim().toUpperCase(),
                discountAmount: calculatedDiscount,
                minSubtotal: res.minOrderValue || 0,
                description: isPercent
                    ? `Giảm ${res.discountValue}%`
                    : `Giảm ${formatVND(res.discountValue)}`,
            });
            showToast("Đã áp dụng mã giảm giá thành công!");
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn!";
            setCouponErrMsg(msg);
        }
    };

    const handlePlaceOrder = async () => {
        const selectedAddr = addresses.find((a) => a.id === selectedAddrId) || addresses[0];

        if (!selectedAddr) {
            showToast("Vui lòng chọn hoặc thêm địa chỉ giao hàng!");
            return;
        }

        const cleanPhone = (selectedAddr.phone || "").trim().replace(/[\s\-\.]/g, "");

        setIsSubmitting(true);
        try {
            // Bắn API Tạo Đơn Hàng Thật xuống Backend
            const orderRes = await orderService.createOrder({
                couponCode: appliedCouponItem?.code,
                paymentProvider: paymentProvider,
                shippingAddress: {
                    receiverName: (selectedAddr.receiverName || (selectedAddr as any).fullName || "").trim(),
                    phone: cleanPhone,
                    street: (selectedAddr.street || (selectedAddr as any).addressLine || (selectedAddr as any).addressDetail || "").trim(),
                    ward: (selectedAddr.ward || "").trim() || "Chưa chọn Phường/Xã",
                    district: (selectedAddr.district || "").trim() || "Chưa chọn Quận/Huyện",
                    city: (selectedAddr.city || "").trim() || "Hà Nội",
                },
            });

            // Xử lý luồng VNPay
            if (paymentProvider === "VNPAY") {
                showToast("Đang tạo cổng thanh toán VNPay...");
                try {
                    const payRes = await paymentService.createPayment({
                        orderId: orderRes.id,
                        provider: "VNPAY",
                    });
                    if (payRes.paymentUrl) {
                        window.location.href = payRes.paymentUrl;
                        return;
                    }
                } catch (payErr) {
                    console.error("Lỗi khởi tạo thanh toán VNPay:", payErr);
                }
            }

            // Xử lý luồng COD
            if (setSelectedAddressOrderId) {
                setSelectedAddressOrderId(orderRes.id.toString());
            }
            await clearCart();
            await fetchOrders();
            navigate(ROUTES.orders);
            showToast(`Đặt hàng thành công! Mã đơn: #${orderRes.id}`);

        } catch (err: any) {
            console.error("Lỗi đặt hàng:", err);
            const errorMsg = err?.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại!";
            showToast(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-6 mb-8">
                <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#00FF41]">
                        XÁC NHẬN ĐƠN HÀNG LADUX
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                        Thanh toán đơn hàng
                    </h1>
                </div>
                <button
                    onClick={() => navigate(ROUTES.cart)}
                    className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00FF41] transition"
                >
                    ← Trở lại giỏ hàng
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Shipping Address, Coupons, Payment Method */}
                <div className="lg:col-span-7 space-y-8">
                    {/* 1. Shipping Address Selector */}
                    <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#00FF41]" />
                                <span>1. ĐỊA CHỈ NHẬN HÀNG</span>
                            </h2>
                            <button
                                onClick={() => setShowAddressModal(true)}
                                className="text-xs font-bold text-[#00FF41] hover:underline flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" /> Thêm địa chỉ mới
                            </button>
                        </div>

                        <div className="space-y-3">
                            {addresses.length === 0 ? (
                                <p className="text-xs text-neutral-400 py-2">
                                    Chưa có địa chỉ giao hàng nào. Vui lòng bấm "Thêm địa chỉ mới".
                                </p>
                            ) : (
                                addresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setSelectedAddrId(addr.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between gap-4 ${
                                            selectedAddrId === addr.id
                                                ? "border-[#00FF41] bg-[#00FF41]/10"
                                                : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                                        }`}
                                    >
                                        <div className="space-y-1 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-sm">
                                                    {addr.receiverName || (addr as any).fullName}
                                                </span>
                                                <span className="font-mono text-neutral-400">({addr.phone})</span>
                                                {addr.isDefault && (
                                                    <span className="bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41] text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-neutral-300">
                                                {addr.street || (addr as any).addressLine}
                                                {addr.ward ? `, ${addr.ward}` : ""}
                                                {addr.district ? `, ${addr.district}` : ""}
                                                {addr.city ? `, ${addr.city}` : ""}
                                            </p>
                                        </div>
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                                selectedAddrId === addr.id
                                                    ? "border-[#00FF41] bg-[#00FF41]"
                                                    : "border-neutral-700"
                                            }`}
                                        >
                                            {selectedAddrId === addr.id && (
                                                <div className="w-2 h-2 rounded-full bg-black" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Add Address Modal */}
                    {showAddressModal && (
                        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                                <h3 className="text-base font-bold text-white">Thêm Địa Chỉ Giao Hàng Mới</h3>
                                <div className="space-y-3 text-xs">
                                    <div>
                                        <label className="block text-neutral-400 mb-1">Họ và tên người nhận</label>
                                        <input
                                            type="text"
                                            value={newAddress.receiverName}
                                            onChange={(e) => setNewAddress({ ...newAddress, receiverName: e.target.value })}
                                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00FF41]"
                                            placeholder="Lê Huy"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-neutral-400 mb-1">Số điện thoại</label>
                                        <input
                                            type="text"
                                            value={newAddress.phone}
                                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#00FF41]"
                                            placeholder="0988 123 456"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-neutral-400 mb-1">Địa chỉ chi tiết (Số nhà, đường)</label>
                                        <input
                                            type="text"
                                            value={newAddress.street}
                                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00FF41]"
                                            placeholder="Số 88 Tôn Thất Thuyết"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-neutral-400 mb-1">Phường / Xã</label>
                                            <input
                                                type="text"
                                                value={newAddress.ward}
                                                onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                                                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00FF41]"
                                                placeholder="Mỹ Đình 2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-neutral-400 mb-1">Quận / Huyện</label>
                                            <input
                                                type="text"
                                                value={newAddress.district}
                                                onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                                                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00FF41]"
                                                placeholder="Nam Từ Liêm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-neutral-400 mb-1">Tỉnh / Thành phố</label>
                                            <input
                                                type="text"
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00FF41]"
                                                placeholder="Hà Nội"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowAddressModal(false)}
                                        className="flex-1 py-3 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!newAddress.receiverName || !newAddress.phone || !newAddress.street) {
                                                showToast("Vui lòng điền đầy đủ thông tin địa chỉ");
                                                return;
                                            }
                                            try {
                                                const created = await createAddress(newAddress);
                                                setSelectedAddrId(created.id);
                                                setShowAddressModal(false);
                                                showToast("Đã lưu địa chỉ giao hàng mới!");
                                            } catch (err) {
                                                showToast("Không thể tạo địa chỉ mới!");
                                            }
                                        }}
                                        className="flex-1 py-3 bg-[#00FF41] text-black rounded-xl text-xs font-extrabold hover:bg-[#00cc34]"
                                    >
                                        Lưu Địa Chỉ
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Coupon Code Input */}
                    <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-4">
                        <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#00FF41]" />
                            <span>2. MÃ GIẢM GIÁ / COUPON</span>
                        </h2>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={couponCodeInput}
                                onChange={(e) => setCouponCodeInput(e.target.value)}
                                placeholder="Nhập mã (Ví dụ: LADUX2M hoặc WELCOME10)"
                                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#00FF41]"
                            />
                            <button
                                onClick={handleApplyCoupon}
                                className="bg-[#00FF41] text-black px-6 py-3 rounded-xl text-xs font-extrabold uppercase hover:bg-[#00cc34] transition shrink-0"
                            >
                                Áp dụng
                            </button>
                        </div>

                        {couponErrMsg && (
                            <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {couponErrMsg}
                            </p>
                        )}

                        {appliedCouponItem && (
                            <div className="p-3 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                    <span className="font-mono font-bold text-[#00FF41]">
                                        {appliedCouponItem.code}
                                    </span>
                                    <p className="text-neutral-400 text-[11px]">{appliedCouponItem.description}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setAppliedCouponItem(null);
                                        setCouponCodeInput("");
                                        showToast("Đã hủy mã giảm giá.");
                                    }}
                                    className="text-neutral-500 hover:text-white"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 3. Payment Method Selection */}
                    <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-4">
                        <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#00FF41]" />
                            <span>3. PHƯƠNG THỨC THANH TOÁN</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* VNPay Option */}
                            <div
                                onClick={() => setPaymentProvider("VNPAY")}
                                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                    paymentProvider === "VNPAY"
                                        ? "border-[#00FF41] bg-[#00FF41]/10"
                                        : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-900/30 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-xs">
                                        VNPay
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs text-white block">Cổng VNPay</span>
                                        <span className="text-[10px] text-neutral-400">Thẻ ATM / QR Code / E-Wallet</span>
                                    </div>
                                </div>
                                <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        paymentProvider === "VNPAY" ? "border-[#00FF41] bg-[#00FF41]" : "border-neutral-700"
                                    }`}
                                >
                                    {paymentProvider === "VNPAY" && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                </div>
                            </div>

                            {/* COD Option */}
                            <div
                                onClick={() => setPaymentProvider("COD")}
                                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                    paymentProvider === "COD"
                                        ? "border-[#00FF41] bg-[#00FF41]/10"
                                        : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center font-bold text-[#00FF41] text-xs">
                                        COD
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs text-white block">Thanh toán khi nhận</span>
                                        <span className="text-[10px] text-neutral-400">Tiền mặt / Kiểm tra máy trước</span>
                                    </div>
                                </div>
                                <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        paymentProvider === "COD" ? "border-[#00FF41] bg-[#00FF41]" : "border-neutral-700"
                                    }`}
                                >
                                    {paymentProvider === "COD" && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary & Place Order Action */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-6 sticky top-24">
                        <h2 className="text-base font-black text-white uppercase tracking-wider pb-4 border-b border-neutral-900">
                            TỔNG QUAN ĐƠN HÀNG
                        </h2>

                        {/* Itemized List */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {cartItemsList.map((item) => {
                                if (!item.product) return null;
                                const mapped = (item.product as any).cpu !== undefined || (item.product as any).brand !== undefined
                                    ? mapProductResponseToLaptopProduct(item.product as any)
                                    : (item.product as any);
                                const price = mapped.discountPrice || mapped.price || 0;
                                const imageUrl = mapped.images?.[0] || "https://placehold.co/400x300/121214/666?text=No+Image";

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 text-xs border-b border-neutral-900/60 pb-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={imageUrl}
                                                alt={mapped.name}
                                                className="w-12 h-12 bg-neutral-900 rounded-lg object-contain p-1 border border-neutral-800 shrink-0"
                                            />
                                            <div>
                                                <p className="font-bold text-white line-clamp-1">{mapped.name}</p>
                                                <p className="text-[10px] font-mono text-neutral-500">
                                                    Số lượng: x{item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-mono font-bold text-white shrink-0">
                                            {formatVND(price * item.quantity)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Financial Summary */}
                        <div className="space-y-2.5 font-mono text-xs pt-2 border-t border-neutral-900">
                            <div className="flex justify-between text-neutral-400">
                                <span>Tạm tính (subTotal):</span>
                                <span className="text-white font-semibold">
                                    {formatVND(subTotal)}
                                </span>
                            </div>

                            <div className="flex justify-between text-neutral-400">
                                <span>Giảm giá (discountAmount):</span>
                                <span className="text-[#00FF41] font-semibold">
                                    -{formatVND(discountAmount)}
                                </span>
                            </div>

                            <div className="flex justify-between text-neutral-400">
                                <span>Phí vận chuyển (shippingFee):</span>
                                <span className="text-[#00FF41] font-semibold">MIỄN PHÍ</span>
                            </div>

                            <div className="pt-4 border-t border-neutral-900 flex justify-between items-baseline">
                                <span className="text-sm font-bold text-white uppercase">Tổng cộng (finalAmount):</span>
                                <span className="text-2xl font-black text-[#00FF41]">
                                    {formatVND(finalAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Place Order CTA */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting || cartItemsList.length === 0}
                            className="w-full bg-[#00FF41] text-black py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-[#00cc34] transition shadow-lg shadow-[#00FF41]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>{isSubmitting ? "ĐANG XỬ LÝ ĐƠN HÀNG..." : "ĐẶT HÀNG NGAY"}</span>
                        </button>

                        <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-neutral-500 font-mono">
                            <span className="flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5 text-[#00FF41]" /> Thanh toán SSL 256-bit
                            </span>
                            <span>•</span>
                            <span>Đổi trả 30 ngày</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
