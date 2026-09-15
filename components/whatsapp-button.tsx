"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { BRAND, waLink } from "@/lib/brand";
import { cn } from "@/lib/utils";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.19 8.19 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.06 0 1.22.89 2.39 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

/** Floating WhatsApp launcher. Two numbers, so it opens a small picker. */
export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const message = "Assalamu alaikum, I'd like to ask about an Insaf Mart product.";

  return (
    <div className="fixed bottom-[5.5rem] right-4 z-40 flex flex-col items-end gap-2 sm:bottom-24 sm:right-6">
      {open && (
        <div className="w-60 overflow-hidden rounded-md border border-border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              Chat on WhatsApp
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close WhatsApp options"
              className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="p-1.5">
            {BRAND.whatsapp.map((w) => (
              <li key={w.number}>
                <a
                  href={waLink(w.number, message)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex flex-col rounded-sm px-2.5 py-2 hover:bg-muted"
                  data-testid={`link-wa-${w.number}`}
                >
                  <span className="text-sm text-foreground">{w.number}</span>
                  <span className="text-xs text-muted-foreground">{w.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with us on WhatsApp"
        data-testid="button-whatsapp"
        className={cn(
          "press flex h-12 w-12 items-center justify-center rounded-full bg-[#1F9E56] text-white shadow-lg transition-transform hover:scale-105",
        )}
      >
        <WhatsAppGlyph className="h-6 w-6" />
      </button>
    </div>
  );
}
