import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "./store";
import Sidebar, { useSidebarCollapsed } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { cn } from "../lib/utils";

export default function AdminLayout() {
  const isAuthed = useAdminAuth((s) => s.isAuthed);
  const { collapsed, toggle } = useSidebarCollapsed();

  if (!isAuthed) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Ambient neon glow background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          backgroundImage:
            "radial-gradient(1100px circle at 85% -10%, rgba(0,255,102,0.07), transparent 55%), radial-gradient(700px circle at -10% 110%, rgba(0,255,102,0.05), transparent 55%)",
        }}
      />

      <Sidebar collapsed={collapsed} onToggle={toggle} />

      <div
        className={cn(
          "relative z-10 min-h-screen transition-[padding] duration-300 ease-out",
          collapsed ? "pl-[78px]" : "pl-[280px]"
        )}
      >
        <Topbar />
        <main data-testid="admin-content" className="px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
