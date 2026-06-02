import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  ApiPage,
  BrandResponse,
  CartResponse,
  CategoryResponse,
  Id,
  LoginRequest,
  LoginResponse,
  OrderRequest,
  OrderResponse,
  PageQuery,
  ProductQuery,
  ProductResponse,
  RegisterRequest,
  ReviewCreateRequest,
  ReviewQuery,
  ReviewResponse,
  ReviewUpdateRequest,
  UserAddressRequest,
  UserAddressResponse,
  UserResponse,
  WishlistResponse,
} from "../types/api";

const DEFAULT_API_BASE_URL = "http://localhost:8080";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const apiRoot = stripTrailingSlash(
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
);

export const apiBaseURL = `${apiRoot}/api/v1`;

interface ApiErrorBody {
  status?: number;
  error?: string;
  message?: string;
  detail?: string;
  timestamp?: string;
}

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 20000,
  withCredentials: true,
});

const readCookie = (name: string) => {
  const encodedName = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(encodedName))
    ?.slice(encodedName.length);
};

const unsafeMethods = new Set(["post", "put", "patch", "delete"]);
let csrfRequest: Promise<void> | null = null;

const ensureCsrfCookie = async () => {
  if (readCookie("XSRF-TOKEN")) return;
  csrfRequest ??= axios
    .get(`${apiBaseURL}/auth/csrf`, { withCredentials: true })
    .then(() => undefined)
    .finally(() => {
      csrfRequest = null;
    });
  await csrfRequest;
};

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = config.method?.toLowerCase();
  if (method && unsafeMethods.has(method)) {
    await ensureCsrfCookie();
    const csrfToken = readCookie("XSRF-TOKEN");
    if (csrfToken) {
      config.headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error)
);

const unwrap = <T>(request: Promise<{ data: T }>) => request.then((response) => response.data);

const normalizeOrder = (order: OrderResponse): OrderResponse => ({
  ...order,
  items: order.items ?? order.orderItems ?? [],
});

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;
  // Per requirement: always prefer error.response.data.message for user-facing messages
  const data = error.response?.data;
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;
  if (data?.error) return data.error;
  return fallback;
};

export default api;

// ============ PUBLIC / USER APIs (match backend controllers exactly) ============

export const Products = {
  list: (params?: ProductQuery) => unwrap<ApiPage<ProductResponse>>(api.get("/products", { params })),
  // Use /active (guaranteed simple path in backend, no custom search query) to ensure seed data from docker postgres loads reliably in UI lists
  listActive: (params?: ProductQuery) => unwrap<ApiPage<ProductResponse>>(api.get("/products/active", { params })),
  byId: (id: Id) => unwrap<ProductResponse>(api.get(`/products/${id}`)),
  bySlug: (slug: string) => unwrap<ProductResponse>(api.get(`/products/slug/${slug}`)),
  byBrand: (brandId: Id, params?: ProductQuery) =>
    unwrap<ApiPage<ProductResponse>>(api.get(`/products/brand/${brandId}`, { params })),
  byCategory: (categoryId: Id, params?: ProductQuery) =>
    unwrap<ApiPage<ProductResponse>>(api.get(`/products/category/${categoryId}`, { params })),
  // Admin only
  create: (body: any) => unwrap<ProductResponse>(api.post("/products", body)),
  update: (id: Id, body: any) => unwrap<ProductResponse>(api.put(`/products/${id}`, body)),
  delete: (id: Id) => api.delete(`/products/${id}`).then(() => undefined),
};

export const Brands = {
  list: () => unwrap<BrandResponse[]>(api.get("/brands")),
  // Admin
  create: (body: any) => unwrap<BrandResponse>(api.post("/brands", body)),
  update: (id: Id, body: any) => unwrap<BrandResponse>(api.put(`/brands/${id}`, body)),
  delete: (id: Id) => api.delete(`/brands/${id}`).then(() => undefined),
};

export const Categories = {
  list: () => unwrap<CategoryResponse[]>(api.get("/categories")),
  // Admin
  create: (body: any) => unwrap<CategoryResponse>(api.post("/categories", body)),
  update: (id: Id, body: any) => unwrap<CategoryResponse>(api.put(`/categories/${id}`, body)),
  delete: (id: Id) => api.delete(`/categories/${id}`).then(() => undefined),
};

export const Reviews = {
  byProduct: (productId: Id, params?: ReviewQuery) =>
    unwrap<ApiPage<ReviewResponse>>(api.get(`/reviews/product/${productId}`, { params })),
  create: (body: ReviewCreateRequest) => unwrap<ReviewResponse>(api.post("/reviews", body)),
  update: (reviewId: Id, body: ReviewUpdateRequest) => unwrap<ReviewResponse>(api.put(`/reviews/${reviewId}`, body)),
  delete: (reviewId: Id) => api.delete(`/reviews/${reviewId}`).then(() => undefined),
};

export const Auth = {
  login: (body: LoginRequest) => unwrap<LoginResponse>(api.post("/auth/login", body)),
  register: (body: RegisterRequest) => unwrap<UserResponse>(api.post("/auth/register", body)),
  logout: () => api.post("/auth/logout").then(() => undefined),
  me: () => unwrap<UserResponse>(api.get("/users/me")),
};

export const Cart = {
  get: () => unwrap<CartResponse>(api.get("/cart")),
  // Backend returns 201/200/204 with NO body for mutations -> do not unwrap body, just await for side effect then refresh in store
  add: (productId: Id, quantity = 1) =>
    api.post("/cart/items", { productId, quantity }).then(() => undefined),
  update: (productId: Id, quantity: number) =>
    api.put(`/cart/items/${productId}`, { quantity }).then(() => undefined),
  remove: (productId: Id) => api.delete(`/cart/items/${productId}`).then(() => undefined),
  clear: () => api.delete("/cart").then(() => undefined),
};

export const Wishlist = {
  get: () => unwrap<WishlistResponse[]>(api.get("/wishlists")),
  // Backend add returns 201 void, remove 204 void
  add: (productId: Id) => api.post("/wishlists", { productId }).then(() => undefined),
  remove: (productId: Id) => api.delete(`/wishlists/${productId}`).then(() => undefined),
};

// Note: coupon apply/preview is handled server-side inside POST /orders (see BE OrderService + CouponRedemption).
// No client-side /coupons/apply call to strictly match base backend endpoints without extra paths.

export const Orders = {
  create: (body: OrderRequest) =>
    unwrap<OrderResponse>(api.post("/orders", body)).then(normalizeOrder),
  mine: (params?: PageQuery) =>
    unwrap<ApiPage<OrderResponse>>(api.get("/orders/user", { params })).then((page) => ({
      ...page,
      content: page.content.map(normalizeOrder),
    })),
  byId: (id: Id) => unwrap<OrderResponse>(api.get(`/orders/${id}`)).then(normalizeOrder),
  // Admin
  listAll: (params?: PageQuery) => unwrap<ApiPage<OrderResponse>>(api.get("/orders", { params })).then((page) => ({
    ...page,
    content: page.content.map(normalizeOrder),
  })),
  updateStatus: (orderId: Id, status: string) => unwrap<OrderResponse>(api.patch(`/orders/${orderId}/status`, { status })),
};

// User addresses (for future checkout enhancement)
export const UserAddresses = {
  list: () => unwrap<UserAddressResponse[]>(api.get("/user-addresses/user")),
  listDefault: () => unwrap<UserAddressResponse[]>(api.get("/user-addresses/default")),
  create: (body: UserAddressRequest) => unwrap<UserAddressResponse>(api.post("/user-addresses", body)),
  update: (id: Id, body: UserAddressRequest) => unwrap<UserAddressResponse>(api.put(`/user-addresses/${id}`, body)),
  delete: (id: Id) => api.delete(`/user-addresses/${id}`).then(() => undefined),
};

// Payments (user can list for their order)
export const Payments = {
  byOrder: (orderId: Id, params?: PageQuery) =>
    unwrap<ApiPage<any>>(api.get(`/payments/order/${orderId}`, { params })),
  // create/retry if needed
  create: (body: { orderId: Id; provider: string }) => unwrap<any>(api.post("/payments", body)),
  retryOrder: (orderId: Id) => unwrap<any>(api.post(`/orders/${orderId}/payments/retry`)),
};

// Admin users (example)
export const AdminUsers = {
  list: (params?: PageQuery) => unwrap<ApiPage<UserResponse>>(api.get("/users", { params })),
  get: (id: Id) => unwrap<UserResponse>(api.get(`/users/${id}`)),
  update: (id: Id, body: any) => unwrap<UserResponse>(api.put(`/users/${id}`, body)),
  delete: (id: Id) => api.delete(`/users/${id}`).then(() => undefined),
};
