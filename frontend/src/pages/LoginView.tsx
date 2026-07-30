import React, { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";

export interface LoginViewProps {
    onLogin: () => void;
    onGoRegister: () => void;
    onBack: () => void;
}

export default function LoginView({ onLogin, onGoRegister, onBack }: LoginViewProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin();
        }, 900);
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
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D492]/15 border border-[#00D492]/30 mb-4">
                            <Lock className="w-6 h-6 text-[#00D492]" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white">Đăng nhập</h1>
                        <p className="mt-1.5 text-xs text-neutral-500">Chào mừng trở lại với LADUX</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
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

                        <div className="flex justify-end">
                            <button type="button" className="text-[11px] text-[#00D492] hover:underline font-semibold">
                                Quên mật khẩu?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-[#00D492] py-3.5 text-sm font-extrabold text-black uppercase tracking-wider hover:bg-[#00bc82] disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-100 mt-2"
                        >
                            {loading ? "Đang xác thực..." : "Đăng Nhập"}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
                            <span className="bg-[#0e1213] px-3 text-neutral-500">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);
                            setTimeout(() => {
                                setLoading(false);
                                onLogin();
                            }, 800);
                        }}
                        className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-800 bg-black/50 py-3.5 text-xs font-bold text-white transition-all hover:border-[#00D492]/50 hover:bg-white/[0.05]"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.13C3.26 21.3 7.31 24 12 24z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.63H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.37l3.99-3.13z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.63l3.99 3.13c.95-2.85 3.6-4.96 6.72-4.96z"
                            />
                        </svg>
                        <span>Đăng nhập bằng Google</span>
                    </button>

                    <p className="mt-7 text-center text-xs text-neutral-500">
                        Chưa có tài khoản?{" "}
                        <button
                            onClick={onGoRegister}
                            className="font-bold text-[#00D492] hover:underline"
                        >
                            Đăng ký ngay
                        </button>
                    </p>
                </div>

                {/* Social proof */}
                <p className="mt-6 text-center text-[10px] text-neutral-600 font-mono uppercase tracking-widest">
                    Bảo mật SSL · Dữ liệu mã hóa 256-bit
                </p>
            </div>
        </main>
    );
}
