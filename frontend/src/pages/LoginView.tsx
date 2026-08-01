import React, { useState } from "react";
import { ArrowLeft, Lock, AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores"; // Import Store Auth

export interface LoginViewProps {
    onLoginSuccess?: () => void;
    onLogin?: () => void;
    onGoRegister: () => void;
    onBack: () => void;
}

export default function LoginView({ onLoginSuccess, onLogin, onGoRegister, onBack }: LoginViewProps) {
    const [username, setUsername] = useState(""); // Backend dùng username hoặc email
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);
    
    // Lấy state và hàm login từ Zustand Auth Store
    const { login, isLoading, error, clearError } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);
        try {
            // Bắn API POST /api/v1/auth/login xuống Spring Boot
            await login({ username, password });

            // Chỉ chuyển trang nếu thực sự đăng nhập thành công
            const isSuccess = useAuthStore.getState().isLoggedIn;
            if (isSuccess) {
                if (onLoginSuccess) {
                    onLoginSuccess();
                } else if (onLogin) {
                    onLogin();
                }
            } else {
                setLocalError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
            }
        } catch (err: any) {
            console.error("Lỗi đăng nhập:", err);
            const errMsg =
                err?.response?.data?.message ||
                err?.message ||
                "Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại!";
            setLocalError(errMsg);
            // Giữ nguyên ở trang đăng nhập, KHÔNG chuyển hướng
        }
    };

    const activeError = error || localError;

    return (
        <main className="min-h-[80vh] flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-[#00FF41] mb-10 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Quay lại cửa hàng
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 sm:p-10 backdrop-blur-md">
                    <div className="mb-8 text-center">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00FF41]/15 border border-[#00FF41]/30 mb-4">
                            <Lock className="w-6 h-6 text-[#00FF41]" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white">Đăng nhập</h1>
                        <p className="mt-1.5 text-xs text-neutral-500">Chào mừng trở lại với LADUX</p>
                    </div>

                    {/* Hiển thị thông báo lỗi thật từ Backend nếu có */}
                    {activeError && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in zoom-in duration-200">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                            <span>{activeError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                                Tên đăng nhập / Email
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập username hoặc email..."
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00FF41]/60 focus:ring-1 focus:ring-[#00FF41]/30 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00FF41]/60 focus:ring-1 focus:ring-[#00FF41]/30 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-[#00FF41] py-3.5 text-sm font-extrabold text-black uppercase tracking-wider hover:bg-[#00cc34] disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-100 mt-2"
                        >
                            {isLoading ? "Đang xác thực API..." : "Đăng Nhập"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-neutral-400">
                        Nếu chưa có tài khoản:{" "}
                        <button
                            type="button"
                            onClick={onGoRegister}
                            className="font-bold text-[#00FF41] hover:underline cursor-pointer transition-colors"
                        >
                            Đăng ký ngay
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
