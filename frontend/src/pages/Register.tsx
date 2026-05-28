import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input, Label } from "../components/ui/input";
import { useAuthStore } from "../lib/store";
import { toast } from "sonner";
import { getApiErrorMessage } from "../api/client";
import type { RegisterRequest } from "../types/api";

export default function Register() {
  const [form, setForm] = useState<RegisterRequest>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleChange =
    (key: keyof RegisterRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((state) => ({ ...state, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Tạo tài khoản thành công");
      navigate("/");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Đăng ký thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-5rem)]" data-testid="register-page">
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-black" />
        <div className="absolute inset-0 bg-grid-faint [background-size:40px_40px] opacity-30" />
        <div className="absolute inset-0 bg-radial-neon opacity-40" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-neon/10 border border-neon/40 flex items-center justify-center font-display font-bold text-neon">A</span>
            <span className="font-display text-xl text-white">Aura<span className="text-neon">Tech</span></span>
          </div>
          <div>
            <div className="label-eyebrow mb-3 text-neon">Bắt đầu</div>
            <h2 className="font-display text-4xl xl:text-5xl text-white leading-tight max-w-md mb-6">
              Mở cánh cửa <span className="text-neon">hệ sinh thái</span> AuraTech.
            </h2>
            <ul className="space-y-3 text-zinc-400 text-sm">
              <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-neon" /> Ưu đãi thành viên độc quyền</li>
              <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-neon" /> Lịch sử đơn hàng & wishlist</li>
              <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-neon" /> Concierge cá nhân hoá</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={onSubmit}
          className="w-full max-w-md"
          data-testid="register-form"
        >
          <div className="label-eyebrow mb-3">Đăng ký</div>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">Tạo tài khoản</h1>
          <p className="text-zinc-500 text-sm mb-8">
            Đã có tài khoản? <Link to="/login" className="text-neon hover:underline">Đăng nhập</Link>
          </p>

          <div className="space-y-4">
            <div>
              <Label>Họ và tên</Label>
              <Input value={form.fullName} onChange={handleChange("fullName")} required data-testid="register-fullname" />
            </div>
            <div>
              <Label>Username</Label>
              <Input value={form.username} onChange={handleChange("username")} required data-testid="register-username" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={handleChange("email")} required data-testid="register-email" />
            </div>
            <div>
              <Label>Mật khẩu</Label>
              <Input type="password" value={form.password} onChange={handleChange("password")} required minLength={6} data-testid="register-password" />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input value={form.phone} onChange={handleChange("phone")} placeholder="09xxxxxxxx" data-testid="register-phone" />
            </div>
          </div>

          <Button size="lg" type="submit" className="w-full mt-8" disabled={loading} data-testid="register-submit-btn">
            {loading ? "Đang xử lý..." : <>Tạo tài khoản <ArrowRight size={16} /></>}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
