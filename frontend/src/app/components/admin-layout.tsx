import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Laptop,
  ShoppingBag,
  Users,
  UserCog,
  Ticket,
  FolderTree,
  Tags,
  Star,
  CreditCard,
  Truck,
  ClipboardList,
  ArrowLeftRight,
  Search,
  LogOut,
  Store,
  Menu,
  Loader2,
} from "lucide-react";
import { useStore } from "../data/store";
import { ThemeToggle } from "./shared";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

const NAV = [
  {
    section: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    section: "Catalog",
    items: [
      { to: "/admin/products", label: "Products", icon: Laptop },
      { to: "/admin/categories", label: "Categories", icon: FolderTree },
      { to: "/admin/brands", label: "Brands", icon: Tags },
      { to: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    section: "Sales",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { to: "/admin/customers", label: "Customers", icon: Users },
      { to: "/admin/coupons", label: "Coupons", icon: Ticket },
      { to: "/admin/payments", label: "Payments", icon: CreditCard },
      { to: "/admin/users", label: "Users", icon: UserCog },
    ],
  },
  {
    section: "Supply Chain",
    items: [
      { to: "/admin/suppliers", label: "Suppliers", icon: Truck },
      { to: "/admin/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
      { to: "/admin/stock-movements", label: "Stock Movements", icon: ArrowLeftRight },
    ],
  },
];

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {NAV.map((group) => (
        <div key={group.section} className="mb-4">
          <p className="px-3 pb-1 text-xs uppercase tracking-wider text-muted-foreground">
            {group.section}
          </p>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : false}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function pageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  const map: Record<string, string> = {
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    users: "Users",
    coupons: "Coupons",
    categories: "Categories",
    brands: "Brands",
    reviews: "Reviews",
    payments: "Payments",
    suppliers: "Suppliers",
    "purchase-orders": "Purchase Orders",
    "stock-movements": "Stock Movements",
  };
  const seg = pathname.replace("/admin/", "").split("/")[0];
  return map[seg] ?? "Admin";
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, authLoading, isAuthenticated, isAdminUser, logout } = useStore();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname || "/admin")}`, {
        replace: true,
      });
    }
    // Non-admin: stay on a clear "Access denied" screen (do not silent-redirect home)
  }, [authLoading, isAuthenticated, navigate, location.pathname]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <h1 className="text-xl tracking-tight">Access denied</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Tài khoản <b>{user?.username}</b> không có quyền ADMIN.
          <br />
          Đăng nhập bằng <b>admin</b> / <b>Admin@123</b> (dev seed).
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
          <Button
            onClick={async () => {
              await logout();
              navigate("/login?redirect=/admin", { replace: true });
            }}
          >
            Đăng nhập lại
          </Button>
        </div>
      </div>
    );
  }

  const initials = (user?.fullName || user?.username || "AD")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            L
          </span>
          <span className="tracking-tight">
            Ladux <span className="text-muted-foreground">Admin</span>
          </span>
        </div>
        <AdminNav />
        <div className="border-t p-3">
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <Store size={16} />
              View Storefront
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b px-6 py-4 text-left">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                L
              </span>
              Ladux Admin
            </SheetTitle>
          </SheetHeader>
          <div className="flex h-[calc(100%-4rem)] flex-col">
            <AdminNav onNavigate={() => setMobileOpen(false)} />
            <div className="border-t p-3">
              <Button asChild variant="outline" className="w-full">
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  <Store size={16} />
                  View Storefront
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:px-8">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={16} />
          </Button>
          <div className="hidden text-sm text-muted-foreground sm:block lg:hidden">
            {pageTitle(location.pathname)}
          </div>
          <div className="relative max-w-md flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              placeholder="Search orders, products, customers..."
              className="pl-9"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent/50">
                  <Avatar className="size-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.fullName || user?.username || "Admin"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleLogout()}>
                  <LogOut size={14} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
