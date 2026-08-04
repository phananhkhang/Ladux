export const adminQueryKeys = {
  auth: ["admin", "auth"] as const,
  dashboard: ["admin", "dashboard"] as const,
  resource: (name: string, params: unknown) => ["admin", name, params] as const,
  detail: (name: string, id: number) => ["admin", name, id] as const,
  products: ["admin", "products"] as const,
  orders: ["admin", "orders"] as const,
  suppliers: ["admin", "suppliers"] as const,
  purchaseOrders: ["admin", "purchase-orders"] as const,
  stockMovements: ["admin", "stock-movements"] as const,
  notifications: ["admin", "notifications"] as const,
} as const;
