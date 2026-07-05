"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { CloseIcon, MenuIcon } from "./icons";

export type NavbarVariant = "default" | "funnel";

type NavbarProps = {
  variant?: NavbarVariant;
};

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

export function Navbar({ variant = "default" }: NavbarProps) {
  const navItems = variant === "funnel" ? funnelNavItems : defaultNavItems;
  const navId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between gap-6 bg-transparent px-[22px] py-[18px] min-[861px]:px-12 min-[861px]:py-6">
      <Link href="/" className="relative z-[102] inline-flex items-center gap-2.5 text-eg-terra no-underline" prefetch={false} aria-label="Esigenta home">
        <img src="/logo%20esigenta.svg" alt="" className="block h-[22px] w-auto min-[861px]:h-6" />
        <span className="text-lg font-semibold tracking-[-0.01em]">esigenta</span>
      </Link>

      <button
        type="button"
        className="relative z-[102] inline-flex size-[42px] items-center justify-center border border-eg-hairline bg-eg-calce-translucent text-eg-terra transition-colors hover:border-eg-ardesia-2 hover:bg-eg-calce-2 hover:text-eg-cotto-dark min-[861px]:hidden"
        aria-controls={navId}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
        onClick={() => setMenuOpen((isOpen) => !isOpen)}
      >
        {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

      <nav
        id={navId}
        className={[
          "absolute left-[22px] right-[22px] top-[calc(100%+8px)] grid overflow-hidden transition-[grid-template-rows,opacity,transform,border-color,background-color] duration-200 min-[861px]:static min-[861px]:flex min-[861px]:translate-y-0 min-[861px]:overflow-visible min-[861px]:border-0 min-[861px]:bg-transparent min-[861px]:opacity-100 min-[861px]:pointer-events-auto",
          menuOpen
            ? "grid-rows-[1fr] border border-eg-hairline bg-eg-calce opacity-100 pointer-events-auto translate-y-0"
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
              className="eg-link-mono whitespace-nowrap border-b border-eg-hairline px-[18px] py-4 last:border-b-0 min-[861px]:border-0 min-[861px]:p-0"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
