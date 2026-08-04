import React, { useEffect, useMemo, useState, useRef } from "react";
import {
    AlertCircle,
    Check,
    RefreshCw,
    FileText,
    ShoppingBag,
    Clock,
    MapPin,
    CreditCard,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OrderItemRecord, OrderStatus, formatVND, mapProductResponseToLaptopProduct } from "../types";
import { useOrderStore } from "../stores";
import { ROUTES } from "../app/routePaths";

export interface OrdersViewProps {
    selectedOrderId?: string;
    setSelectedAddressOrderId?: (id: string) => void;
    setOrders?: React.Dispatch<React.SetStateAction<OrderItemRecord[]>>;
    showToast: (msg: string) => void;
}

const STATUS_STEPS = [
    { code: "PENDING",   label: "Chờ thanh toán" },
    { code: "CONFIRMED", label: "Đã xác nhận" },
    { code: "SHIPPED",   label: "Đang giao" },
    { code: "DELIVERED", label: "Đã giao hàng" },
] as const;

function getStepIndex(status: string): number {
    // PAID / PROCESSING / CONFIRMED all map to step 1
    if (status === "PAID" || status === "PROCESSING") return 1;
    return STATUS_STEPS.findIndex((s) => s.code === status);
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        PENDING:          { label: "Đã đặt hàng",  cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
        CONFIRMED:        { label: "Đã xác nhận",  cls: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
        PAID:             { label: "Đã xác nhận",  cls: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
        PROCESSING:       { label: "Đang xử lý",   cls: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
        SHIPPED:          { label: "Đang giao",     cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
        DELIVERED:        { label: "Đã giao hàng", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
        CANCELLED:        { label: "Đã hủy",        cls: "bg-red-500/20 text-red-400 border-red-500/30" },
        RETURN_REQUESTED: { label: "Yêu cầu hoàn", cls: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
        RETURNED:         { label: "Đã hoàn",       cls: "bg-orange-400/20 text-orange-300 border-orange-400/30" },
        REFUNDED:         { label: "Đã hoàn tiền",  cls: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
    };
    const cfg = map[status] ?? { label: status, cls: "bg-neutral-800 text-neutral-400 border-neutral-700" };
    return (
        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

function HistoryStatusIcon({ status }: { status: string }) {
    switch (status) {
        case "PENDING":   return <Clock className="w-3.5 h-3.5 text-amber-400" />;
        case "CONFIRMED":
        case "PAID":
        case "PROCESSING": return <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />;
        case "SHIPPED":   return <Truck className="w-3.5 h-3.5 text-blue-400" />;
        case "DELIVERED": return <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF41]" />;
        case "CANCELLED": return <XCircle className="w-3.5 h-3.5 text-red-400" />;
        case "RETURN_REQUESTED":
        case "RETURNED":
        case "REFUNDED":  return <RotateCcw className="w-3.5 h-3.5 text-orange-400" />;
        default:          return <Package className="w-3.5 h-3.5 text-neutral-400" />;
    }
}

export default function OrdersView({
    selectedOrderId = "",
    setSelectedAddressOrderId = () => {},
    showToast,
}: OrdersViewProps) {
    const navigate = useNavigate();
    const {
        orders: storeOrders,
        fetchOrders,
        fetchOrderHistories,
        orderHistories,
        isLoading,
        isLoadingHistories,
        retryPayment,
        error,
    } = useOrderStore();

    const [activeId, setActiveId] = useState<string>(selectedOrderId || "");
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // Initial load + polling every 30s
    useEffect(() => {
        const refresh = () => {
            fetchOrders();
            fetchOrderHistories();
            setLastRefresh(new Date());
        };

        refresh();
        intervalRef.current = setInterval(refresh, 30_000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchOrderHistories, fetchOrders]);

    // Map Backend OrderResponse[] → UI OrderItemRecord[]
    const displayOrders: OrderItemRecord[] = useMemo(() => {
        if (storeOrders.length > 0) {
            return storeOrders.map((ord) => {
                const itemsMapped = (ord.orderItems || []).flatMap((it) => {
                    if (!it.product) return [];
                    const actualPrice = Number(it.priceAtPurchase ?? 0);
                    const variant = it.product.variants?.find((item) => item.id === it.productVariantId);
                    const prod = mapProductResponseToLaptopProduct(it.product, it.productVariantId ?? undefined);
                    return [{
                        product: prod,
                        quantity: it.quantity,
                        selectedRam: variant?.ram || "",
                        selectedStorage: variant?.rom || "",
                        selectedColorName: variant?.color?.name || "",
                        selectedColorHex: variant?.color?.hexCode || "",
                        price: actualPrice,
                    }];
                });

                return {
                    id: ord.id.toString(),
                    orderNumber: String(ord.id),
                    date: ord.createdAt ? new Date(ord.createdAt).toLocaleString("vi-VN") : "Chưa cập nhật",
                    status: ord.status,
                    paymentMethod: ord.paymentProvider,
                    trackingNumber: ord.trackingNumber || "",
                    items: itemsMapped,
                    subTotal: Number(ord.subTotal) || 0,
                    discountAmount: Number(ord.discountAmount) || 0,
                    shippingFee: Number(ord.shippingFee) || 0,
                    finalAmount: Number(ord.finalAmount) || 0,
                    shippingAddress: {
                        id: ord.shippingAddress?.id || 0,
                        fullName: ord.shippingAddress?.receiverName || "",
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
        return [];
    }, [storeOrders]);

    // Sync active order when list loads
    useEffect(() => {
        if (displayOrders.length > 0 && !activeId) {
            setActiveId(displayOrders[0].id);
        }
    }, [activeId, displayOrders]);

    const currentOrder = displayOrders.find((o) => o.id === activeId) || displayOrders[0];

    const currentStepIdx =
        currentOrder && currentOrder.status !== "CANCELLED"
            ? getStepIndex(currentOrder.status)
            : -1;

    // Filter histories for current order
    const currentOrderHistories = useMemo(() => {
        if (!currentOrder) return [];
        return orderHistories.filter((h) => h.orderId === Number(currentOrder.id));
    }, [orderHistories, currentOrder]);

    const handleSelectOrder = (id: string) => {
        setActiveId(id);
        setSelectedAddressOrderId(id);
    };

    const manualRefresh = () => {
        fetchOrders();
        fetchOrderHistories();
        setLastRefresh(new Date());
    };

    return (
        <main className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
            {/* ── Page Header ── */}
            <div className="flex items-start justify-between border-b border-neutral-900 pb-6 mb-8 gap-4">
                <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FF41]">
                        LADUX CUSTOMER PORTAL
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                        QUẢN LÝ &amp; THEO DÕI ĐƠN HÀNG
                    </h1>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {/* Live refresh indicator */}
                    <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                        <span>Cập nhật lúc {lastRefresh.toLocaleTimeString("vi-VN")}</span>
                    </div>
                    <button
                        onClick={manualRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00FF41] border border-neutral-800 hover:border-[#00FF41]/40 px-3 py-2 rounded-lg transition disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">Làm mới</span>
                    </button>
                    <button
                        onClick={() => navigate(ROUTES.account)}
                        className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00FF41] transition"
                    >
                        ← Về tài khoản
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-xl text-xs font-mono text-center mb-6">
                    [Lỗi hệ thống]: {error}
                </div>
            )}

            {isLoading && displayOrders.length === 0 ? (
                <div className="text-center py-24 bg-neutral-950 rounded-2xl border border-neutral-900">
                    <div className="inline-block w-8 h-8 border-2 border-[#00FF41] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-neutral-400 text-xs font-mono">Đang tải lịch sử đơn hàng từ hệ thống...</p>
                </div>
            ) : displayOrders.length === 0 ? (
                <div className="text-center py-20 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-4">
                    <ShoppingBag className="w-14 h-14 text-neutral-700 mx-auto" />
                    <h2 className="text-lg font-bold text-white">Bạn chưa có đơn hàng nào!</h2>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                        Hãy khám phá danh mục Laptop chính hãng tại Ladux và thực hiện đơn hàng đầu tiên.
                    </p>
                    <button
                        onClick={() => navigate(ROUTES.products)}
                        className="inline-flex bg-[#00FF41] text-black px-6 py-3 rounded-xl text-xs font-extrabold uppercase hover:bg-[#00cc34] transition shadow-lg shadow-[#00FF41]/20"
                    >
                        Khám phá sản phẩm ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* ── LEFT: Order List ── */}
                    <div className="lg:col-span-4 space-y-2">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-3">
                            Danh sách đơn hàng ({displayOrders.length})
                        </h2>
                        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 scrollbar-thin">
                            {displayOrders.map((ord) => (
                                <button
                                    key={ord.id}
                                    onClick={() => handleSelectOrder(ord.id)}
                                    className={`w-full text-left p-4 rounded-xl border cursor-pointer transition-all duration-200 space-y-2.5 ${
                                        activeId === ord.id
                                            ? "border-[#00FF41] bg-[#00FF41]/[0.07] shadow-[0_0_20px_rgba(0,255,65,0.08)]"
                                            : "border-neutral-900 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900/50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-mono font-bold text-[#00FF41] tracking-wide">
                                            #{ord.orderNumber}
                                        </span>
                                        <span className="text-[10px] text-neutral-600 font-mono">{ord.date.split(",")[0]}</span>
                                    </div>
                                    <p className="text-xs font-semibold text-white line-clamp-1 leading-snug">
                                        {ord.items[0]?.product?.name || "Không còn thông tin sản phẩm"}
                                        {ord.items.length > 1 && (
                                            <span className="text-neutral-500 font-normal"> (+{ord.items.length - 1} khác)</span>
                                        )}
                                    </p>
                                    <div className="flex items-center justify-between pt-0.5">
                                        <span className="font-mono text-[12px] text-neutral-200 font-bold">
                                            {formatVND(ord.finalAmount)}
                                        </span>
                                        <StatusBadge status={ord.status} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: Order Detail ── */}
                    <div className="lg:col-span-8">
                        {!currentOrder ? (
                            <div className="p-10 bg-neutral-950 border border-neutral-900 rounded-2xl text-center text-neutral-500 text-xs">
                                Chọn một đơn hàng bên trái để xem chi tiết.
                            </div>
                        ) : (
                            <div className="bg-neutral-950 rounded-2xl border border-neutral-900 overflow-hidden">
                                {/* ── Section 1: Header metadata ── */}
                                <div className="p-6 sm:p-8 border-b border-neutral-900">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                                        <div>
                                            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500">
                                                MÃ ĐƠN HÀNG CHI TIẾT
                                            </span>
                                            <h2 className="text-2xl sm:text-3xl font-black font-mono text-[#00FF41] mt-0.5 tracking-tight">
                                                #{currentOrder.orderNumber}
                                            </h2>
                                            <p className="text-[11px] text-neutral-500 mt-1.5 font-mono">
                                                Khởi tạo lúc{" "}
                                                <span className="text-neutral-300">{currentOrder.date}</span>
                                                {" · "}Cổng thanh toán:{" "}
                                                <span className="font-bold text-white">{currentOrder.paymentMethod || "Chưa cập nhật"}</span>
                                            </p>
                                        </div>
                                        <div className="sm:text-right shrink-0">
                                            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 block mb-1.5">
                                                MÃ VẬN ĐƠN (TRACKING)
                                            </span>
                                            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg">
                                                <Truck className="w-3.5 h-3.5 text-[#00FF41]" />
                                                {currentOrder.trackingNumber || "Chưa có mã vận đơn"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Section 2: Status Stepper ── */}
                                <div className="px-6 sm:px-8 py-6 border-b border-neutral-900">
                                    {currentOrder.status === "CANCELLED" ? (
                                        <div className="p-4 bg-red-500/[0.08] border border-red-500/25 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2.5">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            Đơn hàng này đã bị hủy theo yêu cầu.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                                                Trạng thái tiến độ đơn hàng
                                            </h3>

                                            {/* Connected stepper */}
                                            <div className="relative flex items-start">
                                                {STATUS_STEPS.map((step, i) => {
                                                    const isDone = i <= currentStepIdx;
                                                    const isCurrent = i === currentStepIdx;
                                                    const isLast = i === STATUS_STEPS.length - 1;
                                                    return (
                                                        <React.Fragment key={step.code}>
                                                            {/* Step node */}
                                                            <div className="flex flex-col items-center gap-2 z-10">
                                                                <div
                                                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all duration-500 ${
                                                                        isDone
                                                                            ? "bg-[#00FF41] text-black shadow-[0_0_20px_rgba(0,255,65,0.35)]"
                                                                            : "bg-neutral-900 border-2 border-neutral-800 text-neutral-600"
                                                                    }`}
                                                                >
                                                                    {isDone ? (
                                                                        <Check className="w-5 h-5 stroke-[3]" />
                                                                    ) : (
                                                                        <span>{i + 1}</span>
                                                                    )}
                                                                </div>
                                                                <span
                                                                    className={`text-[10px] sm:text-[11px] font-semibold text-center leading-tight max-w-[70px] ${
                                                                        isCurrent
                                                                            ? "text-[#00FF41] font-bold"
                                                                            : isDone
                                                                            ? "text-white"
                                                                            : "text-neutral-600"
                                                                    }`}
                                                                >
                                                                    {step.label}
                                                                </span>
                                                            </div>

                                                            {/* Connector line between steps */}
                                                            {!isLast && (
                                                                <div className="flex-1 relative top-5 mx-1">
                                                                    <div className="h-0.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all duration-700 ${
                                                                                i < currentStepIdx
                                                                                    ? "w-full bg-[#00FF41]"
                                                                                    : "w-0 bg-[#00FF41]"
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ── Section 3: Products ── */}
                                <div className="px-6 sm:px-8 py-6 border-b border-neutral-900">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-4">
                                        Sản phẩm trong đơn ({currentOrder.items.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {currentOrder.items.map((it, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between gap-4 p-4 bg-neutral-900/50 border border-neutral-900 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {it.product.images?.[0] ? (
                                                        <img
                                                            src={it.product.images[0]}
                                                            alt={it.product.name}
                                                            className="w-16 h-16 shrink-0 bg-neutral-950 rounded-lg object-contain p-1.5 border border-neutral-800"
                                                        />
                                                    ) : (
                                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-[9px] text-neutral-500">
                                                            Chưa có ảnh
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                                                            {it.product.name}
                                                        </h4>
                                                        {/* Specs line */}
                                                        {(it.selectedRam || it.selectedStorage || it.selectedColorName) && (
                                                            <p className="text-[10px] font-mono text-neutral-500 mt-1 truncate">
                                                                {[
                                                                    it.selectedRam,
                                                                    it.selectedStorage,
                                                                    it.selectedColorName ? `Màu: ${it.selectedColorName}` : null,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(" · ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right font-mono shrink-0">
                                                    <span className="text-xs font-bold text-white block">
                                                        {formatVND(it.price * it.quantity)}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-600">
                                                        {formatVND(it.price)} × {it.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Section 4: Shipping + Payment Summary ── */}
                                <div className="px-6 sm:px-8 py-6 border-b border-neutral-900 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Shipping Info */}
                                    <div className="bg-neutral-900/40 rounded-xl p-5 space-y-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin className="w-3.5 h-3.5 text-[#00FF41]" />
                                            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500">
                                                Nơi nhận hàng
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-white">
                                            {currentOrder.shippingAddress.fullName}
                                        </p>
                                        <p className="text-[11px] font-mono text-neutral-400">
                                            {currentOrder.shippingAddress.phone}
                                        </p>
                                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                                            {[
                                                currentOrder.shippingAddress.addressDetail,
                                                currentOrder.shippingAddress.ward,
                                                currentOrder.shippingAddress.district,
                                                currentOrder.shippingAddress.city,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </p>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="bg-neutral-900/40 rounded-xl p-5 space-y-2.5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CreditCard className="w-3.5 h-3.5 text-[#00FF41]" />
                                            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500">
                                                Tổng kết thanh toán
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs font-mono text-neutral-400">
                                            <span>Tạm tính:</span>
                                            <span className="text-white">{formatVND(currentOrder.subTotal)}</span>
                                        </div>
                                        {currentOrder.discountAmount > 0 && (
                                            <div className="flex justify-between text-xs font-mono text-[#00FF41]">
                                                <span>Giảm giá:</span>
                                                <span>-{formatVND(currentOrder.discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-xs font-mono text-neutral-400">
                                            <span>Phí vận chuyển:</span>
                                            {currentOrder.shippingFee > 0 ? (
                                                <span className="text-white">{formatVND(currentOrder.shippingFee)}</span>
                                            ) : (
                                                <span className="text-[#00FF41] font-bold">MIỄN PHÍ</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-white pt-2.5 border-t border-neutral-800 mt-1">
                                            <span>Tổng cộng:</span>
                                            <span className="text-[#00FF41] text-base">{formatVND(currentOrder.finalAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Section 5: Order History Timeline ── */}
                                <div className="px-6 sm:px-8 py-6 border-b border-neutral-900">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-4">
                                        Lịch sử cập nhật đơn hàng
                                    </h3>

                                    {isLoadingHistories ? (
                                        <div className="flex items-center gap-2 text-xs text-neutral-500 py-2">
                                            <div className="w-3.5 h-3.5 border border-[#00FF41] border-t-transparent rounded-full animate-spin" />
                                            Đang tải lịch sử...
                                        </div>
                                    ) : currentOrderHistories.length === 0 ? (
                                        <p className="text-[11px] text-neutral-600 font-mono py-2">
                                            Chưa có bản ghi lịch sử cho đơn hàng này.
                                        </p>
                                    ) : (
                                        <div className="relative pl-5 space-y-0">
                                            {/* Vertical line */}
                                            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-neutral-800" />

                                            {currentOrderHistories.map((h, i) => (
                                                <div key={h.id} className="relative flex gap-4 pb-5 last:pb-0">
                                                    {/* Dot */}
                                                    <div className="absolute -left-[13px] top-0.5 w-4 h-4 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                                                        <HistoryStatusIcon status={h.status} />
                                                    </div>

                                                    <div className="flex-1 min-w-0 pl-2">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <StatusBadge status={h.status} />
                                                            <span className="text-[10px] font-mono text-neutral-600">
                                                                {h.createdAt
                                                                    ? new Date(h.createdAt).toLocaleString("vi-VN")
                                                                    : ""}
                                                            </span>
                                                        </div>
                                                        {h.description && (
                                                            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                                                                {h.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ── Section 6: Action Buttons ── */}
                                <div className="px-6 sm:px-8 py-5 flex flex-wrap gap-3">
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
                                                } catch {
                                                    showToast("Lỗi khi kết nối đến VNPay.");
                                                }
                                            }}
                                            className="flex items-center gap-2 bg-[#00FF41] text-black px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase hover:bg-[#00cc34] transition shadow-lg shadow-[#00FF41]/20"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Thanh toán lại VNPay
                                        </button>
                                    )}
                                    <button
                                        onClick={() => showToast("Đang tải hóa đơn VAT điện tử (PDF)...")}
                                        className="flex items-center gap-2 border border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        Tải Hóa Đơn VAT
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
