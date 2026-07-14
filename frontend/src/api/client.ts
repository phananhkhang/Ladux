import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  BrandRequest,
  BrandResponse,
  CartItemRequest,
  CartQuantityRequest,
  CartResponse,
  CategoryRequest,
  CategoryResponse,
  CouponAdminRequest,
  CouponApplyRequest,
  CouponApplyResponse,
  CouponResponse,
  CustomerResponse,
  CustomerUpdateRequest,
  LoginRequest,
  LoginResponse,
  OrderRequest,
  OrderResponse,
  OrderStatus,
  OrderStatusUpdateRequest,
  Page,
  PageParams,
  PaymentCallbackResponse,
  PaymentCreateRequest,
  ProductRequest,
  ProductResponse,
  ProductSupplierRequest,
  ProductSupplierResponse,
  PurchaseOrderCreateRequest,
  PurchaseOrderReceiveRequest,
  PurchaseOrderResponse,
  PurchaseOrderStatus,
  PurchaseOrderStatusUpdateRequest,
  RegisterRequest,
  ReviewCreateRequest,
  ReviewResponse,
  StockMovementRequest,
  StockMovementResponse,
  SupplierRequest,
  SupplierResponse,
  UserAddressRequest,
  UserAddressResponse,
  UserAdminUpdateRequest,
  UserProfileUpdateRequest,
  UserResponse,
  WishlistRequest,
  WishlistResponse,
  UploadUrlResponse,
  ApiErrorBody,
  CustomerLevel,
} from "./types";

// ── Config ───────────────────────────────────────────────────────────────────

/** Backend origin (no /api/v1). Empty string = same origin via Vite proxy. */
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const API_BASE = `${API_ORIGIN.replace(/\/$/, "")}/api/v1`;

const ACCESS_TOKEN_KEY = "ladux_access_token";

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string | null) {
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorBody | undefined;
    if (data?.message) return data.message;
    if (typeof err.response?.data === "string") return err.response.data;
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// ── Axios instance ───────────────────────────────────────────────────────────

const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;
let refreshPromise: Promise<string | null> | null = null;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrfToken(): Promise<string> {
  const fromCookie = readCookie("XSRF-TOKEN");
  if (fromCookie) {
    csrfToken = fromCookie;
    return fromCookie;
  }
  if (csrfToken) return csrfToken;
  if (!csrfPromise) {
    csrfPromise = http
      .get<{ token: string }>("/auth/csrf")
      .then((res) => {
        csrfToken = res.data.token || readCookie("XSRF-TOKEN") || "";
        return csrfToken;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

const UNSAFE = new Set(["post", "put", "patch", "delete"]);

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? "get").toLowerCase();

  const token = getStoredAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (UNSAFE.has(method)) {
    try {
      const csrf = await ensureCsrfToken();
      if (csrf) config.headers["X-XSRF-TOKEN"] = csrf;
    } catch {
      /* proceed; backend may reject with clear CSRF message */
    }
  }

  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean; _retryAnonymous?: boolean })
      | undefined;
    if (!original || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Avoid infinite loop on auth endpoints
    const url = original.url ?? "";
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/register") ||
      url.includes("/auth/csrf")
    ) {
      return Promise.reject(error);
    }

    // Already tried refresh + anonymous — give up
    if (original._retryAnonymous) {
      return Promise.reject(error);
    }

    // 1) Try refresh once (shared across concurrent 401s)
    if (!original._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = http
            .post<LoginResponse>("/auth/refresh")
            .then((res) => {
              const t = res.data.accessToken;
              setStoredAccessToken(t);
              return t;
            })
            .catch(() => {
              setStoredAccessToken(null);
              return null;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const newToken = await refreshPromise;
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return http(original);
        }
      } catch {
        setStoredAccessToken(null);
      }
    }

    // 2) Refresh failed: for public catalog GETs only, retry once without Authorization.
    // Invalid AUTH_TOKEN cookie used to 401 even permitAll routes; backend clears the cookie
    // on that response, so the retry succeeds as anonymous. Skip protected routes (/users/me, cart, …).
    setStoredAccessToken(null);
    const method = (original.method ?? "get").toLowerCase();
    const isPublicCatalogGet =
      method === "get" &&
      (/\/products(?:\/|$|\?)/.test(url) ||
        /\/categories(?:\/|$|\?)/.test(url) ||
        /\/brands(?:\/|$|\?)/.test(url) ||
        /\/reviews(?:\/|$|\?)/.test(url));

    if (!isPublicCatalogGet) {
      return Promise.reject(error);
    }

    original._retryAnonymous = true;
    if (original.headers) {
      delete original.headers.Authorization;
      if (typeof original.headers.delete === "function") {
        original.headers.delete("Authorization");
      }
    }
    return http(original);
  },
);

function qs(params?: PageParams & Record<string, unknown>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) v.forEach((item) => sp.append(k, String(item)));
    else sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.get<T>(url, config);
  return res.data;
}

async function post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.post<T>(url, body, config);
  return res.data;
}

async function put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.put<T>(url, body, config);
  return res.data;
}

async function patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.patch<T>(url, body, config);
  return res.data;
}

async function del<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.delete<T>(url, config);
  return res.data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const Auth = {
  async csrf() {
    return ensureCsrfToken();
  },
  async login(body: LoginRequest) {
    const res = await post<LoginResponse>("/auth/login", body);
    setStoredAccessToken(res.accessToken);
    return res;
  },
  async register(body: RegisterRequest) {
    return post<UserResponse>("/auth/register", body);
  },
  async refresh() {
    const res = await post<LoginResponse>("/auth/refresh");
    setStoredAccessToken(res.accessToken);
    return res;
  },
  async logout() {
    try {
      await post<void>("/auth/logout");
    } finally {
      setStoredAccessToken(null);
      csrfToken = null;
    }
  },
  me() {
    return get<UserResponse>("/users/me");
  },
  updateMe(body: UserProfileUpdateRequest) {
    return put<UserResponse>("/users/me", body);
  },
  uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    return post<UserResponse>("/users/me/avatar", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  /** Google OAuth — full-page redirect (same origin via proxy). */
  googleLoginUrl() {
    return `${API_ORIGIN || ""}/oauth2/authorization/google`;
  },
};

// ── Products ─────────────────────────────────────────────────────────────────

export const Products = {
  list(params?: PageParams & { search?: string }) {
    return get<Page<ProductResponse>>(`/products${qs(params)}`);
  },
  listActive(params?: PageParams) {
    return get<Page<ProductResponse>>(`/products/active${qs(params)}`);
  },
  byId(id: number) {
    return get<ProductResponse>(`/products/${id}`);
  },
  byBrand(brandId: number, params?: PageParams) {
    return get<Page<ProductResponse>>(`/products/brand/${brandId}${qs(params)}`);
  },
  byCategory(categoryId: number, params?: PageParams) {
    return get<Page<ProductResponse>>(`/products/category/${categoryId}${qs(params)}`);
  },
  /** Backend has service-level slug lookup but no public route — resolve via search/list. */
  async bySlug(slug: string): Promise<ProductResponse> {
    if (/^\d+$/.test(slug)) return Products.byId(Number(slug));

    const searchTerm = slug.replace(/-/g, " ");
    const page = await Products.list({ search: searchTerm, size: 50 });
    let hit = page.content.find((p) => p.slug === slug);
    if (!hit) {
      const all = await Products.listActive({ size: 50 });
      hit = all.content.find((p) => p.slug === slug);
    }
    if (!hit) throw new Error(`Product not found: ${slug}`);
    // Detail endpoint includes full image list
    return Products.byId(hit.id);
  },
  images(productId: number) {
    return get<import("./types").ProductImageResponse[]>(`/products/${productId}/images`);
  },
};

// ── Brands / Categories ──────────────────────────────────────────────────────
// Backend returns Spring Page (NOT a bare array) for list/roots endpoints.

/** Normalize Spring Page or accidental array into T[]. */
export function pageContent<T>(data: Page<T> | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.content ?? [];
}

export const Brands = {
  list(params?: PageParams) {
    return get<Page<BrandResponse>>(`/brands${qs(params)}`);
  },
  /** Convenience: all brands as array (fetches a large page). */
  async listAll(params?: PageParams): Promise<BrandResponse[]> {
    return pageContent(await Brands.list({ size: 50, ...params }));
  },
  byId(id: number) {
    return get<BrandResponse>(`/brands/${id}`);
  },
  bySlug(slug: string) {
    return get<BrandResponse>(`/brands/slug/${slug}`);
  },
};

export const Categories = {
  list(params?: PageParams) {
    return get<Page<CategoryResponse>>(`/categories${qs(params)}`);
  },
  roots(params?: PageParams) {
    return get<Page<CategoryResponse>>(`/categories/roots${qs(params)}`);
  },
  async listAll(params?: PageParams): Promise<CategoryResponse[]> {
    return pageContent(await Categories.list({ size: 50, ...params }));
  },
  async rootsAll(params?: PageParams): Promise<CategoryResponse[]> {
    return pageContent(await Categories.roots({ size: 50, ...params }));
  },
  byId(id: number) {
    return get<CategoryResponse>(`/categories/${id}`);
  },
};

// ── Reviews ──────────────────────────────────────────────────────────────────

export const Reviews = {
  byProduct(productId: number, params?: PageParams) {
    return get<Page<ReviewResponse>>(`/reviews/product/${productId}${qs(params)}`);
  },
  create(body: ReviewCreateRequest) {
    return post<ReviewResponse>("/reviews", body);
  },
  update(reviewId: number, body: { rating?: number; comment?: string }) {
    return put<ReviewResponse>(`/reviews/${reviewId}`, body);
  },
  remove(reviewId: number) {
    return del(`/reviews/${reviewId}`);
  },
};

// ── Cart ─────────────────────────────────────────────────────────────────────
// Backend mutations return empty bodies (201/204). Always re-GET cart after write.

export const Cart = {
  get() {
    return get<CartResponse>("/cart");
  },
  async add(body: CartItemRequest) {
    await post<void>("/cart/items", body);
    return get<CartResponse>("/cart");
  },
  async updateQuantity(productId: number, body: CartQuantityRequest) {
    await put<void>(`/cart/items/${productId}`, body);
    return get<CartResponse>("/cart");
  },
  async remove(productId: number) {
    await del<void>(`/cart/items/${productId}`);
    return get<CartResponse>("/cart");
  },
  clear() {
    return del<void>("/cart");
  },
};

// ── Wishlist ─────────────────────────────────────────────────────────────────

export const Wishlist = {
  list() {
    return get<WishlistResponse[]>("/wishlists");
  },
  add(body: WishlistRequest) {
    return post<WishlistResponse>("/wishlists", body);
  },
  remove(productId: number) {
    return del(`/wishlists/${productId}`);
  },
};

// ── Orders ───────────────────────────────────────────────────────────────────

export const Orders = {
  mine(params?: PageParams) {
    return get<Page<OrderResponse>>(`/orders/user${qs(params)}`);
  },
  byId(orderId: number) {
    return get<OrderResponse>(`/orders/${orderId}`);
  },
  create(body: OrderRequest) {
    return post<OrderResponse>("/orders", body);
  },
  retryPayment(orderId: number) {
    return post<PaymentCallbackResponse>(`/orders/${orderId}/payments/retry`);
  },
};

// ── Payments ─────────────────────────────────────────────────────────────────

export const Payments = {
  mine(params?: PageParams) {
    return get<Page<PaymentCallbackResponse>>(`/payments/my${qs(params)}`);
  },
  byOrder(orderId: number) {
    return get<PaymentCallbackResponse[]>(`/payments/my/order/${orderId}`);
  },
  create(body: PaymentCreateRequest) {
    return post<PaymentCallbackResponse>("/payments", body);
  },
};

// ── Addresses ────────────────────────────────────────────────────────────────

export const Addresses = {
  mine() {
    return get<UserAddressResponse[]>("/user-addresses/user");
  },
  default() {
    return get<UserAddressResponse>("/user-addresses/default");
  },
  byId(id: number) {
    return get<UserAddressResponse>(`/user-addresses/${id}`);
  },
  create(body: UserAddressRequest) {
    return post<UserAddressResponse>("/user-addresses", body);
  },
  update(id: number, body: UserAddressRequest) {
    return put<UserAddressResponse>(`/user-addresses/${id}`, body);
  },
  remove(id: number) {
    return del(`/user-addresses/${id}`);
  },
};

// ── Coupons ──────────────────────────────────────────────────────────────────

export const Coupons = {
  apply(body: CouponApplyRequest) {
    return post<CouponApplyResponse>("/coupons/apply", body);
  },
};

// ── Admin ────────────────────────────────────────────────────────────────────

export const AdminProducts = {
  create(body: ProductRequest) {
    return post<ProductResponse>("/admin/products", body);
  },
  update(id: number, body: ProductRequest) {
    return put<ProductResponse>(`/admin/products/${id}`, body);
  },
  remove(id: number) {
    return del(`/admin/products/${id}`);
  },
  addImages(productId: number, imageUrls: string[]) {
    return post(`/admin/products/${productId}/images`, imageUrls);
  },
  uploadImages(productId: number, files: File[]) {
    const fd = new FormData();
    for (const file of files) {
      // Same part name as @RequestPart("file") — Spring accepts multiple parts
      fd.append("file", file);
    }
    return post<import("./types").ProductImageResponse[]>(
      `/admin/products/${productId}/images/upload`,
      fd,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
  removeImage(productId: number, imageId: number) {
    return del(`/admin/products/${productId}/images/${imageId}`);
  },
};

export const AdminOrders = {
  list(params?: PageParams) {
    return get<Page<OrderResponse>>(`/admin/orders${qs(params)}`);
  },
  byStatus(status: OrderStatus, params?: PageParams) {
    return get<Page<OrderResponse>>(`/admin/orders/status/${status}${qs(params)}`);
  },
  updateStatus(orderId: number, body: OrderStatusUpdateRequest) {
    return patch<OrderResponse>(`/admin/orders/${orderId}/status`, body);
  },
};

export const AdminCustomers = {
  list(params?: PageParams) {
    return get<Page<CustomerResponse>>(`/admin/customers${qs(params)}`);
  },
  search(q: string, params?: PageParams) {
    return get<Page<CustomerResponse>>(`/admin/customers/search${qs({ q, ...params })}`);
  },
  byLevel(level: CustomerLevel, params?: PageParams) {
    return get<Page<CustomerResponse>>(`/admin/customers/level/${level}${qs(params)}`);
  },
  byId(id: number) {
    return get<CustomerResponse>(`/admin/customers/${id}`);
  },
  update(id: number, body: CustomerUpdateRequest) {
    return put<CustomerResponse>(`/admin/customers/${id}`, body);
  },
};

export const AdminUsers = {
  list(params?: PageParams) {
    return get<Page<UserResponse>>(`/admin/users${qs(params)}`);
  },
  active(params?: PageParams) {
    return get<Page<UserResponse>>(`/admin/users/active${qs(params)}`);
  },
  byId(id: number) {
    return get<UserResponse>(`/admin/users/${id}`);
  },
  update(id: number, body: UserAdminUpdateRequest) {
    return put<UserResponse>(`/admin/users/${id}`, body);
  },
  remove(id: number) {
    return del(`/admin/users/${id}`);
  },
};

export const AdminBrands = {
  create(body: BrandRequest) {
    return post<BrandResponse>("/admin/brands", body);
  },
  update(id: number, body: BrandRequest) {
    return put<BrandResponse>(`/admin/brands/${id}`, body);
  },
  remove(id: number) {
    return del(`/admin/brands/${id}`);
  },
};

export const AdminCategories = {
  create(body: CategoryRequest) {
    return post<CategoryResponse>("/admin/categories", body);
  },
  update(id: number, body: CategoryRequest) {
    return put<CategoryResponse>(`/admin/categories/${id}`, body);
  },
  remove(id: number) {
    return del(`/admin/categories/${id}`);
  },
  /**
   * Upload category image → { url: "/uploads/categories/..." }.
   * Attach via create/update JSON imageUrl. Do not force Content-Type without boundary.
   */
  uploadImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    return post<UploadUrlResponse>("/admin/categories/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const AdminCoupons = {
  list(params?: PageParams) {
    return get<Page<CouponResponse>>(`/admin/coupons${qs(params)}`);
  },
  byId(id: number) {
    return get<CouponResponse>(`/admin/coupons/${id}`);
  },
  byCode(code: string) {
    return get<CouponResponse>(`/admin/coupons/code/${code}`);
  },
  create(body: CouponAdminRequest) {
    return post<CouponResponse>("/admin/coupons", body);
  },
  update(id: number, body: CouponAdminRequest) {
    return put<CouponResponse>(`/admin/coupons/${id}`, body);
  },
  remove(id: number) {
    return del(`/admin/coupons/${id}`);
  },
};

export const AdminReviews = {
  list(params?: PageParams) {
    return get<Page<ReviewResponse>>(`/admin/reviews${qs(params)}`);
  },
};

export const AdminPayments = {
  list(params?: PageParams) {
    return get<Page<PaymentCallbackResponse>>(`/admin/payments${qs(params)}`);
  },
  byOrder(orderId: number) {
    return get<PaymentCallbackResponse[]>(`/admin/payments/order/${orderId}`);
  },
  byId(id: number) {
    return get<PaymentCallbackResponse>(`/admin/payments/${id}`);
  },
};

export const AdminSuppliers = {
  list(params?: PageParams) {
    return get<Page<SupplierResponse>>(`/admin/suppliers${qs(params)}`);
  },
  active() {
    return get<SupplierResponse[]>("/admin/suppliers/active");
  },
  byId(id: number) {
    return get<SupplierResponse>(`/admin/suppliers/${id}`);
  },
  search(q: string) {
    return get<SupplierResponse[]>(`/admin/suppliers/search${qs({ q })}`);
  },
  create(body: SupplierRequest) {
    return post<SupplierResponse>("/admin/suppliers", body);
  },
  update(id: number, body: SupplierRequest) {
    return put<SupplierResponse>(`/admin/suppliers/${id}`, body);
  },
  remove(id: number) {
    return del(`/admin/suppliers/${id}`);
  },
};

export const AdminProductSuppliers = {
  byProduct(productId: number) {
    return get<ProductSupplierResponse[]>(`/admin/product-suppliers/product/${productId}`);
  },
  bySupplier(supplierId: number) {
    return get<ProductSupplierResponse[]>(`/admin/product-suppliers/supplier/${supplierId}`);
  },
  create(body: ProductSupplierRequest) {
    return post<ProductSupplierResponse>("/admin/product-suppliers", body);
  },
  update(id: number, body: ProductSupplierRequest) {
    return put<ProductSupplierResponse>(`/admin/product-suppliers/${id}`, body);
  },
  remove(id: number) {
    return del(`/admin/product-suppliers/${id}`);
  },
};

export const AdminPurchaseOrders = {
  list(params?: PageParams) {
    return get<Page<PurchaseOrderResponse>>(`/admin/purchase-orders${qs(params)}`);
  },
  byStatus(status: PurchaseOrderStatus, params?: PageParams) {
    return get<Page<PurchaseOrderResponse>>(`/admin/purchase-orders/status/${status}${qs(params)}`);
  },
  byId(id: number) {
    return get<PurchaseOrderResponse>(`/admin/purchase-orders/${id}`);
  },
  create(body: PurchaseOrderCreateRequest) {
    return post<PurchaseOrderResponse>("/admin/purchase-orders", body);
  },
  updateStatus(id: number, body: PurchaseOrderStatusUpdateRequest) {
    return patch<PurchaseOrderResponse>(`/admin/purchase-orders/${id}/status`, body);
  },
  receive(id: number, body: PurchaseOrderReceiveRequest) {
    return post<PurchaseOrderResponse>(`/admin/purchase-orders/${id}/receive`, body);
  },
};

export const AdminStockMovements = {
  list(params?: PageParams) {
    return get<Page<StockMovementResponse>>(`/admin/stock-movements${qs(params)}`);
  },
  byProduct(productId: number, params?: PageParams) {
    return get<Page<StockMovementResponse>>(`/admin/stock-movements/product/${productId}${qs(params)}`);
  },
  adjust(body: StockMovementRequest) {
    return post<StockMovementResponse>("/admin/stock-movements/adjustments", body);
  },
};

export { http, API_BASE, API_ORIGIN };
