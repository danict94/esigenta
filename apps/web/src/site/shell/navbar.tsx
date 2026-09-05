"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId } from "react";
import type { MouseEvent } from "react";

import {
  cn,
  EsigentaLogo,
  ESIGENTA_LOGO_ON_DARK_PATH,
  useDismissableMenu,
} from "@esigenta/ui";

import {
  headerGutterClassName,
  headerHeightClassName,
  headerTriggerBaseClassName,
} from "./header-gutter";
import { useFunnelExitGuardIntercept } from "./funnel-exit-guard";
import { CloseIcon, MenuIcon } from "./icons";

/**
 * FASE 9J — vero solo per un click sinistro "semplice" (nessun tasto
 * modificatore, nessun altro pulsante). Un ctrl/cmd/shift/middle-click
 * vuole aprire il link in una nuova scheda/finestra: non va MAI
 * intercettato, altrimenti si romperebbe un comportamento nativo del
 * browser che gli utenti si aspettano da qualunque link.
 */
function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

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

export function Navbar({ variant = "default" }: NavbarProps) {
  const navItems = variant === "funnel" ? funnelNavItems : defaultNavItems;
  const centerNavItems = variant === "funnel" ? navItems.slice(0, 1) : navItems.slice(0, 3);
  const actionNavItems = variant === "funnel" ? navItems.slice(1) : navItems.slice(3);
  const navId = useId();
  const pathname = usePathname();
  const router = useRouter();
  const interceptFunnelExit = useFunnelExitGuardIntercept();
  const { isOpen, containerRef, toggle, close } = useDismissableMenu();

  // FASE 9J — assente (no-op, mai un'intercettazione) su ogni pagina che
  // non sia il funnel, vedi funnel-exit-guard.tsx. Su /richiesta/[slug],
  // intercetta il click sul logo e su OGNI link della navbar (tutti
  // portano fuori dal funnel) — mai i link di Privacy/Termini, che non
  // vivono in Navbar (sono in request-step-ui.tsx/il footer, qui non
  // toccati).
  function handleGuardedNavigate(event: MouseEvent, href: string) {
    close();

    if (!isPlainLeftClick(event)) {
      return;
    }

    const intercepted = interceptFunnelExit(() => {
      router.push(href);
    });

    if (intercepted) {
      event.preventDefault();
    }
  }

  return (
    <header
      ref={containerRef}
      className="fixed inset-x-0 top-0 z-100 bg-eg-header text-eg-header-text"
    >
      {/* Sfondo/bordo sopra (headerSurfaceClassName) restano a tutta
          larghezza: e' solo il CONTENUTO che si allinea alla colonna da
          1180px, in questo wrapper interno — mai sull'header stesso,
          altrimenti si restringe anche lo sfondo. */}
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-6 min-[861px]:grid min-[861px]:grid-cols-[1fr_auto_1fr]",
          headerHeightClassName,
          headerGutterClassName,
        )}
      >
        <Link
          href="/"
          className="relative z-102 inline-flex items-center gap-2 no-underline"
          prefetch={false}
          aria-label="Esigenta home"
          onClick={(event) => {
            handleGuardedNavigate(event, "/");
          }}
        >
          <EsigentaLogo
            decorative
            src={ESIGENTA_LOGO_ON_DARK_PATH}
            className="h-10 w-auto shrink-0"
          />
        </Link>

        <button
          type="button"
          className={cn(
            headerTriggerBaseClassName,
            "border-eg-header-border text-eg-header-text hover:bg-eg-header-text/10 focus-visible:outline-eg-header-text",
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
            "absolute left-5.5 right-5.5 top-[calc(100%+8px)] grid overflow-hidden transition-[grid-template-rows,opacity,transform,border-color,background-color] duration-200 min-[861px]:contents min-[861px]:translate-y-0 min-[861px]:overflow-visible min-[861px]:border-0 min-[861px]:bg-transparent min-[861px]:opacity-100 min-[861px]:pointer-events-auto",
            isOpen
              ? "grid-rows-[1fr] border border-eg-header-border bg-eg-header opacity-100 pointer-events-auto translate-y-0"
              : "grid-rows-[0fr] border border-transparent bg-transparent opacity-0 pointer-events-none -translate-y-2",
          ].join(" ")}
          aria-label="Navigazione principale"
        >
          <div className="min-h-0 flex flex-col items-stretch overflow-hidden min-[861px]:hidden">
            {navItems.map((item) => {
              if (item.variant === "cta") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className="mx-4.5 my-3 inline-flex min-h-11 items-center justify-center rounded-eg-md bg-eg-header-action px-5 py-3 text-eg-header-nav font-semibold text-eg-header transition-[filter] hover:brightness-105"
                    onClick={(event) => {
                      handleGuardedNavigate(event, item.href);
                    }}
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
                    "whitespace-nowrap border-b border-eg-header-border px-4.5 py-4 text-eg-header-nav font-medium text-eg-header-text last:border-b-0 hover:text-eg-header-action",
                    active && "text-eg-header-action",
                  )}
                  onClick={(event) => {
                    handleGuardedNavigate(event, item.href);
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden min-[861px]:contents">
            <div className="col-start-2 flex items-center gap-8">
              {centerNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                  className="whitespace-nowrap text-eg-header-nav font-medium text-eg-header-text transition-colors hover:text-eg-header-action"
                  onClick={(event) => {
                    handleGuardedNavigate(event, item.href);
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="col-start-3 flex items-center justify-self-end gap-6">
              {actionNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                  className={
                    item.variant === "cta"
                      ? "inline-flex min-h-11 items-center justify-center rounded-eg-md bg-eg-header-action px-5 py-3 text-eg-header-nav font-semibold text-eg-header transition-[filter] hover:brightness-105"
                      : "whitespace-nowrap text-eg-header-nav font-medium text-eg-header-text transition-colors hover:text-eg-header-action"
                  }
                  onClick={(event) => {
                    handleGuardedNavigate(event, item.href);
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
