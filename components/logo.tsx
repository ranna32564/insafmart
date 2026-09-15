"use client";

import { cn } from "@/lib/utils";

/**
 * Insaf Mart mark — an attar bottle reduced to a faceted drop.
 * Monochrome, inherits `currentColor`, legible from 20px to 200px.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("h-6 w-6", className)}
    >
      <path
        d="M12 6.6 18.2 12.4 12 21.2 5.8 12.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M10.1 2.8h3.8v3.5h-3.8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 11.1 14.5 13.6 12 17.4 9.5 13.6Z" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  className,
  stacked = false,
}: {
  className?: string;
  stacked?: boolean;
}) {
  return (
    <span
      className={cn("flex items-center gap-2.5 text-foreground", className)}
      data-testid="link-logo"
    >
      <LogoMark className="h-7 w-7 shrink-0 text-primary" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.35rem] leading-none tracking-[0.01em]">
          Insaf Mart
        </span>
        {stacked && (
          <span className="mt-1 text-[0.55rem] uppercase tracking-[0.28em] text-muted-foreground">
            Attar · Beauty · Gifts
          </span>
        )}
      </span>
    </span>
  );
}
