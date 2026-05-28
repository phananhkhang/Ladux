import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  ApiPage,
  BrandResponse,
  CartResponse,
  CategoryResponse,
  CouponApplyResponse,
  Id,
  LoginRequest,
  LoginResponse,
  OrderRequest,
  OrderResponse,
  PageQuery,
  ProductQuery,
  ProductResponse,
  RegisterRequest,
  ReviewQuery,
  ReviewResponse,
  UserResponse,
  WishlistResponse,
} from "../types/api";

const DEFAULT_BACKEND_URL = "http://localhost:8080";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const backendUrl = stripTrailingSlash(
  import.meta.env.VITE_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL
);

export const apiBaseURL = `${backendUrl}/api/v1`;

interface ApiErrorBody {
  detail?: string;
  message?: string;
}

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 20000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("auratech_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
  return error.response?.data?.detail ?? error.response?.data?.message ?? fallback;
};

export default api;

export const Products = {
  list: (params?: ProductQuery) => unwrap<ApiPage<ProductResponse>>(api.get("/products", { params })),
  byId: (id: Id) => unwrap<ProductResponse>(api.get(`/products/${id}`)),
  bySlug: (slug: string) => unwrap<ProductResponse>(api.get(`/products/slug/${slug}`)),
  byBrand: (brandId: Id, params?: ProductQuery) =>
    unwrap<ApiPage<ProductResponse>>(api.get(`/products/brand/${brandId}`, { params })),
  byCategory: (categoryId: Id, params?: ProductQuery) =>
    unwrap<ApiPage<ProductResponse>>(api.get(`/products/category/${categoryId}`, { params })),
};

export const Brands = {
  list: () => unwrap<BrandResponse[]>(api.get("/brands")),
};

export const Categories = {
  list: () => unwrap<CategoryResponse[]>(api.get("/categories")),
};

export const Reviews = {
  byProduct: (productId: Id, params?: ReviewQuery) =>
    unwrap<ApiPage<ReviewResponse>>(api.get(`/reviews/product/${productId}`, { params })),
};

export const Auth = {
  login: (body: LoginRequest) => unwrap<LoginResponse>(api.post("/users/login", body)),
  register: (body: RegisterRequest) => unwrap<UserResponse>(api.post("/users/register", body)),
  me: () => unwrap<UserResponse>(api.get("/users/me")),
};

export const Cart = {
  get: () => unwrap<CartResponse>(api.get("/cart")),
  add: (productId: Id, quantity = 1) =>
    unwrap<CartResponse>(api.post("/cart/items", { productId, quantity })),
  update: (productId: Id, quantity: number) =>
    unwrap<CartResponse>(api.put(`/cart/items/${productId}`, { quantity })),
  remove: (productId: Id) => unwrap<void>(api.delete(`/cart/items/${productId}`)),
  clear: () => unwrap<void>(api.delete("/cart")),
};

export const Wishlist = {
  get: () => unwrap<WishlistResponse[]>(api.get("/wishlists")),
  add: (productId: Id) => unwrap<WishlistResponse>(api.post("/wishlists", { productId })),
  remove: (productId: Id) => unwrap<void>(api.delete(`/wishlists/${productId}`)),
};

export const Coupons = {
  apply: (code: string, subTotal: number) =>
    unwrap<CouponApplyResponse>(api.post("/coupons/apply", { code, subTotal })),
};

export const Orders = {
  create: (body: OrderRequest) =>
    unwrap<OrderResponse>(api.post("/orders", body)).then(normalizeOrder),
  mine: (params?: PageQuery) =>
    unwrap<ApiPage<OrderResponse>>(api.get("/orders/user", { params })).then((page) => ({
      ...page,
      content: page.content.map(normalizeOrder),
    })),
  byId: (id: Id) => unwrap<OrderResponse>(api.get(`/orders/${id}`)).then(normalizeOrder),
};
