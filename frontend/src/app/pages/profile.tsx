import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Camera,
  Check,
  ChevronRight,
  Edit3,
  Heart,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Shield,
  ShoppingBag,
  Star,
  Wallet,
  Bell,
  Globe,
  KeyRound,
  UserCircle2,
  Gem,
  Clock,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Auth, Orders, Products, getApiErrorMessage } from "@/api/client";
import type { OrderResponse, ProductResponse } from "@/api/types";
import {
  formatDate,
  formatPrice,
  productImages,
  resolveMediaUrl,
} from "@/lib/format";
import { useStore } from "../data/store";
import { PageShell } from "../components/storefront-layout";
import { OrderStatusBadge, RatingStars } from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

// ----------------------------- Loyalty tiers ---------------------------------

type Level = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

const LEVEL_CONFIG: Record<
  Level,
  {
    color: string;
    bg: string;
    next: Level | null;
    threshold: number | null;
    label: string;
  }
> = {
  BRONZE: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-500/15",
    next: "SILVER",
    threshold: 5000,
    label: "Bronze",
  },
  SILVER: {
    color: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-200 dark:bg-zinc-500/20",
    next: "GOLD",
    threshold: 10000,
    label: "Silver",
  },
  GOLD: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-500/15",
    next: "PLATINUM",
    threshold: 20000,
    label: "Gold",
  },
  PLATINUM: {
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-500/15",
    next: null,
    threshold: null,
    label: "Platinum",
  },
};

function levelFromSpent(total: number): Level {
  if (total >= 20000) return "PLATINUM";
  if (total >= 10000) return "GOLD";
  if (total >= 5000) return "SILVER";
  return "BRONZE";
}

function splitName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function joinName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

function bioKey(userId: number) {
  return `ladux_profile_bio_${userId}`;
}

function loadBio(userId: number): string {
  try {
    return localStorage.getItem(bioKey(userId)) ?? "";
  } catch {
    return "";
  }
}

function saveBioLocal(userId: number, bio: string) {
  try {
    localStorage.setItem(bioKey(userId), bio);
  } catch {
    /* ignore */
  }
}

function notifKey(userId: number) {
  return `ladux_profile_notif_${userId}`;
}

function loadNotifs(userId: number) {
  try {
    const raw = localStorage.getItem(notifKey(userId));
    if (raw) return JSON.parse(raw) as { orders: boolean; promos: boolean; restocks: boolean };
  } catch {
    /* ignore */
  }
  return { orders: true, promos: false, restocks: true };
}

// =============================================================================

export function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    authLoading,
    wishlist,
    logout,
    refreshUser,
  } = useStore();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [productMap, setProductMap] = useState<Record<number, ProductResponse>>({});
  const [ordersLoading, setOrdersLoading] = useState(false);

  const nameParts = splitName(user?.fullName);
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [draftFirst, setDraftFirst] = useState(nameParts.firstName);
  const [draftLast, setDraftLast] = useState(nameParts.lastName);
  const [draftBio, setDraftBio] = useState("");
  const [bio, setBio] = useState("");
  const [formFirst, setFormFirst] = useState("");
  const [formLast, setFormLast] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notifications, setNotifications] = useState({
    orders: true,
    promos: false,
    restocks: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local form state when user loads
  useEffect(() => {
    if (!user) return;
    const parts = splitName(user.fullName);
    setDraftFirst(parts.firstName);
    setDraftLast(parts.lastName);
    setFormFirst(parts.firstName);
    setFormLast(parts.lastName);
    setFormEmail(user.email ?? "");
    setFormPhone(user.phone ?? "");
    const b = loadBio(user.id);
    setBio(b);
    setDraftBio(b);
    setNotifications(loadNotifs(user.id));
  }, [user]);

  // Load recent orders + product images for line items
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      setOrdersLoading(true);
      try {
        const page = await Orders.mine({ size: 50, sort: "createdAt,desc" });
        if (cancelled) return;
        const list = page.content ?? [];
        setOrders(list);

        const ids = new Set<number>();
        list.forEach((o) => o.orderItems?.forEach((i) => ids.add(i.productId)));
        const entries = await Promise.all(
          [...ids].map(async (id) => {
            try {
              return [id, await Products.byId(id)] as const;
            } catch {
              return null;
            }
          }),
        );
        if (cancelled) return;
        const map: Record<number, ProductResponse> = {};
        entries.forEach((e) => {
          if (e) map[e[0]] = e[1];
        });
        setProductMap(map);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const totalSpent = useMemo(
    () =>
      orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + Number(o.finalAmount ?? 0), 0),
    [orders],
  );
  const level = levelFromSpent(totalSpent);
  const cfg = LEVEL_CONFIG[level];
  const nextThreshold = cfg.threshold ?? (totalSpent || 1);
  const progress = Math.min(100, (totalSpent / nextThreshold) * 100);
  const loyaltyPoints = Math.floor(totalSpent);

  const recentOrders = orders.slice(0, 3);
  const wishlistPreview = wishlist.slice(0, 4);

  const activity = useMemo(() => {
    const items: { id: string; type: string; text: string; date: string }[] = [];
    orders.slice(0, 5).forEach((o) => {
      items.push({
        id: `order-${o.id}`,
        type: "order",
        text: `Order #${o.id} — ${o.status}`,
        date: formatDate(o.createdAt),
      });
    });
    wishlist.slice(0, 3).forEach((w) => {
      items.push({
        id: `wish-${w.id}`,
        type: "wishlist",
        text: `Wishlisted ${w.product?.name ?? "a product"}`,
        date: "Recently",
      });
    });
    return items.slice(0, 6);
  }, [orders, wishlist]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await Auth.uploadAvatar(file);
      await refreshUser();
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to upload photo"));
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const saveName = async () => {
    if (!user) return;
    try {
      await Auth.updateMe({ fullName: joinName(draftFirst, draftLast) || undefined });
      await refreshUser();
      setEditingName(false);
      toast.success("Name updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const saveBio = () => {
    if (!user) return;
    setBio(draftBio);
    saveBioLocal(user.id, draftBio);
    setEditingBio(false);
    toast.success("Bio updated");
  };

  const savePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await Auth.updateMe({
        fullName: joinName(formFirst, formLast) || undefined,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
      });
      await refreshUser();
      toast.success("Profile saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      // Backend updateMe accepts new password; current password not verified server-side yet.
      void currentPassword;
      await Auth.updateMe({ password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Signed out");
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="py-24 text-center">
        <UserCircle2 size={40} className="mx-auto mb-3 text-muted-foreground" />
        <h3>Sign in to view your profile</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage orders, wishlist, and account settings.
        </p>
        <Button asChild className="mt-4">
          <Link to="/login?redirect=/profile">Sign in</Link>
        </Button>
      </div>
    );
  }

  const displayFirst = splitName(user.fullName).firstName || user.username;
  const displayLast = splitName(user.fullName).lastName;
  const initials =
    `${displayFirst[0] ?? ""}${displayLast[0] ?? displayFirst[1] ?? ""}`.toUpperCase() ||
    "U";
  const avatarSrc = resolveMediaUrl(user.avatar);

  return (
    <PageShell title="My profile">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* ─── Left column: identity card ─────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-center">
            <div className="relative">
              <Avatar className="size-24 ring-2 ring-border ring-offset-2 ring-offset-background">
                {avatarSrc ? <AvatarImage src={avatarSrc} alt={user.fullName ?? user.username} /> : null}
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-accent/60 transition-colors disabled:opacity-50"
                aria-label="Change photo"
              >
                {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleAvatarChange(e)}
              />
            </div>

            {editingName ? (
              <div className="w-full space-y-2">
                <Input
                  value={draftFirst}
                  onChange={(e) => setDraftFirst(e.target.value)}
                  className="text-center"
                  placeholder="First name"
                />
                <Input
                  value={draftLast}
                  onChange={(e) => setDraftLast(e.target.value)}
                  className="text-center"
                  placeholder="Last name"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => void saveName()}>
                    <Check size={13} /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingName(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <h3 className="tracking-tight">
                  {user.fullName?.trim() || user.username}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const p = splitName(user.fullName);
                    setDraftFirst(p.firstName);
                    setDraftLast(p.lastName);
                    setEditingName(true);
                  }}
                  className="absolute -right-6 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  aria-label="Edit name"
                >
                  <Edit3 size={13} />
                </button>
              </div>
            )}

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${cfg.bg} ${cfg.color}`}
            >
              <Gem size={11} /> {cfg.label} Member
            </span>

            {editingBio ? (
              <div className="w-full space-y-2">
                <textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full rounded-md border bg-input-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={saveBio}>
                    <Check size={13} /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingBio(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group relative w-full">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {bio || "Add a short bio about yourself."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDraftBio(bio);
                    setEditingBio(true);
                  }}
                  className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  aria-label="Edit bio"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}

            <Separator className="w-full" />

            <div className="w-full space-y-2 text-sm text-left">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} className="shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} className="shrink-0" />
                <span>{user.phone || "No phone on file"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} className="shrink-0" />
                <span>@{user.username}</span>
              </div>
            </div>
          </div>

          {/* Loyalty progress */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5">
                <Star size={15} className="text-amber-400 fill-amber-400" /> Loyalty
              </h4>
              <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{loyaltyPoints.toLocaleString()} pts</span>
                {cfg.next && (
                  <span>
                    Next: {cfg.label} → {cfg.next}
                  </span>
                )}
              </div>
              <Progress value={progress} className="h-2" />
              {cfg.threshold != null && (
                <p className="text-xs text-muted-foreground">
                  {formatPrice(Math.max(0, nextThreshold - totalSpent))} more to reach {cfg.next}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatMini label="Total spent" value={formatPrice(totalSpent)} icon={Wallet} />
              <StatMini label="Orders" value={String(orders.length)} icon={ShoppingBag} />
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-xl border bg-card overflow-hidden">
            {[
              {
                to: "/orders",
                icon: Package,
                label: "My orders",
                sub: `${orders.length} orders`,
                onClick: undefined as (() => void) | undefined,
                danger: false,
              },
              {
                to: "/wishlist",
                icon: Heart,
                label: "Wishlist",
                sub: `${wishlist.length} items`,
                onClick: undefined,
                danger: false,
              },
              {
                to: "/account",
                icon: MapPin,
                label: "Addresses",
                sub: "Manage addresses",
                onClick: undefined,
                danger: false,
              },
              {
                to: "#",
                icon: LogOut,
                label: "Sign out",
                sub: "",
                onClick: () => void handleLogout(),
                danger: true,
              },
            ].map((item) =>
              item.onClick ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm border-b last:border-b-0 hover:bg-accent/40 transition-colors text-left ${
                    item.danger ? "text-destructive" : ""
                  }`}
                >
                  <item.icon size={16} className="shrink-0" />
                  <div className="flex-1">
                    <p className={item.danger ? "text-destructive" : ""}>{item.label}</p>
                    {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                  </div>
                </button>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 px-4 py-3 text-sm border-b last:border-b-0 hover:bg-accent/40 transition-colors"
                >
                  <item.icon size={16} className="shrink-0" />
                  <div className="flex-1">
                    <p>{item.label}</p>
                    {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>
              ),
            )}
          </div>
        </div>

        {/* ─── Right column: tabbed content ───────────────────────────────── */}
        <div>
          <Tabs defaultValue="overview">
            <TabsList className="mb-6 w-full justify-start flex-wrap h-auto gap-1">
              <TabsTrigger value="overview">
                <UserCircle2 size={14} className="mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingBag size={14} className="mr-1.5" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist">
                <Heart size={14} className="mr-1.5" />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield size={14} className="mr-1.5" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell size={14} className="mr-1.5" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* ── Overview ── */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Orders placed" value={String(orders.length)} icon={ShoppingBag} />
                <StatCard label="Wishlist items" value={String(wishlist.length)} icon={Heart} />
                <StatCard
                  label="Loyalty points"
                  value={loyaltyPoints.toLocaleString()}
                  icon={Star}
                />
                <StatCard label="Total spent" value={formatPrice(totalSpent)} icon={TrendingUp} />
              </div>

              <div className="rounded-xl border bg-card">
                <div className="border-b px-5 py-4">
                  <h4>Recent activity</h4>
                </div>
                {activity.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-muted-foreground text-center">
                    No recent activity yet. Place an order or save a laptop to get started.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {activity.map((a) => {
                      const icons: Record<string, React.ElementType> = {
                        order: Package,
                        review: Star,
                        wishlist: Heart,
                        points: Wallet,
                      };
                      const Icon = icons[a.type] ?? Package;
                      return (
                        <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                          <span className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0">
                            <Icon size={14} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug">{a.text}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{a.date}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border bg-card">
                <div className="border-b px-5 py-4 flex items-center justify-between">
                  <h4>Personal information</h4>
                </div>
                <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={(e) => void savePersonalInfo(e)}>
                  <div className="space-y-2">
                    <Label>First name</Label>
                    <Input value={formFirst} onChange={(e) => setFormFirst(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last name</Label>
                    <Input value={formLast} onChange={(e) => setFormLast(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0901234567"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? <Loader2 className="animate-spin" size={16} /> : null}
                      Save changes
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* ── Orders ── */}
            <TabsContent value="orders" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {ordersLoading ? "Loading…" : `${orders.length} orders total`}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/orders">View all</Link>
                </Button>
              </div>
              {ordersLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="animate-spin text-muted-foreground" size={28} />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                  <Package size={36} className="mb-3 text-muted-foreground" />
                  <h4>No orders yet</h4>
                  <Button asChild className="mt-4">
                    <Link to="/products">Browse laptops</Link>
                  </Button>
                </div>
              ) : (
                recentOrders.map((o) => (
                  <div key={o.id} className="rounded-xl border bg-card p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-sm">#{o.id}</span>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(o.createdAt)} · {o.orderItems?.length ?? 0} item(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <OrderStatusBadge status={o.status} />
                        <span className="tabular-nums text-sm">
                          {formatPrice(Number(o.finalAmount))}
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex flex-wrap gap-3">
                      {(o.orderItems ?? []).map((item) => {
                        const p = productMap[item.productId];
                        const img = p ? productImages(p)[0] : undefined;
                        return (
                          <div key={item.id} className="flex items-center gap-2">
                            <ImageWithFallback
                              src={img}
                              alt={p?.name ?? `Product #${item.productId}`}
                              className="size-10 rounded-md object-cover"
                            />
                            <div>
                              <p className="text-xs leading-snug line-clamp-1 max-w-[140px]">
                                {p?.name ?? `Product #${item.productId}`}
                              </p>
                              <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* ── Wishlist ── */}
            <TabsContent value="wishlist">
              {wishlistPreview.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                  <Heart size={36} className="mb-3 text-muted-foreground" />
                  <h4>No saved items</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Heart a laptop to save it here.
                  </p>
                  <Button asChild className="mt-5">
                    <Link to="/products">Browse laptops</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {wishlistPreview.map((w) => {
                    const p = w.product;
                    const images = productImages(p);
                    return (
                      <Link
                        key={w.id}
                        to={`/products/${p.slug}`}
                        className="group flex gap-3 rounded-xl border bg-card p-3 hover:shadow-md transition-shadow"
                      >
                        <ImageWithFallback
                          src={images[0]}
                          alt={p.name}
                          className="size-20 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug line-clamp-2">{p.name}</p>
                          <div className="mt-1">
                            <RatingStars value={0} size={12} />
                          </div>
                          <p className="mt-1 text-sm tabular-nums">
                            {formatPrice(Number(p.discountPrice ?? p.basePrice))}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              {wishlistPreview.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/wishlist">View all {wishlist.length} items</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ── Security ── */}
            <TabsContent value="security" className="space-y-4">
              <div className="rounded-xl border bg-card">
                <div className="border-b px-5 py-4 flex items-center gap-2">
                  <KeyRound size={16} />
                  <h4>Change password</h4>
                </div>
                <form className="space-y-4 p-5" onSubmit={(e) => void changePassword(e)}>
                  <div className="space-y-2">
                    <Label>Current password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New password</Label>
                    <Input
                      type="password"
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm new password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" disabled={savingPassword || newPassword.length < 6}>
                    {savingPassword ? <Loader2 className="animate-spin" size={16} /> : null}
                    Update password
                  </Button>
                </form>
              </div>

              <div className="rounded-xl border bg-card">
                <div className="border-b px-5 py-4 flex items-center gap-2">
                  <Globe size={16} />
                  <h4>Active sessions</h4>
                </div>
                <div className="divide-y">
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                    <div>
                      <p className="flex items-center gap-2">
                        This browser
                        <Badge variant="secondary" className="text-xs py-0">
                          Current
                        </Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">Signed in as {user.username}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-5">
                <p className="mb-4 flex items-center gap-2 text-sm">
                  <Shield size={16} /> Two-factor authentication
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account. 2FA is not enabled on the API
                  yet — this control is a UI placeholder.
                </p>
                <Button
                  variant="outline"
                  onClick={() => toast.message("2FA is not available yet")}
                >
                  Enable 2FA
                </Button>
              </div>
            </TabsContent>

            {/* ── Notifications ── */}
            <TabsContent value="notifications" className="space-y-3">
              <div className="rounded-xl border bg-card overflow-hidden">
                {(
                  [
                    {
                      key: "orders" as const,
                      label: "Order updates",
                      sub: "Shipping, delivery, and status changes",
                    },
                    {
                      key: "promos" as const,
                      label: "Promotions & deals",
                      sub: "Sales, discounts, and exclusive offers",
                    },
                    {
                      key: "restocks" as const,
                      label: "Restock alerts",
                      sub: "Notify me when wishlisted items come back",
                    },
                  ] as const
                ).map((n, i, arr) => (
                  <div
                    key={n.key}
                    className={`flex items-center justify-between gap-4 px-5 py-4 ${
                      i < arr.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.sub}</p>
                    </div>
                    <Switch
                      checked={notifications[n.key]}
                      onCheckedChange={(v) => {
                        setNotifications((prev) => {
                          const next = { ...prev, [n.key]: v };
                          try {
                            localStorage.setItem(notifKey(user.id), JSON.stringify(next));
                          } catch {
                            /* ignore */
                          }
                          return next;
                        });
                        toast.success(`${n.label} ${v ? "enabled" : "disabled"}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon size={16} className="text-muted-foreground" />
      </div>
      <p className="mt-2 text-xl tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

function StatMini({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon size={12} /> {label}
      </div>
      <p className="mt-1 text-sm tabular-nums">{value}</p>
    </div>
  );
}
