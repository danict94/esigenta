"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@fixpro/ui";

type AdminShellProps = {
  children: ReactNode;
};

type AdminNavItem = {
  label: string;
  href: string;
  enabled: boolean;
};

const navItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/", enabled: true },
  { label: "Richieste", href: "/requests", enabled: true },
  { label: "Crediti", href: "/crediti/pacchetti", enabled: true },
  { label: "Imprese", href: "/companies", enabled: false },
  { label: "Assistenza", href: "/support", enabled: false },
  { label: "Qualità", href: "/quality", enabled: false },
  { label: "Impostazioni", href: "/settings", enabled: false },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavLink({ item }: { item: AdminNavItem }) {
  const pathname = usePathname();
  const isActive = item.enabled && isActivePath(pathname, item.href);

  if (!item.enabled) {
    return (
      <span
        className="inline-flex h-9 shrink-0 cursor-not-allowed items-center justify-center rounded-md border border-transparent px-3 text-sm font-medium text-text-muted"
        aria-disabled="true"
        title="Sezione prevista per una fase successiva"
      >
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
        isActive
          ? "border-border-primary bg-surface-secondary text-text-primary"
          : "border-transparent text-text-secondary hover:border-border-primary hover:bg-surface-secondary hover:text-text-primary",
      )}
    >
      {item.label}
    </Link>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <header className="sticky top-0 z-40 border-b border-border-primary bg-surface-primary/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 px-4 py-3 sm:px-6 lg:px-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-primary bg-surface-secondary text-sm font-semibold text-text-primary">
              FP
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-text-primary">
                FixPro Admin
              </span>
              <span className="block truncate text-xs text-text-muted">
                Control room
              </span>
            </span>
          </Link>

          <nav
            className="flex justify-start gap-1 overflow-x-auto md:justify-center"
            aria-label="Navigazione admin"
          >
            {navItems.map((item) => (
              <AdminNavLink key={item.href} item={item} />
            ))}
          </nav>

          <div className="hidden justify-end md:flex">
            <span className="inline-flex h-8 items-center rounded-md border border-border-primary bg-surface-secondary px-3 text-xs font-medium text-text-secondary">
              Operativo
            </span>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}