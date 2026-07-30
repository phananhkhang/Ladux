import React, { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
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
    
    // Lấy state và hàm login từ Zustand Auth Store
    const { login, isLoading, error, clearError } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        try {
            // Bắn API POST /api/v1/auth/login xuống Spring Boot
            await login({ username, password });
            if (onLoginSuccess) {
                onLoginSuccess();
            } else if (onLogin) {
                onLogin();
            }
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
        }
    };

    return (
        <main className="min-h-[80vh] flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-[#00D492] mb-10 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Quay lại cửa hàng
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 sm:p-10 backdrop-blur-md">
                    <div className="mb-8 text-center">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D492]/15 border border-[#00D492]/30 mb-4">
                            <Lock className="w-6 h-6 text-[#00D492]" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white">Đăng nhập</h1>
                        <p className="mt-1.5 text-xs text-neutral-500">Chào mừng trở lại với LADUX</p>
                    </div>

                    {/* Hiển thị thông báo lỗi thật từ Backend nếu có */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
                            {error}
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
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/30 transition"
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
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/30 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-[#00D492] py-3.5 text-sm font-extrabold text-black uppercase tracking-wider hover:bg-[#00bc82] disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-100 mt-2"
                        >
                            {isLoading ? "Đang xác thực API..." : "Đăng Nhập"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
