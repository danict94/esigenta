"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants, cn } from "@esigenta/ui";

import { cc, ccElevation, ccFont } from "./palette";
import { CloseIcon, MenuIcon } from "./icons";

export type NavbarVariant = "default" | "funnel";

type NavbarProps = {
  variant?: NavbarVariant;
};

type NavItem = {
  href: string;
  label: string;
  accent?: boolean;
};

const navItems: NavItem[] = [
  { href: "/richieste/accesso", label: "Le mie richieste" },
  { href: "/area-impresa/accedi", label: "Accedi" },
  { href: "/area-impresa", label: "Sei un professionista?", accent: true },
];

export function Navbar({ variant = "default" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const solid = scrolled || menuOpen;
  const visibleNavItems = variant === "funnel" ? navItems.slice(1) : navItems;

  return (
    <header
      style={ccFont}
      className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md transition-shadow duration-300"
    >
      <div
        className="flex h-(--fp-nav-height) items-center justify-between border-b px-5 transition-colors duration-300 sm:px-10 lg:px-16"
        style={{
          backgroundColor: solid ? cc.paperTranslucent : "transparent",
          borderColor: scrolled ? cc.hairline : "transparent",
          boxShadow: scrolled ? ccElevation : "none",
        }}
      >
        <Link
          href="/"
          className="text-[17px] font-semibold tracking-[-0.01em]"
          style={{ color: cc.ink }}
          prefetch={false}
        >
          esigenta
        </Link>

        <nav className="hidden items-center gap-6 text-[15px] lg:flex">
          {visibleNavItems.map((item) =>
            item.accent ? (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  buttonVariants.nav,
                  "rounded-[6px] px-3 py-1.5 text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC785C]",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="rounded-sm transition-opacity duration-300 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC785C]"
                style={{ color: cc.inkSecondary }}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-[8px] lg:hidden"
          style={{ color: cc.ink }}
        >
          {menuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen ? (
        <nav
          aria-label="Navigazione principale"
          className="flex flex-col gap-1 border-b px-5 pb-5 pt-2 sm:px-10 lg:hidden"
          style={{ backgroundColor: cc.paper, borderColor: cc.hairline, boxShadow: ccElevation }}
        >
          {visibleNavItems.map((item) =>
            item.accent ? (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  buttonVariants.nav,
                  "mt-2 inline-flex w-fit items-center rounded-[8px] px-4 py-2.5 text-[15px]",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-[16px]"
                style={{ color: cc.ink }}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      ) : null}
    </header>
  );
}
