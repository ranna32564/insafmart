"use client";

import { STATUS_META } from "@/lib/brand";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  amber: "border-gold/40 bg-gold/10 text-gold",
  green: "border-emerald-600/30 bg-emerald-600/10 text-emerald-700",
  blue: "border-sky-700/25 bg-sky-700/10 text-sky-800",
  red: "border-destructive/30 bg-destructive/10 text-destructive",
  grey: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = STATUS_META[status] ?? { label: status, tone: "grey" as const };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.08em]",
        TONES[meta.tone],
        className,
      )}
      data-testid={`badge-status-${status}`}
    >
      {meta.label}
    </span>
  );
}
