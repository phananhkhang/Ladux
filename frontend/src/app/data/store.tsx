import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import {
  Auth,
  Cart as CartApi,
  Wishlist as WishlistApi,
  getApiErrorMessage,
} from "@/api/client";
import type {
  CartItemResponse,
  CartResponse,
  ProductResponse,
  UserResponse,
  WishlistResponse,
} from "@/api/types";
import { isAdmin } from "@/lib/format";

// -----------------------------------------------------------------------------
// Global store: theme + auth + cart + wishlist (backed by Spring REST API)
// -----------------------------------------------------------------------------

export interface CartLine {
  id: number;
  product: ProductResponse;
  quantity: number;
}

interface StoreValue {
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Auth
  user: UserResponse | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  isAdminUser: boolean;
  /** Returns the signed-in user so callers can redirect after state is committed. */
  login: (username: string, password: string) => Promise<UserResponse>;
  register: (data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<UserResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // Cart
  cart: CartLine[];
  cartLoading: boolean;
  cartCount: number;
  cartTotal: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;

  // Wishlist
  wishlist: WishlistResponse[];
  wishlistIds: number[];
  wishlistLoading: boolean;
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

function mapCart(cart: CartResponse | null): CartLine[] {
  if (!cart?.items?.length) return [];
  return cart.items.map((item: CartItemResponse) => ({
    id: item.id,
    product: item.product,
    quantity: item.quantity,
  }));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return (localStorage.getItem("ladux_theme") as "light" | "dark") || "light";
    } catch {
      return "light";
    }
  });

  const [user, setUser] = useState<UserResponse | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  const [wishlist, setWishlist] = useState<WishlistResponse[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("ladux_theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    setCartLoading(true);
    try {
      const data = await CartApi.get();
      setCart(mapCart(data));
    } catch {
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setWishlistLoading(true);
    try {
      const data = await WishlistApi.list();
      setWishlist(data ?? []);
    } catch {
      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const me = await Auth.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  // Hydrate session on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAuthLoading(true);
      try {
        await Auth.csrf().catch(() => null);
        const me = await Auth.me();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load cart/wishlist when user changes
  useEffect(() => {
    if (user) {
      void refreshCart();
      void refreshWishlist();
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user, refreshCart, refreshWishlist]);

  const value = useMemo<StoreValue>(() => {
    const cartCount = cart.reduce((n, l) => n + l.quantity, 0);
    const cartTotal = cart.reduce((sum, l) => {
      const price = Number(l.product.discountPrice ?? l.product.basePrice);
      return sum + price * l.quantity;
    }, 0);

    const wishlistIds = wishlist.map((w) => w.product.id);

    return {
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),

      user,
      authLoading,
      isAuthenticated: !!user,
      isAdminUser: isAdmin(user?.roles),
      login: async (username, password) => {
        await Auth.login({ username, password });
        const me = await Auth.me();
        // Commit user before login() resolves so /admin guard sees ADMIN immediately
        flushSync(() => {
          setUser(me);
        });
        return me;
      },
      register: async (data) => {
        await Auth.register(data);
        await Auth.login({ username: data.username, password: data.password });
        const me = await Auth.me();
        flushSync(() => {
          setUser(me);
        });
        return me;
      },
      logout: async () => {
        try {
          await Auth.logout();
        } finally {
          flushSync(() => {
            setUser(null);
            setCart([]);
            setWishlist([]);
          });
        }
      },
      refreshUser,

      cart,
      cartLoading,
      cartCount,
      cartTotal,
      refreshCart,
      addToCart: async (productId, quantity = 1) => {
        if (!user) throw new Error("Please sign in to add items to cart");
        const data = await CartApi.add({ productId, quantity });
        setCart(mapCart(data));
      },
      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          const data = await CartApi.remove(productId);
          setCart(mapCart(data));
          return;
        }
        const data = await CartApi.updateQuantity(productId, { quantity });
        setCart(mapCart(data));
      },
      removeFromCart: async (productId) => {
        const data = await CartApi.remove(productId);
        setCart(mapCart(data));
      },
      clearCart: async () => {
        await CartApi.clear();
        // clear() is 204 empty — reload so local state stays consistent
        try {
          const data = await CartApi.get();
          setCart(mapCart(data));
        } catch {
          setCart([]);
        }
      },

      wishlist,
      wishlistIds,
      wishlistLoading,
      refreshWishlist,
      toggleWishlist: async (productId) => {
        if (!user) throw new Error("Please sign in to use wishlist");
        const exists = wishlistIds.includes(productId);
        if (exists) {
          await WishlistApi.remove(productId);
        } else {
          await WishlistApi.add({ productId });
        }
        const data = await WishlistApi.list();
        setWishlist(data ?? []);
      },
      isWishlisted: (productId) => wishlistIds.includes(productId),
    };
  }, [
    theme,
    user,
    authLoading,
    cart,
    cartLoading,
    wishlist,
    wishlistLoading,
    refreshCart,
    refreshWishlist,
    refreshUser,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { getApiErrorMessage };
