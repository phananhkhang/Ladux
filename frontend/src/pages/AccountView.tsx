import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Award,
    ChevronRight,
    LogOut,
    Plus,
    Building2,
    Home,
    Check,
    Pencil,
    X,
    Trash2,
    Loader2,
    MapPin,
    Phone,
    Mail,
    Lock,
} from "lucide-react";
import { ShippingAddressRequest, OrderItemRecord, getAvatarUrl, mapProductResponseToLaptopProduct } from "../types";
import { useAddressStore, useAuthStore, useOrderStore } from "../stores";
import { customerService, userService } from "../services";
import { ROUTES } from "../app/routePaths";

export interface AccountViewProps {
    currentView: "account" | "addresses";
    userAvatar: string;
    setUserAvatar: (avatar: string) => void;
    userFullName?: string;
    wishlistCount: number;
    handleLogout: () => void;
    showToast: (msg: string) => void;
}

export default function AccountView({
    currentView,
    userAvatar,
    setUserAvatar,
    userFullName = "Thành viên LADUX",
    wishlistCount,
    handleLogout,
    showToast,
}: AccountViewProps) {
    const navigate = useNavigate();
    const addressStore = useAddressStore();
    const authStore = useAuthStore();
    const { orders: storeOrders, fetchOrders } = useOrderStore();
    const resolvedAvatar = getAvatarUrl(userAvatar || authStore.user?.avatar);

    useEffect(() => {
        void Promise.allSettled([fetchOrders(), addressStore.fetchAddresses()]);
    }, [addressStore.fetchAddresses, fetchOrders]);

    // Map Backend OrderResponse[] → UI OrderItemRecord[]
    const displayOrders: OrderItemRecord[] = useMemo(() => {
        if (storeOrders && storeOrders.length > 0) {
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

    const totalOrderCount = displayOrders.length;

    const realMemberPoints = Number(authStore.user?.loyaltyPoints || 0);
    const realTotalSpent = Number(authStore.user?.totalSpent || 0);
    const memberTierInfo = {
        rankName: `${authStore.user?.level || "BROWSER"} MEMBER`,
        subtext: `Tổng chi tiêu tích lũy: ${realTotalSpent.toLocaleString("vi-VN")} ₫`,
    };

    // Lấy tối đa 3 đơn hàng gần đây nhất
    const recent3Orders = useMemo(() => {
        return displayOrders.slice(0, 3);
    }, [displayOrders]);

    // Map store addresses to ShippingAddressRequest
    const addressesList: ShippingAddressRequest[] = addressStore.addresses.map((a) => ({
            id: a.id,
            fullName: a.receiverName,
            phone: a.phone,
            addressDetail: a.street,
            ward: a.ward || "",
            district: a.district || "",
            city: a.city,
            isDefault: a.isDefault,
        }));

    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [showAddrFormModal, setShowAddrFormModal] = useState(false);
    const [editingAddrId, setEditingAddrId] = useState<number | null>(null);
    const [addrSaving, setAddrSaving] = useState(false);

    const [activeTab, setActiveTab] = useState<"overview" | "security">("overview");
    const [activeProfileModal, setActiveProfileModal] = useState<"name" | "phone" | "email" | "password" | null>(null);
    const [profileSaving, setProfileSaving] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [phoneInput, setPhoneInput] = useState("");
    const [phoneOtpInput, setPhoneOtpInput] = useState("");
    const [phoneVerificationId, setPhoneVerificationId] = useState<string | null>(null);
    const [phoneMasked, setPhoneMasked] = useState("");
    const [emailStep, setEmailStep] = useState<"INPUT" | "OTP">("INPUT");
    const [newEmail, setNewEmail] = useState("");
    const [emailOtp, setEmailOtp] = useState("");
    const [emailVerificationId, setEmailVerificationId] = useState<string | null>(null);
    const [maskedEmail, setMaskedEmail] = useState("");
    const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
    const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
    const [pwdStep, setPwdStep] = useState<1 | 2>(1);
    const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
    const [verifyTarget, setVerifyTarget] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpInput, setOtpInput] = useState("");
    const [passwordVerificationId, setPasswordVerificationId] = useState<string | null>(null);
    const [passwordMaskedTarget, setPasswordMaskedTarget] = useState("");
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [addrForm, setAddrForm] = useState<Omit<ShippingAddressRequest, "id">>({
        fullName: "",
        phone: "",
        addressDetail: "",
        ward: "",
        district: "",
        city: "",
        isDefault: false,
    });

    const getErrorMessage = (error: any, fallback: string) =>
        error?.response?.data?.message || error?.message || fallback;

    const resetEmailVerification = () => {
        setEmailStep("INPUT");
        setNewEmail("");
        setEmailOtp("");
        setEmailVerificationId(null);
        setMaskedEmail("");
    };

    const handleSendEmailOtp = async () => {
        const normalizedEmail = newEmail.trim().toLowerCase();
        if (!normalizedEmail) {
            showToast("Vui lòng nhập email");
            return;
        }

        setSendingEmailOtp(true);
        try {
            const response = await customerService.sendEmailOtp(normalizedEmail);
            setEmailVerificationId(response.verificationId);
            setMaskedEmail(response.maskedEmail);
            setEmailOtp("");
            setEmailStep("OTP");
            showToast(`Mã xác thực đã được gửi tới ${response.maskedEmail}`);
        } catch (error: any) {
            showToast(getErrorMessage(error, "Không thể gửi mã xác thực email"));
        } finally {
            setSendingEmailOtp(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        if (!emailVerificationId) {
            showToast("Không tìm thấy phiên xác thực");
            return;
        }
        if (!/^\d{6}$/.test(emailOtp)) {
            showToast("Mã xác thực phải gồm đúng 6 chữ số");
            return;
        }

        setVerifyingEmailOtp(true);
        try {
            await customerService.verifyEmailOtp({
                verificationId: emailVerificationId,
                otp: emailOtp,
            });
            await authStore.fetchCurrentUser();
            resetEmailVerification();
            setActiveProfileModal(null);
            showToast("Email đã được xác minh và cập nhật");
        } catch (error: any) {
            showToast(getErrorMessage(error, "Mã xác thực không chính xác"));
        } finally {
            setVerifyingEmailOtp(false);
        }
    };

    const handleSendPasswordOtp = async () => {
        if (authMethod === "phone" && !authStore.user?.phone) {
            showToast("Tài khoản chưa có số điện thoại. Vui lòng thêm số điện thoại trước!");
            return;
        }
        if (authMethod === "email" && !authStore.user?.email) {
            showToast("Tài khoản chưa có email. Vui lòng thêm và xác minh email trước!");
            return;
        }

        setOtpSending(true);
        try {
            const response = authMethod === "phone"
                ? await userService.sendPasswordPhoneOtp()
                : await userService.sendPasswordEmailOtp();

            setPasswordVerificationId(response.verificationId);
            setPasswordMaskedTarget(
                "maskedPhone" in response ? response.maskedPhone : response.maskedEmail,
            );
            setOtpSent(true);
            setOtpVerified(false);
            setOtpInput("");
            showToast(
                authMethod === "phone"
                    ? "Mã xác thực số điện thoại đã được gửi"
                    : "Mã xác thực đã được gửi vào email",
            );
        } catch (error: any) {
            showToast(getErrorMessage(error, "Không thể gửi mã xác thực"));
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyPasswordOtp = async () => {
        if (!passwordVerificationId) {
            showToast("Không tìm thấy phiên xác thực");
            return;
        }
        if (!/^\d{6}$/.test(otpInput)) {
            showToast("Mã xác thực phải gồm đúng 6 chữ số");
            return;
        }

        const request = {
            verificationId: passwordVerificationId,
            otp: otpInput,
        };

        setOtpVerifying(true);
        try {
            if (authMethod === "phone") {
                await userService.verifyPasswordPhoneOtp(request);
            } else {
                await userService.verifyPasswordEmailOtp(request);
            }
            setOtpVerified(true);
            setPwdStep(2);
            showToast("Xác minh thành công. Bạn có thể đổi mật khẩu");
        } catch (error: any) {
            setOtpVerified(false);
            showToast(getErrorMessage(error, "Mã xác thực không chính xác"));
        } finally {
            setOtpVerifying(false);
        }
    };

    const handleChangePassword = async () => {
        if (!otpVerified) {
            showToast("Vui lòng xác minh OTP trước");
            setPwdStep(1);
            return;
        }
        if (!passwordVerificationId) {
            showToast("Phiên xác thực không hợp lệ");
            setPwdStep(1);
            return;
        }
        if (!passwordForm.currentPassword) {
            showToast("Vui lòng nhập mật khẩu hiện tại!");
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            showToast("Mật khẩu mới phải có tối thiểu 8 ký tự!");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        setChangingPassword(true);
        try {
            await authStore.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
                verificationId: passwordVerificationId,
            });
            showToast("Đổi mật khẩu thành công. Vui lòng đăng nhập lại");
            setActiveProfileModal(null);
            handleLogout();
        } catch (error: any) {
            showToast(getErrorMessage(error, "Không thể đổi mật khẩu"));
        } finally {
            setChangingPassword(false);
        }
    };

    const openAddAddr = () => {
        setEditingAddrId(null);
        setAddrForm({
            fullName: authStore.user?.fullName || "",
            phone: authStore.user?.phone || "",
            addressDetail: "",
            ward: "",
            district: "",
            city: "Hà Nội",
            isDefault: addressesList.length === 0,
        });
        setShowAddrFormModal(true);
    };

    const openEditAddr = (addr: ShippingAddressRequest) => {
        setEditingAddrId(addr.id);
        setAddrForm({
            fullName: addr.fullName,
            phone: addr.phone,
            addressDetail: addr.addressDetail,
            ward: addr.ward,
            district: addr.district,
            city: addr.city,
            isDefault: addr.isDefault,
        });
        setShowAddrFormModal(true);
    };

    const setDefaultAddr = async (id: number) => {
        try {
            await addressStore.setDefaultAddress(id);
            showToast("Đã thiết lập địa chỉ mặc định mới!");
        } catch {
            showToast("Lỗi khi thiết lập địa chỉ mặc định.");
        }
    };

    const deleteAddr = async (id: number) => {
        try {
            await addressStore.deleteAddress(id);
            setDeleteConfirmId(null);
            showToast("Đã xóa địa chỉ thành công!");
        } catch {
            showToast("Lỗi khi xóa địa chỉ.");
        }
    };

    const saveAddrForm = async () => {
        if (!addrForm.fullName.trim() || !addrForm.phone.trim() || !addrForm.addressDetail.trim()
            || !addrForm.ward.trim() || !addrForm.district.trim() || !addrForm.city.trim()) {
            showToast("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }

        const cleanPhone = addrForm.phone.trim().replace(/[\s\-\.]/g, "");
        const phoneRegex = /^(0|\+84)[35789][0-9]{8}$/;
        if (!phoneRegex.test(cleanPhone)) {
            showToast("Số điện thoại không hợp lệ! Vui lòng nhập SĐT Việt Nam (VD: 0988123456).");
            return;
        }

        setAddrSaving(true);
        try {
            const reqData = {
                receiverName: addrForm.fullName.trim(),
                phone: cleanPhone,
                street: addrForm.addressDetail.trim(),
                ward: addrForm.ward.trim(),
                district: addrForm.district.trim(),
                city: addrForm.city.trim(),
                isDefault: addrForm.isDefault,
            };

            if (editingAddrId !== null) {
                await addressStore.updateAddress(editingAddrId, reqData);
                showToast("Cập nhật địa chỉ thành công!");
            } else {
                await addressStore.createAddress(reqData);
                showToast("Thêm địa chỉ giao hàng thành công!");
            }
            setShowAddrFormModal(false);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err?.message || "Lưu địa chỉ thất bại!";
            showToast(errorMsg);
        } finally {
            setAddrSaving(false);
        }
    };

    const renderModalContent = () => (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => {
                    if (!addrSaving) setShowAddrFormModal(false);
                }}
            />

            <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0f10] shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00FF41]">
                            {editingAddrId !== null ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                        </p>
                        <h2 className="mt-0.5 text-lg font-black text-white tracking-tight">
                            {editingAddrId !== null ? "Cập nhật thông tin địa chỉ" : "Địa chỉ giao hàng mới"}
                        </h2>
                    </div>
                    <button
                        onClick={() => {
                            if (!addrSaving) setShowAddrFormModal(false);
                        }}
                        className="rounded-xl border border-white/10 p-2.5 text-neutral-400 hover:text-white hover:border-white/25 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                            Họ và tên người nhận <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={addrForm.fullName}
                            onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                            placeholder="Nguyễn Văn A"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00FF41]/60 focus:ring-1 focus:ring-[#00FF41]/20 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                            Số điện thoại nhận hàng <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="tel"
                            value={addrForm.phone}
                            onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                            placeholder="0988 123 456"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#00FF41]/60 focus:ring-1 focus:ring-[#00FF41]/20 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                            Địa chỉ nhà / Tên đường <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={addrForm.addressDetail}
                            onChange={(e) => setAddrForm({ ...addrForm, addressDetail: e.target.value })}
                            placeholder="Số 88 Tôn Thất Thuyết"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00FF41]/60 focus:ring-1 focus:ring-[#00FF41]/20 transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                                Phường / Xã <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={addrForm.ward}
                                onChange={(e) => setAddrForm({ ...addrForm, ward: e.target.value })}
                                placeholder="Phường Mỹ Đình 2"
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00FF41]/60 focus:ring-1 focus:ring-[#00FF41]/20 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                                Quận / Huyện <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={addrForm.district}
                                onChange={(e) => setAddrForm({ ...addrForm, district: e.target.value })}
                                placeholder="Quận Nam Từ Liêm"
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00FF41]/60 focus:ring-1 focus:ring-[#00FF41]/20 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                            Tỉnh / Thành phố <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={addrForm.city}
                            onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                            placeholder="Nhập tỉnh / thành phố"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00FF41]/60 focus:ring-1 focus:ring-[#00FF41]/20 transition"
                        />
                    </div>

                    <div
                        onClick={() => setAddrForm({ ...addrForm, isDefault: !addrForm.isDefault })}
                        className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                            addrForm.isDefault
                                ? "border-[#00FF41]/50 bg-[#00FF41]/[0.07]"
                                : "border-white/10 bg-white/[0.03] hover:border-white/20"
                        }`}
                    >
                        <div
                            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                                addrForm.isDefault ? "bg-[#00FF41]" : "bg-neutral-800"
                            }`}
                        >
                            <div
                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                    addrForm.isDefault ? "translate-x-5" : "translate-x-0.5"
                                }`}
                            />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Đặt làm địa chỉ giao hàng mặc định</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                                Địa chỉ này sẽ được tự động chọn khi thanh toán
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t border-white/[0.08] px-6 py-5">
                    <button
                        onClick={() => {
                            if (!addrSaving) setShowAddrFormModal(false);
                        }}
                        disabled={addrSaving}
                        className="flex-1 rounded-xl border border-white/10 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400 transition hover:border-white/25 hover:text-white disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={saveAddrForm}
                        disabled={addrSaving}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#00FF41] py-3.5 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-[#00cc34] disabled:opacity-70 shadow-lg shadow-[#00FF41]/20"
                    >
                        {addrSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Lưu địa chỉ</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    if (currentView === "addresses") {
        return (
            <main className="container mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:py-16">
                <div className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                            <button onClick={() => navigate(ROUTES.account)} className="hover:text-[#00FF41] transition-colors">
                                Tài khoản
                            </button>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-[#00FF41]">Địa chỉ giao hàng</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
                            Sổ địa chỉ
                        </h1>
                        <p className="mt-2 text-xs text-neutral-500 font-mono">
                            Địa chỉ giao hàng của bạn ({addressesList.length} địa chỉ đã lưu)
                        </p>
                    </div>
                    <button
                        onClick={openAddAddr}
                        className="flex items-center gap-2 rounded-xl bg-[#00FF41] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-[#00cc34] hover:scale-[1.02] active:scale-100 shadow-lg shadow-[#00FF41]/20 shrink-0"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        Thêm địa chỉ mới
                    </button>
                </div>

                {addressesList.length === 0 ? (
                    <div className="py-24 flex flex-col items-center text-center space-y-7 max-w-sm mx-auto">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-neutral-950 border border-neutral-900 flex items-center justify-center">
                                <Home className="w-12 h-12 text-neutral-700 stroke-[1.3]" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-neutral-950 border border-neutral-900 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-[#00FF41]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white">Chưa có địa chỉ nào</h2>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Bạn chưa có địa chỉ giao hàng nào được lưu. Thêm địa chỉ đầu tiên để thanh toán nhanh hơn.
                            </p>
                        </div>
                        <button
                            onClick={openAddAddr}
                            className="flex items-center gap-2 rounded-xl bg-[#00FF41] px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black hover:bg-[#00cc34] transition shadow-lg shadow-[#00FF41]/20"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm địa chỉ đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-1">
                        {addressesList.map((addr) => (
                            <div
                                key={addr.id}
                                className={`group relative rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                                    addr.isDefault
                                        ? "border-[#00FF41]/50 bg-[#00FF41]/[0.05] shadow-[0_0_30px_rgba(0,255,65,0.07)]"
                                        : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.15]"
                                }`}
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div
                                            className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border ${
                                                addr.isDefault
                                                    ? "bg-[#00FF41]/15 border-[#00FF41]/30"
                                                    : "bg-neutral-900 border-neutral-800"
                                            }`}
                                        >
                                            {addr.fullName.toLowerCase().includes("văn phòng") ||
                                            addr.fullName.toLowerCase().includes("office") ||
                                            addr.fullName.toLowerCase().includes("cơ quan") ? (
                                                <Building2
                                                    className={`w-5 h-5 ${
                                                        addr.isDefault ? "text-[#00FF41]" : "text-neutral-500"
                                                    }`}
                                                />
                                            ) : (
                                                <Home
                                                    className={`w-5 h-5 ${
                                                        addr.isDefault ? "text-[#00FF41]" : "text-neutral-500"
                                                    }`}
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <span className="font-bold text-white text-base leading-tight">
                                                    {addr.fullName}
                                                </span>
                                                <span className="font-mono text-xs text-neutral-400">
                                                    {addr.phone}
                                                </span>
                                                {addr.isDefault && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#00FF41]/20 border border-[#00FF41]/40 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#00FF41]">
                                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        Mặc định
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-300 leading-relaxed">
                                                {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.city}
                                            </p>
                                            {!addr.isDefault && (
                                                <button
                                                    onClick={() => setDefaultAddr(addr.id)}
                                                    className="text-[11px] font-bold text-neutral-500 hover:text-[#00FF41] transition-colors underline-offset-2 hover:underline"
                                                >
                                                    Thiết lập làm mặc định
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 sm:self-start">
                                        <button
                                            onClick={() => openEditAddr(addr)}
                                            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-[11px] font-bold text-neutral-300 transition hover:border-white/25 hover:text-white"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Chỉnh sửa
                                        </button>

                                        {deleteConfirmId === addr.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => deleteAddr(addr.id)}
                                                    className="rounded-xl bg-red-500/20 border border-red-500/40 px-3 py-2.5 text-[11px] font-extrabold text-red-400 hover:bg-red-500/30 transition"
                                                >
                                                    Xác nhận xóa
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(null)}
                                                    className="rounded-xl border border-white/10 px-2.5 py-2.5 text-neutral-500 hover:text-white transition"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirmId(addr.id)}
                                                disabled={addr.isDefault}
                                                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[11px] font-bold transition ${
                                                    addr.isDefault
                                                        ? "border-neutral-900 text-neutral-700 cursor-not-allowed"
                                                        : "border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
                                                }`}
                                                title={addr.isDefault ? "Không thể xóa địa chỉ mặc định" : "Xóa địa chỉ này"}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Xóa
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Add / Edit Address */}
                {showAddrFormModal && renderModalContent()}
            </main>
        );
    }

    return (
        <main className="container mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">
            <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#00FF41]">
                        Khu vực thành viên · 01
                    </p>
                    <h1 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
                        Tài khoản của bạn
                    </h1>
                </div>
                <button
                    onClick={() => navigate(ROUTES.home)}
                    className="text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 transition hover:text-[#00FF41]"
                >
                    ← Quay lại cửa hàng
                </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.88fr_1.7fr]">
                <aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                    <div className="mb-7 flex items-center gap-4 border-b border-white/10 pb-6">
                        <div className="relative group">
                            {resolvedAvatar ? (
                                <img
                                    src={resolvedAvatar}
                                    alt="Avatar"
                                    className="h-16 w-16 rounded-full object-cover border-2 border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                                />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#00FF41] bg-neutral-900 text-xl font-black text-[#00FF41]">
                                    {(authStore.user?.fullName || authStore.user?.username || "?").trim().charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label
                                htmlFor="avatar-upload"
                                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-[10px] font-bold uppercase tracking-wider"
                            >
                                Đổi
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const localPreview = URL.createObjectURL(file);
                                        setUserAvatar(localPreview);
                                        try {
                                            await authStore.uploadAvatar(file);
                                            const updatedUser = useAuthStore.getState().user;
                                            if (updatedUser?.avatar) {
                                                setUserAvatar(getAvatarUrl(updatedUser.avatar));
                                            }
                                            showToast("Đã tải ảnh đại diện lên thư mục uploads/avatar và lưu vào Database thành công!");
                                        } catch (err: any) {
                                            const errMsg = err?.response?.data?.message || err?.message || "Tải ảnh đại diện thất bại!";
                                            showToast(errMsg);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">
                                {authStore.user?.fullName || userFullName}
                            </h2>
                            <p className="mt-1 font-mono text-xs text-neutral-400">
                                {authStore.user?.phone ? `SĐT: ${authStore.user.phone}` : authStore.user?.email ? `Email: ${authStore.user.email}` : "Chưa cập nhật SĐT"}
                            </p>
                            <p className="mt-1 font-mono text-[10px] font-bold text-[#00FF41] tracking-wider uppercase">
                                {memberTierInfo.rankName}
                            </p>
                            <button
                                onClick={() => {
                                    setNameInput(authStore.user?.fullName || (userFullName !== "Thành viên LADUX" ? userFullName : ""));
                                    setActiveProfileModal("name");
                                }}
                                className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-[#00FF41] hover:underline transition cursor-pointer"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Sửa thông tin cá nhân</span>
                            </button>
                        </div>
                    </div>

                    <nav className="space-y-1 text-sm">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 font-bold transition cursor-pointer ${
                                activeTab === "overview"
                                    ? "bg-[#00FF41] text-black"
                                    : "text-neutral-400 hover:bg-white/[0.06] hover:text-white"
                            }`}
                        >
                            <span>Tổng quan</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => navigate(ROUTES.orders)}
                            className="w-full rounded-xl px-4 py-3 text-left text-neutral-400 transition hover:bg-white/[0.06] hover:text-white flex items-center justify-between cursor-pointer"
                        >
                            <span>Đơn hàng của tôi</span>
                            <span className="font-mono text-xs text-[#00FF41] font-bold">{totalOrderCount}</span>
                        </button>
                        <button
                            onClick={() => navigate(ROUTES.addresses)}
                            className="w-full rounded-xl px-4 py-3 text-left text-neutral-400 transition hover:bg-white/[0.06] hover:text-white flex items-center justify-between cursor-pointer"
                        >
                            <span>Địa chỉ giao hàng</span>
                            <span className="font-mono text-xs text-[#00FF41] font-bold">{addressesList.length}</span>
                        </button>
                        <button
                            onClick={() => navigate(ROUTES.wishlist)}
                            className="w-full rounded-xl px-4 py-3 text-left text-neutral-400 transition hover:bg-white/[0.06] hover:text-white flex items-center justify-between cursor-pointer"
                        >
                            <span>Danh sách yêu thích</span>
                            <span className="font-mono text-xs text-[#00FF41] font-bold">{wishlistCount}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 font-bold transition cursor-pointer ${
                                activeTab === "security"
                                    ? "bg-[#00FF41] text-black"
                                    : "text-neutral-400 hover:bg-white/[0.06] hover:text-white"
                            }`}
                        >
                            <span>Bảo mật</span>
                            <Lock className="h-4 w-4" />
                        </button>
                    </nav>

                    {/* Logout Button */}
                    <div className="mt-6 pt-5 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </div>
                </aside>

                {activeTab === "security" ? (
                    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41]">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Cài đặt Bảo mật</h2>
                                <p className="mt-1 text-xs text-neutral-400">
                                    Thêm số điện thoại, email và mật khẩu tài khoản
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Số điện thoại */}
                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-black/40 p-5 hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                                                SỐ ĐIỆN THOẠI
                                            </p>
                                            <p className="text-sm font-extrabold text-white font-mono truncate mt-0.5">
                                                {authStore.user?.phone ? authStore.user.phone : "Chưa cập nhật"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setPhoneInput(authStore.user?.phone || "");
                                            setPhoneOtpInput("");
                                            setPhoneVerificationId(null);
                                            setPhoneMasked("");
                                            setActiveProfileModal("phone");
                                        }}
                                        className="shrink-0 rounded-full border border-[#00FF41]/40 bg-[#00FF41]/10 px-4 py-2 text-xs font-bold text-[#00FF41] hover:bg-[#00FF41]/20 transition cursor-pointer"
                                    >
                                        {authStore.user?.phone ? "Cập nhật SĐT" : "Thêm số điện thoại"}
                                    </button>
                                </div>

                                {/* Email */}
                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-black/40 p-5 hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                                                ĐỊA CHỈ EMAIL
                                            </p>
                                            <p className="text-sm font-extrabold text-white font-mono truncate mt-0.5">
                                                {authStore.user?.email ? authStore.user.email : "Chưa cập nhật"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            resetEmailVerification();
                                            setActiveProfileModal("email");
                                        }}
                                        className="shrink-0 rounded-full border border-[#00FF41]/40 bg-[#00FF41]/10 px-4 py-2 text-xs font-bold text-[#00FF41] hover:bg-[#00FF41]/20 transition cursor-pointer"
                                    >
                                        {authStore.user?.email ? "Cập nhật email" : "Thêm địa chỉ email"}
                                    </button>
                                </div>
                            </div>

                            {/* Mật khẩu */}
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-black/40 p-5 hover:border-white/20 transition-all">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                                            MẬT KHẨU ĐĂNG NHẬP
                                        </p>
                                        <p className="text-xs font-medium text-neutral-300 font-mono mt-0.5">
                                            •••••••••••• <span className="text-neutral-500 text-[11px]">(Được bảo mật mã hóa 256-bit)</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setPwdStep(1);
                                        const initialMethod = authStore.user?.phone ? "phone" : authStore.user?.email ? "email" : "phone";
                                        setAuthMethod(initialMethod);
                                        setVerifyTarget(initialMethod === "phone" ? (authStore.user?.phone || "") : (authStore.user?.email || ""));
                                        setOtpSent(false);
                                        setOtpVerified(false);
                                        setOtpInput("");
                                        setPasswordVerificationId(null);
                                        setPasswordMaskedTarget("");
                                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                        setActiveProfileModal("password");
                                    }}
                                    className="shrink-0 rounded-full border border-white/20 bg-white/[0.06] px-5 py-2.5 text-xs font-bold text-white hover:bg-white/[0.12] transition cursor-pointer"
                                >
                                    Đổi mật khẩu
                                </button>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="space-y-5">
                        {/* Hộp Điểm Thành Viên Thật */}
                        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(118deg,rgba(0,255,65,0.13),rgba(255,255,255,0.035)_44%,rgba(103,76,174,0.14))] p-6 sm:p-8">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00FF41]">
                                ĐIỂM THÀNH VIÊN
                            </p>
                            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
                                <div>
                                    <p className="text-5xl font-black tracking-[-0.045em] text-white">
                                        {realMemberPoints.toLocaleString("vi-VN")}
                                    </p>
                                    <p className="mt-2 text-sm text-neutral-400 font-medium">
                                        {memberTierInfo.subtext}
                                    </p>
                                </div>
                                <Award className="h-12 w-12 text-[#00FF41]" />
                            </div>
                        </div>

                        {/* Hộp Đơn Hàng Gần Đây (Hiển thị tối đa 3 đơn hàng) */}
                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white">Đơn hàng gần đây</h2>
                                <button
                                    onClick={() => navigate(ROUTES.orders)}
                                    className="text-xs font-bold text-[#00FF41] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Xem tất cả</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {recent3Orders.length > 0 ? (
                                <div className="space-y-3">
                                    {recent3Orders.map((ord) => (
                                        <div
                                            key={ord.id}
                                            onClick={() => navigate(ROUTES.orders)}
                                            className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between hover:border-[#00FF41]/40 transition cursor-pointer group"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-[#00FF41] group-hover:underline">
                                                        #{ord.orderNumber}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-400 font-mono">
                                                        ({ord.items.length} sản phẩm)
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm font-semibold text-white line-clamp-1">
                                                    {ord.items[0]?.product?.name || "Không còn thông tin sản phẩm"}
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-400 font-mono">
                                                    {ord.date} · <span className="text-white font-bold">{ord.finalAmount.toLocaleString("vi-VN")} ₫</span>
                                                </p>
                                            </div>
                                            <span className="w-fit rounded-full border border-[#00FF41]/30 bg-[#00FF41]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#00FF41] shrink-0">
                                                {ord.status}
                                            </span>
                                        </div>
                                    ))}

                                    {displayOrders.length > 3 && (
                                        <div className="pt-3 text-center border-t border-white/5">
                                            <button
                                                onClick={() => navigate(ROUTES.orders)}
                                                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#00FF41] hover:underline cursor-pointer transition"
                                            >
                                                <span>Xem thêm {displayOrders.length - 3} đơn hàng khác</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-500 font-mono py-6 text-center">Chưa có đơn hàng nào.</p>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Modal Add / Edit Address */}
            {showAddrFormModal && renderModalContent()}

            {/* Modal 1: Sửa Họ & Tên */}
            {activeProfileModal === "name" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0F0F11] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-5">
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF41]">
                                    THÔNG TIN CÁ NHÂN
                                </span>
                                <h3 className="text-lg font-extrabold text-white mt-0.5">
                                    Cập nhật Họ & Tên
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveProfileModal(null)}
                                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!nameInput.trim()) {
                                    showToast("Vui lòng nhập họ và tên!");
                                    return;
                                }
                                setProfileSaving(true);
                                try {
                                    await authStore.updatePersonalInformation({ fullName: nameInput.trim() });
                                    showToast("Cập nhật họ và tên thành công!");
                                    setActiveProfileModal(null);
                                } catch (err: any) {
                                    showToast(err?.response?.data?.message || err?.message || "Cập nhật thất bại!");
                                } finally {
                                    setProfileSaving(false);
                                }
                            }}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                    HỌ VÀ TÊN <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder="Nhập họ và tên..."
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-[#00FF41] focus:outline-none transition font-medium"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setActiveProfileModal(null)}
                                    className="flex-1 rounded-xl border border-neutral-800 bg-transparent py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-800 transition cursor-pointer"
                                >
                                    HỦY
                                </button>
                                <button
                                    type="submit"
                                    disabled={profileSaving}
                                    className="flex-1 rounded-xl bg-[#00FF41] py-3.5 text-xs font-extrabold uppercase tracking-wider text-black hover:bg-[#00cc34] transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:opacity-50 cursor-pointer"
                                >
                                    {profileSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 stroke-[3]" />
                                            <span>LƯU TÊN</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Cập nhật SĐT */}
            {activeProfileModal === "phone" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0F0F11] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-5">
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF41]">
                                    SỐ ĐIỆN THOẠI
                                </span>
                                <h3 className="text-lg font-extrabold text-white mt-0.5">
                                    {authStore.user?.phone ? "Cập nhật Số Điện Thoại" : "Thêm Số Điện Thoại"}
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveProfileModal(null)}
                                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setProfileSaving(true);
                                try {
                                    if (!phoneVerificationId) {
                                        if (!phoneInput.trim()) {
                                            showToast("Vui lòng nhập số điện thoại!");
                                            return;
                                        }
                                        const response = await customerService.sendPhoneOtp({
                                            phone: phoneInput.replace(/\s/g, ""),
                                        });
                                        setPhoneVerificationId(response.verificationId);
                                        setPhoneMasked(response.maskedPhone);
                                        showToast("Đã tạo OTP. Dùng mã 123456 để xác minh.");
                                        return;
                                    }

                                    if (!/^\d{6}$/.test(phoneOtpInput)) {
                                        showToast("OTP phải gồm đúng 6 chữ số!");
                                        return;
                                    }

                                    await customerService.verifyPhoneOtp({
                                        verificationId: phoneVerificationId,
                                        otp: phoneOtpInput,
                                    });
                                    await authStore.fetchCurrentUser();
                                    showToast("Xác minh và cập nhật số điện thoại thành công!");
                                    setPhoneVerificationId(null);
                                    setPhoneOtpInput("");
                                    setPhoneMasked("");
                                    setActiveProfileModal(null);
                                } catch (err: any) {
                                    showToast(err?.response?.data?.message || err?.message || "Cập nhật thất bại!");
                                } finally {
                                    setProfileSaving(false);
                                }
                            }}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                    SỐ ĐIỆN THOẠI <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                    disabled={phoneVerificationId !== null}
                                    placeholder="0988 123 456"
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-[#00FF41] focus:outline-none transition font-mono disabled:opacity-60"
                                />
                            </div>
                            {phoneVerificationId && (
                                <div>
                                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                        MÃ OTP <span className="text-red-500">*</span>
                                    </label>
                                    <p className="mb-2 text-xs text-neutral-500">
                                        Mã có hiệu lực cho {phoneMasked || "số điện thoại đã nhập"}.
                                    </p>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        required
                                        value={phoneOtpInput}
                                        onChange={(e) => setPhoneOtpInput(e.target.value.replace(/\D/g, ""))}
                                        placeholder="123456"
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-[#00FF41] focus:outline-none transition font-mono tracking-[0.35em]"
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setActiveProfileModal(null)}
                                    className="flex-1 rounded-xl border border-neutral-800 bg-transparent py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-800 transition cursor-pointer"
                                >
                                    HỦY
                                </button>
                                <button
                                    type="submit"
                                    disabled={profileSaving}
                                    className="flex-1 rounded-xl bg-[#00FF41] py-3.5 text-xs font-extrabold uppercase tracking-wider text-black hover:bg-[#00cc34] transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:opacity-50 cursor-pointer"
                                >
                                    {profileSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 stroke-[3]" />
                                            <span>{phoneVerificationId ? "XÁC MINH OTP" : "GỬI OTP"}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 3: Cập nhật Email */}
            {activeProfileModal === "email" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0F0F11] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-5">
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF41]">
                                    ĐỊA CHỈ EMAIL
                                </span>
                                <h3 className="text-lg font-extrabold text-white mt-0.5">
                                    {authStore.user?.email ? "Cập nhật Địa Chỉ Email" : "Thêm Địa Chỉ Email"}
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveProfileModal(null)}
                                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                void (emailStep === "INPUT" ? handleSendEmailOtp() : handleVerifyEmailOtp());
                            }}
                            className="p-6 space-y-4"
                        >
                            {emailStep === "INPUT" ? (
                                <div>
                                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                        EMAIL MỚI <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={newEmail}
                                        onChange={(event) => setNewEmail(event.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-[#00FF41] focus:outline-none transition font-mono"
                                    />
                                    <p className="mt-2 text-xs text-neutral-500">
                                        Email chỉ được cập nhật sau khi bạn nhập đúng mã được gửi tới hộp thư mới.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-neutral-300">
                                        Mã xác thực đã được gửi tới <strong className="text-white">{maskedEmail}</strong>
                                    </p>
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                            MÃ XÁC THỰC <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            value={emailOtp}
                                            onChange={(event) => {
                                                const value = event.target.value.replace(/\D/g, "").slice(0, 6);
                                                setEmailOtp(value);
                                            }}
                                            placeholder="Nhập mã 6 chữ số"
                                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-center text-sm font-mono tracking-[0.25em] text-white focus:border-[#00FF41] focus:outline-none transition"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmailStep("INPUT");
                                            setEmailVerificationId(null);
                                            setEmailOtp("");
                                            setMaskedEmail("");
                                        }}
                                        className="text-xs font-bold text-[#00FF41] hover:underline"
                                    >
                                        Đổi email khác
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetEmailVerification();
                                        setActiveProfileModal(null);
                                    }}
                                    className="flex-1 rounded-xl border border-neutral-800 bg-transparent py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-800 transition cursor-pointer"
                                >
                                    HỦY
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        emailStep === "INPUT"
                                            ? sendingEmailOtp
                                            : verifyingEmailOtp || emailOtp.length !== 6
                                    }
                                    className="flex-1 rounded-xl bg-[#00FF41] py-3.5 text-xs font-extrabold uppercase tracking-wider text-black hover:bg-[#00cc34] transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:opacity-50 cursor-pointer"
                                >
                                    {sendingEmailOtp || verifyingEmailOtp ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 stroke-[3]" />
                                            <span>{emailStep === "INPUT" ? "GỬI MÃ" : "XÁC MINH EMAIL"}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 4: Đổi mật khẩu (2 Bước: Xác thực danh tính -> Thiết lập mật khẩu mới) */}
            {activeProfileModal === "password" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0F0F11] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-5">
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF41]">
                                    {pwdStep === 1 ? "BƯỚC 1 / 2: XÁC THỰC DANH TÍNH" : "BƯỚC 2 / 2: THIẾT LẬP MẬT KHẨU MỚI"}
                                </span>
                                <h3 className="text-xl font-extrabold text-white mt-0.5 tracking-tight">
                                    {pwdStep === 1 ? "Xác thực OTP / Email" : "Đổi Mật Khẩu"}
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveProfileModal(null)}
                                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {pwdStep === 1 ? (
                            /* Step 1: Identity Verification Form */
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void handleVerifyPasswordOtp();
                                }}
                                className="p-6 space-y-5"
                            >
                                {/* Field 1: Phương thức xác thực */}
                                <div>
                                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                        PHƯƠNG THỨC XÁC THỰC <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={authMethod}
                                        onChange={(e) => {
                                            const method = e.target.value as "phone" | "email";
                                            setAuthMethod(method);
                                            setVerifyTarget(method === "phone" ? (authStore.user?.phone || "") : (authStore.user?.email || ""));
                                            setOtpSent(false);
                                            setOtpVerified(false);
                                            setOtpInput("");
                                            setPasswordVerificationId(null);
                                            setPasswordMaskedTarget("");
                                        }}
                                        className="w-full rounded-2xl border border-neutral-800 bg-black/60 px-4 py-3.5 text-sm text-white focus:border-[#00FF41] focus:outline-none transition appearance-none font-medium cursor-pointer"
                                    >
                                        <option value="phone" className="bg-neutral-900">
                                            Xác thực qua Số điện thoại (OTP SMS)
                                        </option>
                                        <option value="email" className="bg-neutral-900">
                                            Xác thực qua Địa chỉ Email (Mã Email)
                                        </option>
                                    </select>
                                </div>

                                {/* Field 2: Target Input */}
                                <div>
                                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                        {authMethod === "phone" ? "SỐ ĐIỆN THOẠI CỦA TÀI KHOẢN *" : "ĐỊA CHỈ EMAIL CỦA TÀI KHOẢN *"}
                                    </label>
                                    <div className="flex items-center gap-2.5">
                                        <input
                                            type={authMethod === "phone" ? "tel" : "email"}
                                            required
                                            value={passwordMaskedTarget || verifyTarget}
                                            readOnly
                                            placeholder={authMethod === "phone" ? "0988 123 456" : "you@example.com"}
                                            className="flex-1 rounded-2xl border border-neutral-800 bg-black/60 px-4 py-3.5 text-sm text-white font-mono placeholder:text-neutral-600 focus:border-[#00FF41] focus:outline-none transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => void handleSendPasswordOtp()}
                                            disabled={otpSending}
                                            className="shrink-0 rounded-2xl border border-[#00FF41]/40 bg-[#00FF41]/10 px-4 py-3.5 text-xs font-bold text-[#00FF41] hover:bg-[#00FF41]/20 transition cursor-pointer disabled:opacity-50"
                                        >
                                            {otpSent ? "Gửi lại mã" : authMethod === "phone" ? "Gửi OTP SMS" : "Gửi mã Email"}
                                        </button>
                                    </div>
                                </div>

                                {/* OTP Box when code sent */}
                                {otpSent && (
                                    <div className="rounded-2xl border border-[#00FF41]/40 bg-[#00FF41]/[0.05] p-4 space-y-2.5 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between font-mono text-[10px]">
                                            <span className="font-bold uppercase tracking-wider text-[#00FF41]">
                                                NHẬP MÃ XÁC THỰC (OTP / CODE) <span className="text-red-400">*</span>
                                            </span>
                                            {authMethod === "phone" && (
                                                <span className="text-[#00FF41] font-bold">
                                                    Mã dùng thử: <span className="underline">123456</span>
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            value={otpInput}
                                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            placeholder="Nhập mã 6 chữ số"
                                            className="w-full rounded-xl border border-[#00FF41]/60 bg-black/80 px-4 py-3 text-center text-sm font-mono tracking-[0.25em] text-white placeholder:text-neutral-600 placeholder:tracking-normal focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41]/30 focus:outline-none transition"
                                        />
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setActiveProfileModal(null)}
                                        className="flex-1 rounded-2xl border border-neutral-800 bg-transparent py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-800 transition cursor-pointer"
                                    >
                                        HỦY
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={otpVerifying || !otpSent || otpInput.length !== 6}
                                        className="flex-1 rounded-2xl bg-[#00FF41] py-3.5 text-xs font-extrabold uppercase tracking-wider text-black hover:bg-[#00cc34] transition flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(0,255,65,0.3)] cursor-pointer disabled:opacity-50"
                                    >
                                        {otpVerifying ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <span>XÁC THỰC & TIẾP TỤC</span>
                                                <ChevronRight className="w-4 h-4 stroke-[3]" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* Step 2: New Password Form */
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void handleChangePassword();
                                }}
                                className="p-6 space-y-4"
                            >
                                <div>
                                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                        MẬT KHẨU HIỆN TẠI <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-[#00FF41] focus:outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                        MẬT KHẨU MỚI <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        placeholder="Tối thiểu 8 ký tự"
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-[#00FF41] focus:outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                        XÁC NHẬN MẬT KHẨU MỚI <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        placeholder="Nhập lại mật khẩu mới"
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-[#00FF41] focus:outline-none transition"
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPwdStep(1);
                                            setOtpVerified(false);
                                            setOtpSent(false);
                                            setOtpInput("");
                                            setPasswordVerificationId(null);
                                            setPasswordMaskedTarget("");
                                        }}
                                        className="flex-1 rounded-2xl border border-neutral-800 bg-transparent py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-800 transition cursor-pointer"
                                    >
                                        QUAY LẠI
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        className="flex-1 rounded-2xl bg-[#00FF41] py-3.5 text-xs font-extrabold uppercase tracking-wider text-black hover:bg-[#00cc34] transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,65,0.3)] disabled:opacity-50 cursor-pointer"
                                    >
                                        {changingPassword ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 stroke-[3]" />
                                                <span>LƯU MẬT KHẨU</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
