import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { StoreProvider } from "./data/store";
import { StorefrontLayout } from "./components/storefront-layout";
import { AdminLayout } from "./components/admin-layout";

import { HomePage } from "./pages/home";
import { ProductsPage } from "./pages/products";
import { ProductDetailPage } from "./pages/product-detail";
import { CartPage } from "./pages/cart";
import { CheckoutPage } from "./pages/checkout";
import { PaymentPendingPage, PaymentSuccessPage, PaymentFailedPage } from "./pages/payment";
import { OrdersPage } from "./pages/orders";
import { WishlistPage } from "./pages/wishlist";
import { AccountPage } from "./pages/account";
import { LoginPage, RegisterPage } from "./pages/auth";

import { AdminDashboard } from "./pages/admin/dashboard";
import { AdminProducts } from "./pages/admin/products";
import { AdminOrders } from "./pages/admin/orders";
import { AdminCustomers } from "./pages/admin/customers";
import {
  AdminSuppliers,
  AdminProductSuppliers,
  AdminPurchaseOrders,
  AdminStockMovements,
} from "./pages/admin/supply-chain";
import {
  AdminCategories,
  AdminBrands,
  AdminReviews,
  AdminCoupons,
  AdminPayments,
  AdminUsers,
} from "./pages/admin/misc";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth (no chrome) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Storefront */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment" element={<PaymentPendingPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failed" element={<PaymentFailedPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="product-suppliers" element={<AdminProductSuppliers />} />
            <Route path="purchase-orders" element={<AdminPurchaseOrders />} />
            <Route path="stock-movements" element={<AdminStockMovements />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </StoreProvider>
  );
}
