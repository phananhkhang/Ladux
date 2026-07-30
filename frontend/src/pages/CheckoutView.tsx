import React, { useState } from "react";
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
    CartItem,
    CouponItem,
    ShippingAddressRequest,
    PaymentProvider,
    OrderItemRecord,
    formatVND,
    ViewType,
} from "../types";

export interface CheckoutViewProps {
    cartItems: CartItem[];
    savedAddresses: ShippingAddressRequest[];
    setSavedAddresses: (addresses: ShippingAddressRequest[]) => void;
    selectedAddressId: number;
    setSelectedAddressId: (id: number) => void;
    appliedCoupon: CouponItem | null;
    setAppliedCoupon: (coupon: CouponItem | null) => void;
    paymentMethod: PaymentProvider;
    setPaymentMethod: (method: PaymentProvider) => void;
    orders: OrderItemRecord[];
    setOrders: (orders: OrderItemRecord[]) => void;
    setSelectedAddressOrderId: (id: string) => void;
    setCartItems: (items: CartItem[]) => void;
    setCurrentView: (view: ViewType) => void;
    showToast: (msg: string) => void;
    handleApplyCoupon: () => void;
    couponInput: string;
    setCouponInput: (val: string) => void;
    couponError: string;
}

export default function CheckoutView({
    cartItems,
    savedAddresses,
    setSavedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    appliedCoupon,
    setAppliedCoupon,
    paymentMethod,
    setPaymentMethod,
    orders,
    setOrders,
    setSelectedAddressOrderId,
    setCartItems,
    setCurrentView,
    showToast,
    handleApplyCoupon,
    couponInput,
    setCouponInput,
    couponError,
}: CheckoutViewProps) {
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState<Omit<ShippingAddressRequest, "id">>({
        fullName: "",
        phone: "",
        addressDetail: "",
        ward: "",
        district: "",
        city: "Hà Nội",
        isDefault: false,
    });

    const subTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const finalAmount = Math.max(0, subTotal - discountAmount);

    return (
        <main className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-6 mb-8">
                <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#00D492]">
                        XÁC NHẬN ĐƠN HÀNG LADUX
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                        THANH TOÁN AN TOÀN
                    </h1>
                </div>
                <button
                    onClick={() => setCurrentView("cart")}
                    className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00D492] transition"
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
                                <MapPin className="w-4 h-4 text-[#00D492]" />
                                <span>1. ĐỊA CHỈ NHẬN HÀNG</span>
                            </h2>
                            <button
                                onClick={() => setShowAddressModal(true)}
                                className="text-xs font-bold text-[#00D492] hover:underline flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" /> Thêm địa chỉ mới
                            </button>
                        </div>

                        <div className="space-y-3">
                            {savedAddresses.map((addr) => (
                                <div
                                    key={addr.id}
                                    onClick={() => setSelectedAddressId(addr.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between gap-4 ${
                                        selectedAddressId === addr.id
                                            ? "border-[#00D492] bg-[#00D492]/10"
                                            : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                                    }`}
                                >
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-sm">{addr.fullName}</span>
                                            <span className="font-mono text-neutral-400">({addr.phone})</span>
                                            {addr.isDefault && (
                                                <span className="bg-[#00D492]/20 border border-[#00D492]/40 text-[#00D492] text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-neutral-300">
                                            {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.city}
                                        </p>
                                    </div>
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                            selectedAddressId === addr.id
                                                ? "border-[#00D492] bg-[#00D492]"
                                                : "border-neutral-700"
                                        }`}
                                    >
                                        {selectedAddressId === addr.id && (
                                            <div className="w-2 h-2 rounded-full bg-black" />
                                        )}
                                    </div>
                                </div>
                            ))}
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
                                            value={newAddress.fullName}
                                            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00D492]"
                                            placeholder="Lê Huy"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-neutral-400 mb-1">Số điện thoại</label>
                                        <input
                                            type="text"
                                            value={newAddress.phone}
                                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#00D492]"
                                            placeholder="0988 123 456"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-neutral-400 mb-1">Địa chỉ chi tiết (Số nhà, đường)</label>
                                        <input
                                            type="text"
                                            value={newAddress.addressDetail}
                                            onChange={(e) => setNewAddress({ ...newAddress, addressDetail: e.target.value })}
                                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00D492]"
                                            placeholder="Số 88 Tôn Thất Thuyết"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-neutral-400 mb-1">Phường / Xã</label>
                                            <input
                                                type="text"
                                                value={newAddress.ward}
                                                onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                                                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00D492]"
                                                placeholder="Mỹ Đình 2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-neutral-400 mb-1">Quận / Huyện</label>
                                            <input
                                                type="text"
                                                value={newAddress.district}
                                                onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                                                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00D492]"
                                                placeholder="Nam Từ Liêm"
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
                                        onClick={() => {
                                            if (!newAddress.fullName || !newAddress.phone || !newAddress.addressDetail) {
                                                showToast("Vui lòng điền đầy đủ thông tin địa chỉ");
                                                return;
                                            }
                                            const created: ShippingAddressRequest = {
                                                id: Date.now(),
                                                ...newAddress,
                                            };
                                            setSavedAddresses([...savedAddresses, created]);
                                            setSelectedAddressId(created.id);
                                            setShowAddressModal(false);
                                            showToast("Đã thêm địa chỉ mới thành công!");
                                        }}
                                        className="flex-1 py-3 bg-[#00D492] text-black rounded-xl text-xs font-extrabold hover:bg-[#00bc82]"
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
                            <Zap className="w-4 h-4 text-[#00D492]" />
                            <span>2. MÃ GIẢM GIÁ / COUPON</span>
                        </h2>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                placeholder="Nhập mã (Gợi ý: LADUX2M hoặc WELCOME10)"
                                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]"
                            />
                            <button
                                onClick={handleApplyCoupon}
                                className="bg-[#00D492] text-black px-6 py-3 rounded-xl text-xs font-extrabold uppercase hover:bg-[#00bc82] transition shrink-0"
                            >
                                Áp dụng
                            </button>
                        </div>

                        {couponError && (
                            <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {couponError}
                            </p>
                        )}

                        {appliedCoupon && (
                            <div className="p-3 bg-[#00D492]/10 border border-[#00D492]/30 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                    <span className="font-mono font-bold text-[#00D492]">
                                        {appliedCoupon.code}
                                    </span>
                                    <p className="text-neutral-400 text-[11px]">{appliedCoupon.description}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setAppliedCoupon(null);
                                        setCouponInput("");
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
                            <Lock className="w-4 h-4 text-[#00D492]" />
                            <span>3. PHƯƠNG THỨC THANH TOÁN</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* VNPay Option */}
                            <div
                                onClick={() => setPaymentMethod("VNPAY")}
                                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                    paymentMethod === "VNPAY"
                                        ? "border-[#00D492] bg-[#00D492]/10"
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
                                        paymentMethod === "VNPAY" ? "border-[#00D492] bg-[#00D492]" : "border-neutral-700"
                                    }`}
                                >
                                    {paymentMethod === "VNPAY" && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                </div>
                            </div>

                            {/* COD Option */}
                            <div
                                onClick={() => setPaymentMethod("COD")}
                                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                    paymentMethod === "COD"
                                        ? "border-[#00D492] bg-[#00D492]/10"
                                        : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center font-bold text-[#00D492] text-xs">
                                        COD
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs text-white block">Thanh toán khi nhận</span>
                                        <span className="text-[10px] text-neutral-400">Tiền mặt / Kiểm tra máy trước</span>
                                    </div>
                                </div>
                                <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        paymentMethod === "COD" ? "border-[#00D492] bg-[#00D492]" : "border-neutral-700"
                                    }`}
                                >
                                    {paymentMethod === "COD" && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
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
                            {cartItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between gap-3 text-xs border-b border-neutral-900/60 pb-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="w-12 h-12 bg-neutral-900 rounded-lg object-contain p-1 border border-neutral-800 shrink-0"
                                        />
                                        <div>
                                            <p className="font-bold text-white line-clamp-1">{item.product.name}</p>
                                            <p className="text-[10px] font-mono text-neutral-500">
                                                {item.selectedRam} / {item.selectedStorage} x {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-mono font-bold text-white shrink-0">
                                        {formatVND(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
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
                                <span className="text-[#00D492] font-semibold">
                                    -{formatVND(discountAmount)}
                                </span>
                            </div>

                            <div className="flex justify-between text-neutral-400">
                                <span>Phí vận chuyển (shippingFee):</span>
                                <span className="text-[#00D492] font-semibold">MIỄN PHÍ</span>
                            </div>

                            <div className="pt-4 border-t border-neutral-900 flex justify-between items-baseline">
                                <span className="text-sm font-bold text-white uppercase">Tổng cộng (finalAmount):</span>
                                <span className="text-2xl font-black text-[#00D492]">
                                    {formatVND(finalAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Place Order CTA */}
                        <button
                            onClick={() => {
                                const selAddr = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

                                const newOrderRecord: OrderItemRecord = {
                                    id: `ord-${Date.now()}`,
                                    orderNumber: `LDX-${Math.floor(100000 + Math.random() * 900000)}`,
                                    date: "Vừa xong",
                                    items: [...cartItems],
                                    shippingAddress: selAddr,
                                    paymentMethod,
                                    subTotal,
                                    discountAmount,
                                    shippingFee: 0,
                                    finalAmount,
                                    status: paymentMethod === "VNPAY" ? "PENDING" : "CONFIRMED",
                                    trackingNumber: `LDX-EXPRESS-${Math.floor(10000000 + Math.random() * 90000000)}`,
                                };

                                setOrders([newOrderRecord, ...orders]);
                                setSelectedAddressOrderId(newOrderRecord.id);
                                setCartItems([]);
                                setCurrentView("account");
                                showToast(`Đặt hàng thành công! Mã đơn: ${newOrderRecord.orderNumber}`);
                            }}
                            className="w-full bg-[#00D492] text-black py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>ĐẶT HÀNG NGAY</span>
                        </button>

                        <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-neutral-500 font-mono">
                            <span className="flex items-center gap-1">
                                <Lock className="w-3 h-3 text-[#00D492]" /> Thanh toán SSL 256-bit
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
