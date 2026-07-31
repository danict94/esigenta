"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";

import { buttonClassName, cn, EsigentaLogo, useDismissableMenu } from "@esigenta/ui";

import {
  headerGutterClassName,
  headerHeightClassName,
  headerSurfaceClassName,
  headerTriggerBaseClassName,
  headerTriggerSolidClassName,
} from "./header-gutter";
import { CloseIcon, MenuIcon } from "./icons";

export type NavbarVariant = "default" | "funnel";

type NavbarProps = {
  variant?: NavbarVariant;
};

type NavItem = {
  href: string;
  label: string;
  variant?: "cta";
};

const defaultNavItems: NavItem[] = [
  { href: "/servizi", label: "Servizi" },
  { href: "/costi", label: "Costi" },
  { href: "/richieste/accesso", label: "Le mie richieste" },
  { href: "/area-impresa/accedi", label: "Accedi" },
  { href: "/area-impresa", label: "Sei un professionista?", variant: "cta" },
];

/** Stesso criterio di area-impresa/private/shell/impresa-header.tsx (isActivePath). */
function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const funnelNavItems: NavItem[] = [
  { href: "/richieste/accesso", label: "Le mie richieste" },
  { href: "/area-impresa/accedi", label: "Accedi" },
  { href: "/area-impresa", label: "Sei un professionista?", variant: "cta" },
];

// Bordo/colore Brand (non Action/matita): e' un invito di navigazione
// secondario, non una CTA primaria come "Cerca"/"Richiedi preventivi" —
// stessa distinzione del riferimento (.btn-outline usa cianotipo, non
// matita). Stesso pattern di override gia' usato da ProHeader/ImpresaHeader
// per adattare i colori di una variante condivisa a un contesto specifico.
const ctaLinkClassName = buttonClassName({
  variant: "ghost",
  size: "sm",
  className:
    "border-eg-brand-strong text-eg-brand-strong hover:bg-eg-brand-strong hover:text-eg-on-brand hover:-translate-y-px",
});

export function Navbar({ variant = "default" }: NavbarProps) {
  const navItems = variant === "funnel" ? funnelNavItems : defaultNavItems;
  const navId = useId();
  const pathname = usePathname();
  const { isOpen, containerRef, toggle, close } = useDismissableMenu();

  return (
    <header
      ref={containerRef}
      className={cn("fixed inset-x-0 top-0 z-100", headerSurfaceClassName)}
    >
      {/* Sfondo/bordo sopra (headerSurfaceClassName) restano a tutta
          larghezza: e' solo il CONTENUTO che si allinea alla colonna da
          1180px, in questo wrapper interno — mai sull'header stesso,
          altrimenti si restringe anche lo sfondo. */}
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-6",
          headerHeightClassName,
          headerGutterClassName,
        )}
      >
        <Link
          href="/"
          className="relative z-102 inline-flex items-center gap-2 no-underline"
          prefetch={false}
          aria-label="Esigenta home"
        >
          <EsigentaLogo decorative className="h-6 w-auto shrink-0" />
        </Link>

        <button
          type="button"
          className={cn(headerTriggerBaseClassName, headerTriggerSolidClassName)}
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
            "absolute left-5.5 right-5.5 top-[calc(100%+8px)] grid overflow-hidden transition-[grid-template-rows,opacity,transform,border-color,background-color] duration-200 min-[861px]:static min-[861px]:flex min-[861px]:translate-y-0 min-[861px]:overflow-visible min-[861px]:border-0 min-[861px]:bg-transparent min-[861px]:opacity-100 min-[861px]:pointer-events-auto",
            isOpen
              ? "grid-rows-[1fr] border border-eg-border bg-eg-surface opacity-100 pointer-events-auto translate-y-0"
              : "grid-rows-[0fr] border border-transparent bg-transparent opacity-0 pointer-events-none -translate-y-2",
          ].join(" ")}
          aria-label="Navigazione principale"
        >
          <div className="min-h-0 flex flex-col items-stretch overflow-hidden min-[861px]:flex-row min-[861px]:items-center min-[861px]:gap-6 min-[861px]:overflow-visible">
            {navItems.map((item) => {
              if (item.variant === "cta") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className={cn(ctaLinkClassName, "mx-4.5 my-3 min-[861px]:m-0")}
                    onClick={close}
                  >
                    {item.label}
                  </Link>
                );
              }

              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "eg-nav-link whitespace-nowrap border-b border-eg-border px-4.5 py-4 last:border-b-0 min-[861px]:border-0 min-[861px]:p-0",
                    active ? "text-eg-brand-strong" : "text-eg-ink hover:text-eg-brand-strong",
                  )}
                  onClick={close}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
