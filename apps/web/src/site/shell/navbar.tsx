"use client";

import Link from "next/link";
import { useId, useLayoutEffect, useState } from "react";

import { cn, EsigentaLogo, useDismissableMenu } from "@esigenta/ui";

import {
  headerGutterClassName,
  headerHeightClassName,
  headerSurfaceClassName,
  headerTriggerBaseClassName,
  headerTriggerHeroClassName,
  headerTriggerSolidClassName,
} from "./header-gutter";
import { CloseIcon, MenuIcon } from "./icons";

export type NavbarVariant = "default" | "funnel";
// "brand": home, puo' iniziare sopra la Hero scura e diventare shell
// solida una volta superato il confine reale della Hero (vedi
// heroBoundaryId). "light": pagine senza Hero, sempre shell solida.
export type NavbarTone = "brand" | "light";

type NavbarProps = {
  variant?: NavbarVariant;
  tone?: NavbarTone;
  // Id del sentinel muto posto al confine reale tra Hero e resto della
  // pagina: proprieta' del chiamante (home-page.tsx), condiviso anche con
  // BusinessAccessTab. Rilevante solo quando tone === "brand".
  heroBoundaryId?: string;
};

// Deve restare sincronizzata con --eg-nav-height in globals.css: allinea
// l'IntersectionObserver al bordo reale dell'header fisso.
const NAV_HEIGHT_PX = 72;

type NavItem = {
  href: string;
  label: string;
};

const defaultNavItems: NavItem[] = [
  { href: "/servizi", label: "Servizi" },
  { href: "/richieste/accesso", label: "Le mie richieste" },
  { href: "/area-impresa/accedi", label: "Accedi" },
  { href: "/area-impresa", label: "Sei un professionista?" },
];

const funnelNavItems: NavItem[] = [
  { href: "/richieste/accesso", label: "Le mie richieste" },
  { href: "/area-impresa/accedi", label: "Accedi" },
  { href: "/area-impresa", label: "Sei un professionista?" },
];

export function Navbar({ variant = "default", tone = "light", heroBoundaryId }: NavbarProps) {
  const navItems = variant === "funnel" ? funnelNavItems : defaultNavItems;
  const navId = useId();
  const { isOpen, containerRef, toggle, close } = useDismissableMenu();
  const [isPastHero, setIsPastHero] = useState(false);

  useLayoutEffect(() => {
    if (tone !== "brand" || !heroBoundaryId) {
      return;
    }

    const boundary = document.getElementById(heroBoundaryId);

    if (!boundary) {
      return;
    }

    function syncFromPosition() {
      const rect = boundary?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setIsPastHero(rect.top <= NAV_HEIGHT_PX);
    }

    // Sincrono, prima del paint: evita un flash cromatico se la pagina si
    // monta gia' scrollata oltre la Hero (refresh, ripristino di scroll).
    syncFromPosition();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        // Solido quando il bordo inferiore della Hero (il sentinel) ha
        // raggiunto o superato l'altezza dell'header fisso. La posizione
        // e' l'unica fonte di verita' (non isIntersecting): al pixel
        // esatto della soglia il sentinel risulta ancora "intersecante"
        // per il root ridotto, il che renderebbe il confine ambiguo.
        setIsPastHero(entry.boundingClientRect.top <= NAV_HEIGHT_PX);
      },
      { rootMargin: `-${NAV_HEIGHT_PX}px 0px 0px 0px`, threshold: 0 },
    );

    observer.observe(boundary);

    // Rete di sicurezza per salti ampi (ancora, tasto Fine, flick) che
    // possono far "saltare" il sentinel senza mai attraversare la soglia
    // osservata: scrollend risincronizza dalla posizione reale.
    window.addEventListener("scrollend", syncFromPosition);

    return () => {
      observer.disconnect();
      window.removeEventListener("scrollend", syncFromPosition);
    };
  }, [tone, heroBoundaryId]);

  const isSolid = tone === "light" || isPastHero || isOpen;

  return (
    <header
      ref={containerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-[100] flex items-center justify-between gap-6 transition-[background-color,color,border-color] duration-200",
        headerHeightClassName,
        headerGutterClassName,
        isSolid ? headerSurfaceClassName : "border-b border-transparent bg-transparent text-eg-on-brand",
      )}
    >
      <Link
        href="/"
        className="relative z-[102] inline-flex items-center no-underline"
        prefetch={false}
        aria-label="Esigenta home"
      >
        <EsigentaLogo
          decorative
          tone={isSolid ? "default" : "inverse"}
          className="block h-6 w-auto"
        />
      </Link>

      <button
        type="button"
        className={cn(
          headerTriggerBaseClassName,
          isSolid ? headerTriggerSolidClassName : headerTriggerHeroClassName,
        )}
        aria-controls={navId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
        onClick={toggle}
      >
        {isOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

      <nav
        id={navId}
        className={[
          "absolute left-[22px] right-[22px] top-[calc(100%+8px)] grid overflow-hidden transition-[grid-template-rows,opacity,transform,border-color,background-color] duration-200 min-[861px]:static min-[861px]:flex min-[861px]:translate-y-0 min-[861px]:overflow-visible min-[861px]:border-0 min-[861px]:bg-transparent min-[861px]:opacity-100 min-[861px]:pointer-events-auto",
          isOpen
            ? "grid-rows-[1fr] border border-eg-border bg-eg-surface opacity-100 pointer-events-auto translate-y-0"
            : "grid-rows-[0fr] border border-transparent bg-transparent opacity-0 pointer-events-none -translate-y-2",
        ].join(" ")}
        aria-label="Navigazione principale"
      >
        <div className="min-h-0 flex flex-col items-stretch overflow-hidden min-[861px]:flex-row min-[861px]:items-center min-[861px]:gap-6 min-[861px]:overflow-visible">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "eg-nav-link whitespace-nowrap border-b border-eg-border px-[18px] py-4 text-eg-ink last:border-b-0 hover:text-eg-brand-strong min-[861px]:border-0 min-[861px]:p-0",
                !isSolid ? "min-[861px]:text-eg-on-brand min-[861px]:hover:text-eg-on-brand-muted" : "",
              )}
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
