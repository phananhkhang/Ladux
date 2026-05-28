import React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-neon text-black font-semibold hover:bg-neon-hover active:scale-[0.98] shadow-[0_0_30px_-8px_rgba(0,255,102,0.55)]",
  secondary:
    "bg-transparent border border-white/15 text-white hover:border-neon hover:text-neon",
  ghost: "bg-transparent text-zinc-400 hover:text-white",
  outline:
    "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
  danger:
    "bg-rose-500/10 border border-rose-500/40 text-rose-300 hover:bg-rose-500/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-11 px-6 text-sm rounded-full",
  lg: "h-14 px-8 text-base rounded-full",
  icon: "h-10 w-10 rounded-full",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
