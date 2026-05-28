import { useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { NAVIGATION, isGroupActive, isRouteActive } from "../config/navigation";

/** Tries to compute a sensible breadcrumb from the current pathname. */
function useBreadcrumb() {
  const { pathname } = useLocation();
  for (const entry of NAVIGATION) {
    if (entry.type === "leaf" && isRouteActive(pathname, entry.to)) {
      return { group: null as string | null, page: entry.label };
    }
    if (entry.type === "group" && isGroupActive(pathname, entry)) {
      const leaf = entry.children.find((l) => isRouteActive(pathname, l.to));
      return { group: entry.label, page: leaf?.label ?? entry.label };
    }
  }
  return { group: null, page: "Quản trị" };
}

export default function Topbar() {
  const crumb = useBreadcrumb();
  return (
    <header
      data-testid="admin-topbar"
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/[0.05] bg-zinc-950/70 px-6 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-600">
          {crumb.group ?? "Tổng quan"}
        </p>
        <span className="h-1 w-1 rounded-full bg-zinc-700" />
        <h1 className="font-display text-lg font-semibold tracking-tight text-white">
          {crumb.page}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <Input
            placeholder="Tìm nhanh đơn, sản phẩm, khách…"
            className="h-10 w-[320px] rounded-xl pl-10 text-sm"
            data-testid="admin-topbar-search"
          />
        </div>
        <button
          type="button"
          data-testid="admin-topbar-notifications"
          aria-label="Thông báo"
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-zinc-300 transition-all hover:border-neon/40 hover:text-neon"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_2px_rgba(0,255,102,0.7)]" />
        </button>
      </div>
    </header>
  );
}
