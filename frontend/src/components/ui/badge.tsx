import React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant = "neon" | "ghost" | "danger" | "solid";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  neon: "bg-neon/10 text-neon border border-neon/30",
  ghost: "bg-white/5 text-zinc-300 border border-white/10",
  danger: "bg-rose-500/10 text-rose-300 border border-rose-500/30",
  solid: "bg-neon text-black border border-neon",
};

export const Badge = ({ className, variant = "neon", children, ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
