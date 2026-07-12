import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Chrome, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Auth, getApiErrorMessage } from "@/api/client";
import { useStore } from "../data/store";
import { ThemeToggle } from "../components/shared";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            L
          </span>
          <span className="text-lg tracking-tight">Ladux</span>
        </Link>
        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = params.get("redirect") || "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success("Signed in");
      // After login, check roles from refreshed store — use redirect or admin home
      const dest = redirectTo === "/" && username.trim() === "admin" ? "/admin" : redirectTo;
      navigate(dest);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-center">Welcome back</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Sign in to your Ladux account
        </p>
        <Button
          variant="outline"
          className="mt-6 w-full"
          type="button"
          onClick={() => {
            window.location.href = Auth.googleLoginUrl();
          }}
        >
          <Chrome size={16} /> Continue with Google
        </Button>
        <div className="my-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Dev admin: <b>admin</b> / <b>Admin@123</b>
        </p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/register" className="text-foreground underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useStore();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      toast.success("Account created");
      navigate("/");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-center">Create your account</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">Join Ladux today</p>
        <Button
          variant="outline"
          className="mt-6 w-full"
          type="button"
          onClick={() => {
            window.location.href = Auth.googleLoginUrl();
          }}
        >
          <Chrome size={16} /> Sign up with Google
        </Button>
        <div className="my-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyen Van A"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="vana"
              required
              minLength={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Phone (optional)</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
            Create account
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
