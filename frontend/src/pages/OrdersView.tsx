import React, { useEffect, useMemo } from "react";
import { AlertCircle, Check, RefreshCw, FileText, ShoppingBag } from "lucide-react";
import { OrderItemRecord, OrderStatus, formatVND, ViewType, mapProductResponseToLaptopProduct } from "../types";
import { useOrderStore } from "../stores";

export interface OrdersViewProps {
    orders?: OrderItemRecord[];
    selectedOrderId?: string;
    setSelectedAddressOrderId?: (id: string) => void;
    setOrders?: React.Dispatch<React.SetStateAction<OrderItemRecord[]>>;
    setCurrentView: (view: ViewType) => void;
    showToast: (msg: string) => void;
}

export default function OrdersView({
    orders = [],
    selectedOrderId = "",
    setSelectedAddressOrderId = () => {},
    setCurrentView,
    showToast,
}: OrdersViewProps) {
    const { orders: storeOrders, fetchOrders, isLoading, retryPayment } = useOrderStore();

    useEffect(() => {
        fetchOrders();
    }, []);

    // Map Backend OrderResponse[] to UI OrderItemRecord[]
    const displayOrders: OrderItemRecord[] = useMemo(() => {
        if (storeOrders.length > 0) {
            return storeOrders.map((ord) => {
                const itemsMapped = (ord.orderItems || []).map((it) => {
                    const prod = it.product
                        ? mapProductResponseToLaptopProduct(it.product)
                        : {
                              id: it.id,
                              name: "Sản phẩm Laptop LADUX",
                              images: ["https://placehold.co/400x300/121214/666?text=Laptop"],
                              price: it.unitPrice,
                          };
                    return {
                        product: prod as any,
                        quantity: it.quantity,
                        selectedRam: (it.product as any)?.ram || "Tiêu chuẩn",
                        selectedStorage: (it.product as any)?.rom || "SSD",
                        selectedColorName: "Standard",
                        selectedColorHex: "#1D1D1F",
                        price: it.unitPrice,
                    };
                });

                return {
                    id: ord.id.toString(),
                    orderNumber: ord.trackingNumber || `LADUX-${ord.id}`,
                    date: ord.createdAt ? new Date(ord.createdAt).toLocaleString("vi-VN") : "Vừa xong",
                    status: ord.status,
                    paymentMethod: ord.paymentProvider || "COD",
                    trackingNumber: ord.trackingNumber || `LADUX-VN-${ord.id}`,
                    items: itemsMapped,
                    subTotal: ord.subTotal,
                    discountAmount: ord.discountAmount,
                    shippingFee: ord.shippingFee ?? 0,
                    finalAmount: ord.finalAmount,
                    shippingAddress: {
                        id: ord.shippingAddress?.id || 0,
                        fullName: ord.shippingAddress?.receiverName || "Khách hàng",
                        phone: ord.shippingAddress?.phone || "",
                        addressDetail: ord.shippingAddress?.street || "",
                        ward: ord.shippingAddress?.ward || "",
                        district: ord.shippingAddress?.district || "",
                        city: ord.shippingAddress?.city || "",
                        isDefault: false,
                    },
                };
            });
        }
        return orders;
    }, [storeOrders, orders]);

    const activeSelectedId = selectedOrderId || (displayOrders[0]?.id || "");
    const currentOrder = displayOrders.find((o) => o.id === activeSelectedId) || displayOrders[0];

    const statusSteps: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
    const currentStepIdx =
        currentOrder && currentOrder.status !== "CANCELLED"
            ? statusSteps.indexOf(currentOrder.status as any)
            : -1;

    return (
        <main className="container mx-auto px-6 py-12 max-w-5xl">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-6 mb-8">
                <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#00D492]">
                        LADUX CUSTOMER PORTAL
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                        QUẢN LÝ & THEO DÕI ĐƠN HÀNG
                    </h1>
                </div>
                <button
                    onClick={() => setCurrentView("account")}
                    className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00D492] transition"
                >
                    ← Về tài khoản
                </button>
            </div>

            {isLoading && displayOrders.length === 0 ? (
                <div className="text-center py-20 bg-neutral-950 rounded-2xl border border-neutral-900">
                    <div className="inline-block w-8 h-8 border-2 border-[#00D492] border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-neutral-400 text-xs font-mono">Đang tải lịch sử đơn hàng từ hệ thống...</p>
                </div>
            ) : displayOrders.length === 0 ? (
                <div className="text-center py-16 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-4">
                    <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto" />
                    <h2 className="text-lg font-bold text-white">Bạn chưa có đơn hàng nào!</h2>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto">
                        Hãy khám phá danh mục Laptop chính hãng tại Ladux và thực hiện đơn hàng đầu tiên của bạn.
                    </p>
                    <button
                        onClick={() => setCurrentView("store")}
                        className="bg-[#00D492] text-black px-6 py-3 rounded-xl text-xs font-extrabold uppercase hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20"
                    >
                        Khám phá sản phẩm ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Orders List Navigation */}
                    <div className="lg:col-span-4 space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                            Danh sách đơn hàng ({displayOrders.length})
                        </h2>
                        {displayOrders.map((ord) => (
                            <div
                                key={ord.id}
                                onClick={() => setSelectedAddressOrderId(ord.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                                    activeSelectedId === ord.id
                                        ? "border-[#00D492] bg-[#00D492]/10"
                                        : "border-neutral-900 bg-neutral-950 hover:border-neutral-800"
                                }`}
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-mono font-bold text-[#00D492]">{ord.orderNumber}</span>
                                    <span className="text-[10px] text-neutral-500">{ord.date}</span>
                                </div>
                                <div className="text-xs font-bold text-white line-clamp-1">
                                    {ord.items[0]?.product?.name || "Sản phẩm Laptop"}
                                    {ord.items.length > 1 && ` (+${ord.items.length - 1} khác)`}
                                </div>
                                <div className="flex items-center justify-between text-[11px] pt-1">
                                    <span className="font-mono text-neutral-300 font-semibold">
                                        {formatVND(ord.finalAmount)}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                            ord.status === "DELIVERED"
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                : ord.status === "SHIPPED"
                                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                : ord.status === "CANCELLED"
                                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                        }`}
                                    >
                                        {ord.status === "PENDING"
                                            ? "Chờ thanh toán"
                                            : ord.status === "CONFIRMED" || (ord.status as string) === "PAID" || (ord.status as string) === "PROCESSING"
                                            ? "Đã xác nhận"
                                            : ord.status === "SHIPPED"
                                            ? "Đang giao"
                                            : ord.status === "DELIVERED"
                                            ? "Đã giao hàng"
                                            : "Đã hủy"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Detail Content */}
                    <div className="lg:col-span-8">
                        {!currentOrder ? (
                            <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-2xl text-center text-neutral-500 text-xs">
                                Không tìm thấy thông tin đơn hàng.
                            </div>
                        ) : (
                            <div className="p-6 sm:p-8 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-8">
                                {/* Header Metadata */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-900">
                                    <div>
                                        <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                                            MÃ ĐƠN HÀNG CHI TIẾT
                                        </span>
                                        <h2 className="text-2xl font-black font-mono text-[#00D492]">
                                            #{currentOrder.orderNumber}
                                        </h2>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            Khởi tạo lúc: {currentOrder.date} · Cổng thanh toán:{" "}
                                            <span className="font-bold text-white">{currentOrder.paymentMethod}</span>
                                        </p>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                                            MÃ VẬN ĐƠN (TRACKING)
                                        </span>
                                        <span className="text-xs font-mono font-bold text-white bg-neutral-900 border border-neutral-800 px-3 py-1 rounded inline-block mt-1">
                                            {currentOrder.trackingNumber}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Status Stepper */}
                                {currentOrder.status === "CANCELLED" ? (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Đơn hàng này đã bị hủy theo yêu cầu.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                                            Trạng Thái Tiến Độ Đơn Hàng
                                        </h3>
                                        <div className="grid grid-cols-4 gap-2 relative pt-2">
                                            {[
                                                { code: "PENDING", label: "Chờ thanh toán" },
                                                { code: "CONFIRMED", label: "Đã xác nhận" },
                                                { code: "SHIPPED", label: "Đang giao" },
                                                { code: "DELIVERED", label: "Đã giao hàng" },
                                            ].map((st, i) => {
                                                const isDone = i <= currentStepIdx;
                                                const isCurrent = i === currentStepIdx;
                                                return (
                                                    <div key={st.code} className="flex flex-col items-center text-center space-y-2">
                                                        <div
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all ${
                                                                isDone
                                                                    ? "bg-[#00D492] text-black shadow-[0_0_15px_rgba(0,212,146,0.3)]"
                                                                    : "bg-neutral-900 border border-neutral-800 text-neutral-600"
                                                            }`}
                                                        >
                                                            {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : i + 1}
                                                        </div>
                                                        <span
                                                            className={`text-[10px] sm:text-xs font-semibold leading-tight ${
                                                                isCurrent
                                                                    ? "text-[#00D492] font-bold"
                                                                    : isDone
                                                                    ? "text-white"
                                                                    : "text-neutral-600"
                                                            }`}
                                                        >
                                                            {st.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                                        Sản phẩm trong đơn ({currentOrder.items.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {currentOrder.items.map((it, i) => (
                                            <div
                                                key={i}
                                                className="p-4 bg-neutral-900/60 border border-neutral-900 rounded-xl flex items-center justify-between gap-4 text-xs"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={it.product?.images?.[0] || "https://placehold.co/400x300/121214/666?text=Laptop"}
                                                        alt={it.product?.name || "Laptop"}
                                                        className="w-14 h-14 bg-neutral-950 rounded-lg object-contain p-1 border border-neutral-800 shrink-0"
                                                    />
                                                    <div>
                                                        <h4 className="font-bold text-white">{it.product?.name || "Sản phẩm Laptop"}</h4>
                                                        <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                                                            Sản phẩm chính hãng LADUX
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right font-mono">
                                                    <span className="font-bold text-white block">
                                                        {formatVND(it.price * it.quantity)}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-500">
                                                        {formatVND(it.price)} x {it.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping & Financial Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-900 text-xs">
                                    {/* Shipping Info */}
                                    <div className="p-4 bg-neutral-900/40 rounded-xl space-y-1.5">
                                        <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                                            NƠI NHẬN HÀNG
                                        </span>
                                        <p className="font-bold text-white">{currentOrder.shippingAddress.fullName}</p>
                                        <p className="font-mono text-neutral-400">{currentOrder.shippingAddress.phone}</p>
                                        <p className="text-neutral-300 leading-relaxed">
                                            {currentOrder.shippingAddress.addressDetail}
                                            {currentOrder.shippingAddress.ward ? `, ${currentOrder.shippingAddress.ward}` : ""}
                                            {currentOrder.shippingAddress.district ? `, ${currentOrder.shippingAddress.district}` : ""}
                                            {currentOrder.shippingAddress.city ? `, ${currentOrder.shippingAddress.city}` : ""}
                                        </p>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="p-4 bg-neutral-900/40 rounded-xl space-y-2 font-mono">
                                        <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                                            TỔNG KẾT THANH TOÁN
                                        </span>
                                        <div className="flex justify-between text-neutral-400">
                                            <span>Tạm tính:</span>
                                            <span className="text-white">{formatVND(currentOrder.subTotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-[#00D492]">
                                            <span>Giảm giá:</span>
                                            <span>-{formatVND(currentOrder.discountAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-400">
                                            <span>Phí vận chuyển:</span>
                                            <span className="text-[#00D492]">MIỄN PHÍ</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                                            <span>Tổng cộng:</span>
                                            <span className="text-[#00D492]">
                                                {formatVND(currentOrder.finalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4 pt-4 border-t border-neutral-900">
                                    {/* Retry Payment Button */}
                                    {currentOrder.status === "PENDING" && currentOrder.paymentMethod === "VNPAY" && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await retryPayment(Number(currentOrder.id));
                                                    if (res.paymentUrl) {
                                                        window.location.href = res.paymentUrl;
                                                    } else {
                                                        showToast("Khởi tạo thanh toán lại thất bại!");
                                                    }
                                                } catch (err: any) {
                                                    showToast("Lỗi khi kết nối đến VNPay.");
                                                }
                                            }}
                                            className="bg-[#00D492] text-black px-6 py-3 rounded-xl text-xs font-extrabold uppercase hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20 flex items-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>Thanh toán lại VNPay</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            showToast("Đang tải hóa đơn VAT điện tử (PDF)...");
                                        }}
                                        className="border border-neutral-800 hover:border-white text-neutral-300 px-6 py-3 rounded-xl text-xs font-semibold transition flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Tải Hóa Đơn VAT</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
