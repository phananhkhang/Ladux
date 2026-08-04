import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import AppRouter from "./AppRouter";
import { StorefrontProvider } from "./StorefrontProvider";
import ScrollToTop from "../components/common/ScrollToTop";

const AdminApp = lazy(() => import("../admin/AdminApp"));

export default function App() {
    const location = useLocation();

    if (location.pathname === "/admin" || location.pathname.startsWith("/admin/")) {
        return (
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500">Đang tải Ladux Admin...</div>}>
                <AdminApp />
            </Suspense>
        );
    }

    return (
        <StorefrontProvider>
            <ScrollToTop />
            <AppRouter />
        </StorefrontProvider>
    );
}
