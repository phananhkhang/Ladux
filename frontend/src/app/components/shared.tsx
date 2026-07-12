import { Star, Moon, Sun } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useStore } from "../data/store";
import type {
  OrderStatus,
  PaymentStatus,
  PurchaseOrderStatus,
  CustomerLevel,
  StockMovementType,
} from "@/api/types";

// --------------------------- Rating stars ------------------------------------

export function RatingStars({
  value,
  size = 14,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${i} star`}
        >
          <Star
            size={size}
            className={
              i <= Math.round(value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            }
          />
        </button>
      ))}
    </div>
  );
}

// --------------------------- Theme toggle ------------------------------------

export function ThemeToggle() {
  const { theme, toggleTheme } = useStore();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </Button>
  );
}

// --------------------------- Status badges -----------------------------------

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-400",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${ORDER_STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  SUCCESS: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${PAYMENT_STATUS_STYLES[status] ?? PAYMENT_STATUS_STYLES.PENDING}`}
    >
      {status}
    </span>
  );
}

const PO_STATUS_STYLES: Record<PurchaseOrderStatus, string> = {
  PENDING: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  PARTIALLY_RECEIVED: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  RECEIVED: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
};

export function POStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${PO_STATUS_STYLES[status] ?? PO_STATUS_STYLES.PENDING}`}
    >
      {status}
    </span>
  );
}

const LEVEL_STYLES: Record<CustomerLevel, string> = {
  BRONZE: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-400",
  SILVER: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  GOLD: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  PLATINUM: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-400",
};

export function LevelBadge({ level }: { level: CustomerLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${LEVEL_STYLES[level] ?? LEVEL_STYLES.BRONZE}`}
    >
      {level}
    </span>
  );
}

export function MovementBadge({ type }: { type: StockMovementType | string }) {
  const styles: Record<string, string> = {
    PURCHASE_IN: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
    RETURN_IN: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
    ADJUSTMENT_IN: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
    SALE_OUT: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
    DAMAGE_OUT: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
    ADJUSTMENT_OUT: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    OTHER: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${styles[type] ?? styles.OTHER}`}
    >
      {type}
    </span>
  );
}

// --------------------------- Stock badge -------------------------------------

export function StockBadge({ quantity }: { quantity: number }) {
  if (quantity <= 0) return <Badge variant="destructive">Hết hàng</Badge>;
  if (quantity <= 5)
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
        Low stock · {quantity} left
      </Badge>
    );
  return (
    <Badge className="bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400">
      In stock
    </Badge>
  );
}
