import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogIn, Sparkles, AlertCircle } from "lucide-react";
import { Input, Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useAdminAuth } from "../store";

export default function AdminLogin() {
  const { isAuthed, login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@auratech.io");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthed) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) navigate("/admin", { replace: true });
    else setError(res.message ?? "Đăng nhập thất bại");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(900px circle at 70% 20%, rgba(0,255,102,0.15), transparent 60%), radial-gradient(600px circle at 10% 90%, rgba(0,255,102,0.08), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:60px_60px]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-stretch justify-center px-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-neon/10 ring-1 ring-neon/40 shadow-[0_0_28px_-6px_rgba(0,255,102,0.7)]">
            <Sparkles className="h-6 w-6 text-neon" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neon/80">
              AuraTech Admin
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">Console v1.0</h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          data-testid="admin-login-form"
          className="rounded-2xl border border-white/[0.06] bg-zinc-950/70 p-7 backdrop-blur-xl shadow-[0_50px_120px_-40px_rgba(0,255,102,0.35)]"
        >
          <h2 className="font-display text-xl font-semibold tracking-tight text-white">
            Chào mừng trở lại
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Đăng nhập để vận hành cửa hàng AuraTech.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@auratech.io"
                required
                data-testid="admin-login-email"
              />
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                data-testid="admin-login-password"
              />
            </div>
          </div>

          {error && (
            <div
              className="mt-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
              data-testid="admin-login-error"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 w-full"
            data-testid="admin-login-submit"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </Button>

          <p className="mt-5 text-center text-[11px] text-zinc-600">
            Demo: admin@auratech.io / admin123 (mock, cho test UI admin).<br />
            Thực: dùng user từ DB seed (cần set password BCrypt thật) hoặc register + update role.
          </p>
        </form>
      </div>
    </div>
  );
}
