import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type Tone = "neon" | "amber" | "rose" | "zinc" | "blue";

const toneStyles: Record<Tone, string> = {
  neon: "bg-neon/10 text-neon border-neon/30 shadow-[0_0_18px_-8px_rgba(0,255,102,0.55)]",
  amber: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  zinc: "bg-white/[0.04] text-zinc-300 border-white/10",
  blue: "bg-sky-400/10 text-sky-300 border-sky-400/30",
};

export function StatusPill({ tone = "zinc", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        toneStyles[tone]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", `bg-current`)} />
      {children}
    </span>
  );
}

/** Map textual status -> tone */
export const orderStatusTone = (s: string): Tone => {
  switch (s.toLowerCase()) {
    case "đã giao":
    case "hoàn tất":
    case "thành công":
    case "active":
      return "neon";
    case "đang xử lý":
    case "đang giao":
    case "pending":
      return "amber";
    case "đã huỷ":
    case "thất bại":
    case "failed":
      return "rose";
    default:
      return "zinc";
  }
};
