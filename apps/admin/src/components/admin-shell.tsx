"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge, Button, Container, cn, tokens } from "@fixpro/ui";

type AdminShellProps = {
  children: ReactNode;
  unreadSupportCount?: number;
};

type AdminNavItem = {
  label: string;
  href: string;
  badge?: string | null;
};

const navItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Richieste", href: "/requests" },
  {
    label: "Imprese",
    href: "/imprese",
  },
  { label: "Crediti", href: "/crediti/pacchetti" },
  {
    label: "Rimborsi",
    href: "/crediti/rimborsi/richieste",
  },
  { label: "Assistenza", href: "/support" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatBadgeCount(count: number) {
  if (count <= 0) {
    return null;
  }

  return count > 99 ? "99+" : String(count);
}

function AdminLogo({ onClick }: { onClick: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(tokens.home.nav.logo, "gap-3")}
      aria-label="esigenta Admin dashboard"
    >
      <span aria-hidden="true" className={tokens.home.nav.logoMark}>
        E
      </span>

      <span className="grid min-w-0 gap-0.5">
        <span className="truncate text-base font-semibold leading-none tracking-tight text-text-primary">
          esigenta Admin
        </span>
        <span className="truncate text-xs font-medium leading-none text-text-muted">
          Control room
        </span>
      </span>
    </Link>
  );
}

function MenuGlyph({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className="flex h-5 w-5 flex-col items-center justify-center gap-1"
      aria-hidden="true"
    >
      <span
        className={cn(
          "h-px w-5 bg-current transition-transform",
          isOpen && "translate-y-1 rotate-45",
        )}
      />
      <span
        className={cn(
          "h-px w-5 bg-current transition-opacity",
          isOpen && "opacity-0",
        )}
      />
      <span
        className={cn(
          "h-px w-5 bg-current transition-transform",
          isOpen && "-translate-y-1 -rotate-45",
        )}
      />
    </span>
  );
}

function DesktopNavLink({
  item,
  onClick,
}: {
  item: AdminNavItem;
  onClick: () => void;
}) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        tokens.home.nav.link,
        "relative inline-flex items-center gap-2 py-2",
        isActive && "text-accent-warm",
      )}
    >
      <span>{item.label}</span>

      {item.badge ? (
        <Badge variant="danger" size="sm">
          {item.badge}
        </Badge>
      ) : null}

      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-0.5 h-px bg-accent-warm"
        />
      ) : null}
    </Link>
  );
}

function MobileNavLink({
  item,
  onClick,
}: {
  item: AdminNavItem;
  onClick: () => void;
}) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        tokens.home.nav.mobileLink,
        "flex items-center justify-between gap-3",
        isActive && "text-accent-warm",
      )}
    >
      <span>{item.label}</span>

      {item.badge ? (
        <Badge variant="danger" size="sm">
          {item.badge}
        </Badge>
      ) : null}
    </Link>
  );
}

export function AdminShell({
  children,
  unreadSupportCount = 0,
}: AdminShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supportBadge = formatBadgeCount(unreadSupportCount);
  const visibleNavItems = navItems.map((item) =>
    item.href === "/support" && supportBadge
      ? {
          ...item,
          badge: supportBadge,
        }
      : item,
  );

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <header className="sticky top-0 z-40 border-b border-border-primary bg-surface-elevated/95 backdrop-blur">
        <Container size="lg" gutter="md" className={tokens.home.nav.container}>
          <AdminLogo onClick={closeMenu} />

          <nav
            aria-label="Navigazione admin"
            className={tokens.home.nav.desktopMenu}
          >
            {visibleNavItems.map((item) => (
              <DesktopNavLink key={item.href} item={item} onClick={closeMenu} />
            ))}
          </nav>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={isMenuOpen ? "Chiudi menu admin" : "Apri menu admin"}
            aria-expanded={isMenuOpen}
            className={tokens.home.nav.mobileToggle}
            onClick={() => {
              setIsMenuOpen((current) => !current);
            }}
          >
            <MenuGlyph isOpen={isMenuOpen} />
          </Button>
        </Container>

        {isMenuOpen ? (
          <div className={tokens.home.nav.mobilePanel}>
            <Container size="lg" gutter="md">
              <nav
                aria-label="Navigazione admin mobile"
                className={tokens.home.nav.mobileMenu}
              >
                {visibleNavItems.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    item={item}
                    onClick={closeMenu}
                  />
                ))}
              </nav>
            </Container>
          </div>
        ) : null}
      </header>

      {children}
    </div>
  );
}
