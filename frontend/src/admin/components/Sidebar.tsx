import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { Separator } from "../../components/ui/separator";
import {
  NAVIGATION,
  isGroupActive,
  isRouteActive,
  type NavGroup,
  type NavLeaf,
} from "../config/navigation";
import { useAdminAuth } from "../store";

const COLLAPSED_KEY = "auratech_admin_sidebar_collapsed";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/** Brand block – AuraTech logomark + wordmark with neon halo. */
function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      to="/admin"
      data-testid="sidebar-brand"
      className="group flex items-center gap-3 px-2 py-1.5 rounded-xl transition-colors"
    >
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neon/10 ring-1 ring-neon/40 shadow-[0_0_24px_-6px_rgba(0,255,102,0.65)] transition-transform group-hover:scale-[1.03]">
        <Sparkles className="h-5 w-5 text-neon" strokeWidth={2.2} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" aria-hidden />
      </span>
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[15px] font-bold tracking-tight text-white">
            AuraTech
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neon/80">
            Console
          </span>
        </div>
      )}
    </Link>
  );
}

/** A single leaf link rendered inside an expanded group OR as a top-level link. */
function LeafLink({
  leaf,
  pathname,
  collapsed,
  nested = false,
}: {
  leaf: NavLeaf;
  pathname: string;
  collapsed: boolean;
  nested?: boolean;
}) {
  const active = isRouteActive(pathname, leaf.to);
  const Icon = leaf.icon;

  const content = (
    <Link
      to={leaf.to}
      data-testid={`sidebar-link-${leaf.to.replace(/\//g, "-").replace(/^-/, "")}`}
      data-active={active ? "true" : "false"}
      className={cn(
        "relative group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        nested && !collapsed && "ml-3 pl-4",
        active
          ? "bg-neon/[0.08] text-neon shadow-[0_0_24px_-10px_rgba(0,255,102,0.7),inset_0_0_0_1px_rgba(0,255,102,0.18)]"
          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
      )}
    >
      {/* Vertical glow indicator on active */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full transition-all",
          active
            ? "bg-neon shadow-[0_0_12px_2px_rgba(0,255,102,0.65)] opacity-100"
            : "opacity-0 group-hover:opacity-40 bg-white/40"
        )}
      />
      {Icon && (
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-transform",
            active ? "text-neon" : "text-zinc-500 group-hover:text-zinc-200",
            "group-hover:scale-110"
          )}
          strokeWidth={active ? 2.2 : 1.8}
        />
      )}
      {!collapsed && <span className="truncate">{leaf.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={120}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{leaf.label}</TooltipContent>
      </Tooltip>
    );
  }
  return content;
}

/** Group with collapsible accordion (or icon-only popover-style when collapsed). */
function GroupBlock({
  group,
  pathname,
  collapsed,
  openValue,
  onOpenChange,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  openValue: string | undefined;
  onOpenChange: (v: string) => void;
}) {
  const active = isGroupActive(pathname, group);
  const Icon = group.icon;

  if (collapsed) {
    // When collapsed: render only the group icon, with tooltip showing label.
    // Active state highlights the icon container.
    return (
      <Tooltip delayDuration={120}>
        <TooltipTrigger asChild>
          <Link
            to={group.children[0]?.to ?? "/admin"}
            data-testid={`sidebar-group-collapsed-${group.id}`}
            className={cn(
              "relative grid h-10 w-10 mx-auto place-items-center rounded-xl transition-all duration-200",
              active
                ? "bg-neon/10 text-neon ring-1 ring-neon/30 shadow-[0_0_18px_-6px_rgba(0,255,102,0.7)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
            {active && (
              <span
                aria-hidden
                className="absolute -left-2 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-neon shadow-[0_0_10px_2px_rgba(0,255,102,0.65)]"
              />
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{group.label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={openValue}
      onValueChange={onOpenChange}
      className="w-full"
    >
      <AccordionItem value={group.id} className="border-0">
        <AccordionTrigger
          data-testid={`sidebar-group-${group.id}`}
          data-active={active ? "true" : "false"}
          className={cn(
            "group/trigger w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:no-underline",
            active
              ? "text-neon"
              : "text-zinc-300 hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span className="flex items-center gap-3">
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors",
                active ? "text-neon" : "text-zinc-500 group-hover/trigger:text-zinc-200"
              )}
              strokeWidth={active ? 2.2 : 1.8}
            />
            <span className="truncate">{group.label}</span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="pt-1">
          <div className="relative flex flex-col gap-0.5 pl-3">
            {/* vertical guide line */}
            <span
              aria-hidden
              className="absolute left-[14px] top-1 bottom-1 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent"
            />
            {group.children.map((leaf) => (
              <LeafLink key={leaf.to} leaf={leaf} pathname={pathname} collapsed={false} nested />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { pathname } = useLocation();
  const { name, email, logout } = useAdminAuth();

  // Auto-open the accordion section that contains the current route.
  const initialOpen = useMemo(() => {
    for (const entry of NAVIGATION) {
      if (entry.type === "group" && isGroupActive(pathname, entry)) return entry.id;
    }
    return undefined;
  }, [pathname]);

  const [openValue, setOpenValue] = useState<string | undefined>(initialOpen);
  useEffect(() => {
    if (initialOpen) setOpenValue(initialOpen);
  }, [initialOpen]);

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        data-testid="admin-sidebar"
        data-collapsed={collapsed ? "true" : "false"}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col",
          "border-r border-white/[0.06] bg-zinc-950/85 backdrop-blur-xl",
          "shadow-[1px_0_0_0_rgba(255,255,255,0.02),0_40px_60px_-30px_rgba(0,255,102,0.18)]",
          "transition-[width] duration-300 ease-out",
          collapsed ? "w-[78px]" : "w-[280px]"
        )}
      >
        {/* subtle vertical neon stripe */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-neon/20 to-transparent"
        />

        {/* Header */}
        <div
          className={cn(
            "flex items-center px-4 pt-5 pb-3",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <Brand collapsed={collapsed} />
          {!collapsed && (
            <button
              type="button"
              onClick={onToggle}
              data-testid="sidebar-collapse-button"
              aria-label="Thu gọn sidebar"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-zinc-400 transition-all hover:border-neon/40 hover:text-neon hover:shadow-[0_0_18px_-6px_rgba(0,255,102,0.7)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={onToggle}
            data-testid="sidebar-expand-button"
            aria-label="Mở rộng sidebar"
            className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-zinc-400 transition-all hover:border-neon/40 hover:text-neon hover:shadow-[0_0_18px_-6px_rgba(0,255,102,0.7)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <Separator className="mx-4 my-1 w-auto" />

        {/* Eyebrow */}
        {!collapsed && (
          <p className="px-5 pt-3 pb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-600">
            Điều hướng
          </p>
        )}

        {/* Scrollable Nav */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto px-3 pb-4",
            "scrollbar-thin scrollbar-track-transparent",
            collapsed && "flex flex-col items-stretch gap-1"
          )}
        >
          <ul className={cn("flex flex-col", collapsed ? "gap-1" : "gap-0.5")}>
            {NAVIGATION.map((entry) =>
              entry.type === "leaf" ? (
                <li key={entry.to}>
                  <LeafLink leaf={entry} pathname={pathname} collapsed={collapsed} />
                </li>
              ) : (
                <li key={entry.id}>
                  <GroupBlock
                    group={entry}
                    pathname={pathname}
                    collapsed={collapsed}
                    openValue={openValue}
                    onOpenChange={(v) => setOpenValue(v || undefined)}
                  />
                </li>
              )
            )}
          </ul>
        </nav>

        {/* Footer / Admin profile */}
        <div className={cn("border-t border-white/[0.06] p-3", collapsed && "px-2")}>
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5 ring-1 ring-white/[0.04]",
              collapsed && "justify-center bg-transparent ring-0 p-0"
            )}
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neon/10 text-neon ring-1 ring-neon/30">
              <span className="text-xs font-bold">
                {(name ?? "A").slice(0, 1).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{name ?? "Admin"}</p>
                  <p className="truncate text-[11px] text-zinc-500">{email ?? "—"}</p>
                </div>
                <Tooltip delayDuration={120}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={logout}
                      data-testid="admin-logout-button"
                      aria-label="Đăng xuất"
                      className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Đăng xuất</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

/** Persist collapse state in localStorage. Exposed as a small hook for AdminLayout. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSED_KEY) === "1";
  });
  useEffect(() => {
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);
  return { collapsed, setCollapsed, toggle: () => setCollapsed((c) => !c) };
}
