import React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full h-12 px-4 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 outline-none transition focus:border-neon focus:ring-1 focus:ring-neon",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2", className)}
    {...props}
  />
));
Label.displayName = "Label";
