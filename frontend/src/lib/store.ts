import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Auth, Cart, Wishlist } from "../api/client";
import type {
  CartLine,
  Id,
  RegisterRequest,
  UserResponse,
  WishlistResponse,
} from "../types/api";

const USER_SNAPSHOT_KEY = "auratech_user_snapshot";

type WishlistLine = WishlistResponse;

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  login: (username: string, password: string) => Promise<UserResponse>;
  register: (body: RegisterRequest) => Promise<UserResponse>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

interface CartState {
  items: CartLine[];
  totalPrice: number;
  refresh: () => Promise<void>;
  add: (productId: Id, quantity?: number) => Promise<void>;
  update: (productId: Id, quantity: number) => Promise<void>;
  remove: (productId: Id) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
}

interface WishlistState {
  items: WishlistLine[];
  refresh: () => Promise<void>;
  toggle: (productId: Id) => Promise<void>;
  isWished: (productId: Id) => boolean;
  reset: () => void;
}

interface UIState {
  cartOpen: boolean;
  setCartOpen: (value: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (value: boolean) => void;
}

const toCartLines = (items: Array<CartLine | { product: CartLine["product"] | null }>): CartLine[] =>
  items.filter((item): item is CartLine => Boolean(item.product));

const createSessionUser = (username: string): UserResponse => ({
  id: 0,
  email: username.includes("@") ? username : `${username}@auratech.local`,
  fullName: username,
  phone: null,
  avatar: null,
  isActive: true,
  active: true,
  createdAt: new Date().toISOString(),
  roles: [],
});

const saveUserSnapshot = (user: UserResponse) => {
  localStorage.setItem(USER_SNAPSHOT_KEY, JSON.stringify(user));
};

const readUserSnapshot = (): UserResponse | null => {
  const raw = localStorage.getItem(USER_SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    localStorage.removeItem(USER_SNAPSHOT_KEY);
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: async (username, password) => {
        const { accessToken } = await Auth.login({ username, password });
        localStorage.setItem("auratech_token", accessToken);
        set({ token: accessToken });

        let user = createSessionUser(username);
        try {
          user = await Auth.me();
        } catch {
          // Current backend returns only a JWT; keep a typed local session snapshot for the UI.
        }

        saveUserSnapshot(user);
        set({ user });
        await useCartStore.getState().refresh();
        await useWishlistStore.getState().refresh();
        return user;
      },
      register: async (body) => {
        await Auth.register(body);
        return get().login(body.username, body.password);
      },
      logout: () => {
        localStorage.removeItem("auratech_token");
        localStorage.removeItem(USER_SNAPSHOT_KEY);
        set({ token: null, user: null });
        useCartStore.getState().reset();
        useWishlistStore.getState().reset();
      },
      hydrate: async () => {
        const token = localStorage.getItem("auratech_token");
        if (!token) return;

        let user = readUserSnapshot();
        try {
          user = await Auth.me();
          saveUserSnapshot(user);
        } catch {
          if (!user) {
            localStorage.removeItem("auratech_token");
            set({ token: null, user: null });
            return;
          }
        }

        set({ token, user });
        await useCartStore.getState().refresh();
        await useWishlistStore.getState().refresh();
      },
    }),
    { name: "auratech-auth", partialize: () => ({}) }
  )
);

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  totalPrice: 0,
  refresh: async () => {
    try {
      const cart = await Cart.get();
      set({ items: toCartLines(cart.items ?? []), totalPrice: cart.totalPrice || 0 });
    } catch {
      set({ items: [], totalPrice: 0 });
    }
  },
  add: async (productId, quantity = 1) => {
    await Cart.add(productId, quantity);
    await get().refresh();
  },
  update: async (productId, quantity) => {
    await Cart.update(productId, quantity);
    await get().refresh();
  },
  remove: async (productId) => {
    await Cart.remove(productId);
    await get().refresh();
  },
  clear: async () => {
    await Cart.clear();
    set({ items: [], totalPrice: 0 });
  },
  reset: () => set({ items: [], totalPrice: 0 }),
}));

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  refresh: async () => {
    try {
      const list = await Wishlist.get();
      set({ items: list || [] });
    } catch {
      set({ items: [] });
    }
  },
  toggle: async (productId) => {
    const exists = get().items.some((item) => item.product?.id === productId || item.id === productId);
    if (exists) await Wishlist.remove(productId);
    else await Wishlist.add(productId);
    await get().refresh();
  },
  isWished: (productId) =>
    get().items.some((item) => item.product?.id === productId || item.id === productId),
  reset: () => set({ items: [] }),
}));

export const useUIStore = create<UIState>()((set) => ({
  cartOpen: false,
  setCartOpen: (value) => set({ cartOpen: value }),
  mobileNavOpen: false,
  setMobileNavOpen: (value) => set({ mobileNavOpen: value }),
}));
