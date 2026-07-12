import { ReactNode, useEffect, useState } from "react";
import { Link, NavLink, useNavigate, Outlet } from "react-router";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  LayoutDashboard,
  LogOut,
  LogIn,
} from "lucide-react";
import { Categories } from "@/api/client";
import type { CategoryResponse } from "@/api/types";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

function CountBubble({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function StorefrontLayout() {
  const {
    cartCount,
    wishlist,
    user,
    isAuthenticated,
    isAdminUser,
    logout,
  } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navCats, setNavCats] = useState<CategoryResponse[]>([]);

  useEffect(() => {
    void Categories.rootsAll()
      .then((c) => setNavCats(c.slice(0, 5)))
      .catch(() =>
        Categories.listAll()
          .then((c) => setNavCats(c.slice(0, 5)))
          .catch(() => setNavCats([])),
      );
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={16} />
          </Button>

          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              L
            </span>
            <span className="tracking-tight">Ladux</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              All Laptops
            </NavLink>
            {navCats.map((c) => (
              <Link
                key={c.id}
                to={`/products?categoryId=${c.id}`}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={submitSearch}
            className="relative ml-auto hidden max-w-xs flex-1 md:block"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search laptops..."
              className="pl-9"
            />
          </form>

          <div className="flex items-center gap-1.5 md:ml-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="icon" className="relative">
              <Link to="/wishlist" aria-label="Wishlist">
                <Heart size={16} />
                <CountBubble n={wishlist.length} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon" className="relative">
              <Link to="/cart" aria-label="Cart">
                <ShoppingCart size={16} />
                <CountBubble n={cartCount} />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Account">
                  <User size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {isAuthenticated
                    ? user?.fullName || user?.username || "Account"
                    : "Guest"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist">Wishlist</Link>
                    </DropdownMenuItem>
                    {isAdminUser && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin">
                            <LayoutDashboard size={14} className="mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => void handleLogout()}>
                      <LogOut size={14} className="mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/login">
                      <LogIn size={14} className="mr-2" />
                      Sign in
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="border-b px-4 py-4 text-left">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
                L
              </span>
              Ladux
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 p-4">
            <form onSubmit={submitSearch} className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search laptops..."
                className="pl-9"
              />
            </form>
            <nav className="space-y-1">
              <Link
                to="/products"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm hover:bg-accent/50"
              >
                All Laptops
              </Link>
              {navCats.map((c) => (
                <Link
                  key={c.id}
                  to={`/products?categoryId=${c.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
            <div className="space-y-1 border-t pt-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-accent/50"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-accent/50"
                  >
                    My Orders
                  </Link>
                  {isAdminUser && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm hover:bg-accent/50"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent/50"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                L
              </span>
              <span>Ladux</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Premium laptops, expertly curated. Free shipping & 30-day returns.
            </p>
          </div>
          <FooterCol
            title="Shop"
            links={[
              { label: "All products", to: "/products" },
              ...navCats.map((c) => ({
                label: c.name,
                to: `/products?categoryId=${c.id}`,
              })),
            ]}
          />
          <FooterCol
            title="Support"
            links={[
              { label: "My orders", to: "/orders" },
              { label: "Account", to: "/account" },
              { label: "Wishlist", to: "/wishlist" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", to: "#" },
              { label: "Contact", to: "#" },
            ]}
          />
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © 2026 Ladux. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageShell({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
