import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState, type ReactElement } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AdminAuthProvider, useAdminAuth } from "./auth/AdminAuthProvider";
import AdminShell from "./components/AdminShell";
import { LoadingScreen } from "./components/AdminUI";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResourceListPage, { type ResourceName } from "./pages/ResourceListPage";
import ProductsPage from "./pages/ProductsPage";
import ProductEditorPage from "./pages/ProductEditorPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { OrderDetailPage, OrdersPage, PaymentDetailPage, PaymentsPage } from "./pages/SalesPages";
import { ProductSuppliersPage, PurchaseOrderDetailPage, PurchaseOrderNewPage, PurchaseOrdersPage, StockMovementsPage } from "./pages/ProcurementPages";
import { ColorsPage, ForbiddenPage, NotFoundPage, NotificationsPage } from "./pages/SystemPages";
import { CustomerDetailPage, SupplierDetailPage, UserDetailPage } from "./pages/RecordDetailPages";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { status } = useAdminAuth();
  const location = useLocation();
  if (status === "checking") return <LoadingScreen />;
  if (status === "forbidden") return <Navigate to="/admin/403" replace />;
  if (status !== "authenticated") return <Navigate to="/admin/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  return children;
}

function ResourceRoute({ resource }: { resource: ResourceName }) {
  return <ResourceListPage resource={resource} />;
}

function AdminRoutes() {
  return <Suspense fallback={<LoadingScreen label="Đang tải giao diện quản trị..." />}>
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/403" element={<ForbiddenPage />} />
      <Route path="/admin" element={<ProtectedRoute><AdminShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="payments/:paymentId" element={<PaymentDetailPage />} />
        <Route path="order-histories" element={<ResourceRoute resource="order-histories" />} />
        <Route path="order-items" element={<ResourceRoute resource="order-items" />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductEditorPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="products/:productId/edit" element={<ProductEditorPage />} />
        <Route path="brands" element={<ResourceRoute resource="brands" />} />
        <Route path="categories" element={<ResourceRoute resource="categories" />} />
        <Route path="colors" element={<ColorsPage />} />
        <Route path="coupons" element={<ResourceRoute resource="coupons" />} />
        <Route path="customers" element={<ResourceRoute resource="customers" />} />
        <Route path="customers/:customerId" element={<CustomerDetailPage />} />
        <Route path="users" element={<ResourceRoute resource="users" />} />
        <Route path="users/:userId" element={<UserDetailPage />} />
        <Route path="user-addresses" element={<ResourceRoute resource="user-addresses" />} />
        <Route path="reviews" element={<ResourceRoute resource="reviews" />} />
        <Route path="suppliers" element={<ResourceRoute resource="suppliers" />} />
        <Route path="suppliers/:supplierId" element={<SupplierDetailPage />} />
        <Route path="product-suppliers" element={<ProductSuppliersPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="purchase-orders/new" element={<PurchaseOrderNewPage />} />
        <Route path="purchase-orders/:purchaseOrderId" element={<PurchaseOrderDetailPage />} />
        <Route path="stock-movements" element={<StockMovementsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </Suspense>;
}

export default function AdminApp() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 }, mutations: { retry: false } } }));
  return <QueryClientProvider client={queryClient}><AdminAuthProvider><AdminRoutes /><Toaster richColors position="top-right" /></AdminAuthProvider></QueryClientProvider>;
}
