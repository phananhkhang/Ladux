import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, User, Menu, X, Heart, LogOut, Package, ChevronDown } from "lucide-react";
import { useAuthStore, useCartStore, useUIStore, useWishlistStore } from "../lib/store";
import { Button } from "./ui/button";
import type { UserResponse } from "../types/api";

interface NavItem {
  to: string;
  label: string;
  desc?: string;
  submenu?: NavItem[];
}

const SHOP_SUB: NavItem[] = [
  { to: "/shop",       label: "Tất cả sản phẩm", desc: "Toàn bộ catalog laptop" },
  { to: "/shop?cat=1", label: "Gaming",          desc: "RTX 4080 / 4090 · 240Hz" },
  { to: "/shop?cat=3", label: "Creator",         desc: "OLED · Color-grade ready" },
  { to: "/shop?cat=4", label: "Business",        desc: "Ultraportable · 36h pin" },
];

const NAV: NavItem[] = [
  { to: "/",         label: "Trang chủ" },
  { to: "/shop",     label: "Cửa hàng", submenu: SHOP_SUB },
  { to: "/about",    label: "Về AuraTech" },
  { to: "/contact",  label: "Liên hệ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [shopHover, setShopHover] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const { setCartOpen, mobileNavOpen, setMobileNavOpen } = useUIStore();
  const cartCount = cartItems.reduce((a, b) => a + b.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileNavOpen(false); }, [location.pathname, setMobileNavOpen]);

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  return (
    <>
      <header
        className={
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 " +
          (scrolled
            ? "bg-black/70 backdrop-blur-2xl border-b border-white/10"
            : "bg-transparent border-b border-transparent")
        }
        data-testid="site-header"
      >
        <div className="section-pad h-16 md:h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="logo-link">
            <span className="relative inline-flex items-center justify-center h-9 w-9 rounded-xl bg-neon/10 border border-neon/40">
              <span className="absolute inset-0 rounded-xl blur-md bg-neon/30" />
              <span className="relative font-display font-bold text-neon text-lg leading-none">A</span>
            </span>
            <span className="font-display tracking-tight text-lg md:text-xl text-white">
              Aura<span className="text-neon">Tech</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => {
              if (n.submenu) {
                return (
                  <div
                    key={n.label}
                    className="relative"
                    onMouseEnter={() => setShopHover(true)}
                    onMouseLeave={() => setShopHover(false)}
                  >
                    <NavLink
                      to={n.to}
                      className={({ isActive }) =>
                        "px-4 py-2 rounded-full text-sm tracking-tight transition-colors inline-flex items-center gap-1 " +
                        (isActive ? "text-white bg-white/5" : "text-zinc-400 hover:text-white")
                      }
                      data-testid={`nav-${n.label}`}
                    >
                      {n.label}
                      <ChevronDown size={12} className={"transition-transform " + (shopHover ? "rotate-180" : "")} />
                    </NavLink>
                    <AnimatePresence>
                      {shopHover && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[340px]"
                          data-testid="shop-submenu"
                        >
                          <div className="glass rounded-2xl p-2">
                            {n.submenu.map((s) => (
                              <Link
                                key={s.label}
                                to={s.to}
                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition group"
                                data-testid={`submenu-${s.label}`}
                              >
                                <span className="h-9 w-9 rounded-lg bg-neon/10 border border-neon/30 mt-0.5 flex items-center justify-center text-neon text-xs font-display group-hover:bg-neon group-hover:text-black transition">
                                  {s.label.charAt(0)}
                                </span>
                                <span className="flex-1">
                                  <span className="block text-sm text-white font-medium">{s.label}</span>
                                  <span className="block text-xs text-zinc-500 mt-0.5">{s.desc}</span>
                                </span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <NavLink
                  key={n.label}
                  to={n.to}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    "px-4 py-2 rounded-full text-sm tracking-tight transition-colors " +
                    (isActive ? "text-white bg-white/5" : "text-zinc-400 hover:text-white")
                  }
                  data-testid={`nav-${n.label}`}
                >
                  {n.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Tìm kiếm"
              data-testid="search-toggle-btn"
            >
              <Search size={18} />
            </button>

            <Link
              to="/wishlist"
              className="relative h-10 w-10 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Yêu thích"
              data-testid="wishlist-link"
            >
              <Heart size={18} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 text-[10px] font-semibold rounded-full bg-neon text-black flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative h-10 w-10 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Giỏ hàng"
              data-testid="cart-toggle-btn"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 text-[10px] font-semibold rounded-full bg-neon text-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <Link to="/login" className="hidden md:block ml-1" data-testid="login-link">
                <Button size="sm" variant="primary">Đăng nhập</Button>
              </Link>
            )}

            <button
              className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-full text-white hover:bg-white/5"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Menu"
              data-testid="mobile-nav-toggle"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search panel */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              onSubmit={submitSearch}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="section-pad pb-4"
              data-testid="search-form"
            >
              <div className="flex items-center gap-2 bg-zinc-950 border border-white/10 rounded-2xl px-4 h-14">
                <Search size={18} className="text-zinc-500" />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Tìm laptop, brand hoặc SKU..."
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-600"
                  data-testid="search-input"
                />
                <Button type="submit" size="sm" data-testid="search-submit-btn">Tìm</Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden pt-20"
            onClick={() => setMobileNavOpen(false)}
            data-testid="mobile-nav-drawer"
          >
            <div
              className="bg-black/95 backdrop-blur-2xl border-b border-white/10 px-6 py-8"
              onClick={(e) => e.stopPropagation()}
            >
              {NAV.map((n) => (
                <div key={n.label}>
                  <Link
                    to={n.to}
                    onClick={() => setMobileNavOpen(false)}
                    className="block py-3 text-lg font-display text-white border-b border-white/5"
                  >
                    {n.label}
                  </Link>
                  {n.submenu && (
                    <div className="pl-4 pb-2">
                      {n.submenu.map((s) => (
                        <Link
                          key={s.label}
                          to={s.to}
                          onClick={() => setMobileNavOpen(false)}
                          className="block py-2 text-sm text-zinc-400 hover:text-neon"
                        >
                          → {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {!user && (
                <Link to="/login" onClick={() => setMobileNavOpen(false)} className="block pt-4">
                  <Button className="w-full">Đăng nhập</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface UserMenuProps {
  user: UserResponse;
  onLogout: () => void;
}

function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-10 px-3 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 hover:border-neon/50 transition"
        data-testid="user-menu-btn"
      >
        <span className="h-6 w-6 rounded-full bg-neon/15 border border-neon/40 flex items-center justify-center">
          <User size={12} className="text-neon" />
        </span>
        <span className="hidden md:block text-sm text-white max-w-[110px] truncate">{user.fullName?.split(" ")[0] || user.email}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 mt-2 w-56 glass rounded-2xl p-2 z-50"
            onMouseLeave={() => setOpen(false)}
            data-testid="user-menu-dropdown"
          >
            <div className="px-3 py-3 border-b border-white/10 mb-1">
              <div className="text-sm text-white font-medium truncate">{user.fullName}</div>
              <div className="text-xs text-zinc-500 truncate">{user.email}</div>
            </div>
            <Link to="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl">
              <Package size={14} /> Đơn hàng của tôi
            </Link>
            <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl">
              <Heart size={14} /> Yêu thích
            </Link>
            <button onClick={() => { setOpen(false); onLogout(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 rounded-xl" data-testid="logout-btn">
              <LogOut size={14} /> Đăng xuất
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
