import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input, Label } from "../components/ui/input";
import { useAuthStore } from "../lib/store";
import { toast } from "sonner";
import { getApiErrorMessage } from "../api/client";

const HERO = "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Đăng nhập thành công");
      navigate(redirect);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Sai thông tin"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-5rem)]" data-testid="login-page">
      <div className="relative hidden lg:block">
        <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-radial-neon opacity-30" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-neon/10 border border-neon/40 flex items-center justify-center font-display font-bold text-neon">A</span>
            <span className="font-display text-xl text-white">Aura<span className="text-neon">Tech</span></span>
          </div>
          <div>
            <div className="label-eyebrow mb-3 text-neon">Welcome back</div>
            <h2 className="font-display text-4xl xl:text-5xl text-white leading-tight max-w-md">
              Tiếp tục hành trình của bạn với <span className="text-neon">AuraTech.</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={onSubmit}
          className="w-full max-w-md"
          data-testid="login-form"
        >
          <div className="label-eyebrow mb-3">Đăng nhập</div>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">Chào mừng trở lại</h1>
          <p className="text-zinc-500 text-sm mb-8">
            Hoặc{" "}
            <Link to="/register" className="text-neon hover:underline">tạo tài khoản mới</Link>
          </p>

          <div className="mb-5">
            <Label>Username</Label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="pl-11"
                required
                data-testid="login-username-input"
              />
            </div>
          </div>

          <div className="mb-3">
            <Label>Mật khẩu</Label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-11"
                required
                data-testid="login-password-input"
              />
            </div>
          </div>

          <div className="text-xs text-zinc-500 mb-6">
            Đăng nhập bằng username của tài khoản đã đăng ký.
          </div>

          <Button size="lg" type="submit" className="w-full" disabled={loading} data-testid="login-submit-btn">
            {loading ? "Đang xử lý..." : <>Đăng nhập <ArrowRight size={16} /></>}
          </Button>

          <div className="mt-8 text-center text-xs text-zinc-600">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <Link to="#" className="text-zinc-400 hover:text-neon">Điều khoản</Link> và{" "}
            <Link to="#" className="text-zinc-400 hover:text-neon">Bảo mật</Link> của chúng tôi.
          </div>
        </motion.form>
      </div>
    </div>
  );
}
