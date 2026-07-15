"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@esigenta/ui";

import { PANEL_TOP_OFFSET } from "./dashboard-layout-constants";

/**
 * Docked side panel on desktop / fullscreen sheet on mobile, used by the
 * intercepted request-detail route so the request list stays mounted behind
 * it. Closing always goes through router.back() so the intercepted URL
 * unwinds cleanly (browser back reopens it, per Next's parallel-route modal
 * pattern).
 *
 * Breakpoint and mobile slide-in transition match the reference exactly:
 * `@media (max-width:900px){ .detail{ transform:translateX(100%);
 * transition:transform .35s ease } .detail.mobileOpen{ transform:translateX(0) } }`
 * — Tailwind's `lg:` (1024px) does NOT match this, so the panel used an
 * arbitrary `min-[900px]:` breakpoint instead.
 */
export function RequestPanelOverlay({ children }: { children: ReactNode }) {
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        router.back();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [router]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-[60] overflow-y-auto bg-eg-calce transition-transform duration-[350ms] ease-in-out",
        entered ? "translate-x-0" : "translate-x-full",
        "min-[900px]:translate-x-0 min-[900px]:transition-none",
        "min-[900px]:inset-y-0 min-[900px]:left-auto min-[900px]:right-0 min-[900px]:w-[460px] min-[900px]:bottom-0 min-[900px]:top-[var(--panel-top)]",
        "min-[900px]:border-l min-[900px]:border-eg-hairline min-[900px]:shadow-eg-elevation-lg",
      )}
      style={
        {
          "--panel-top": PANEL_TOP_OFFSET,
        } as CSSProperties
      }
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={() => router.back()}
        aria-label="Chiudi dettaglio"
        className={cn(
          "sticky top-0 z-10 flex w-full items-center gap-2 border-b border-eg-hairline bg-eg-calce px-5 py-4 text-left text-sm font-medium text-eg-ardesia transition-colors hover:text-eg-terra",
          "min-[900px]:w-auto min-[900px]:justify-end min-[900px]:border-none min-[900px]:bg-transparent min-[900px]:px-4 min-[900px]:pb-0 min-[900px]:pt-3",
        )}
      >
        <span aria-hidden="true" className="min-[900px]:hidden">
          &larr;
        </span>
        <span className="min-[900px]:hidden">Chiudi</span>
        <span className="hidden min-[900px]:inline">Chiudi &times;</span>
      </button>

      {children}
    </div>
  );
}
