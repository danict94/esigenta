"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge, Button, Container, cn } from "@esigenta/ui";

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
      className="inline-flex items-center gap-3 text-[1.375rem] font-semibold leading-none tracking-[-0.06em] text-eg-terra focus:outline-none focus-visible:ring-2 focus-visible:ring-eg-cotto focus-visible:ring-offset-4 focus-visible:ring-offset-eg-calce md:text-2xl"
      aria-label="esigenta Admin dashboard"
    >
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-eg-cotto text-[0.875rem] font-semibold leading-none tracking-[-0.06em] text-eg-calce"
      >
        E
      </span>

      <span className="grid min-w-0 gap-0.5">
        <span className="truncate text-base font-semibold leading-none tracking-tight text-eg-terra">
          esigenta Admin
        </span>
        <span className="truncate text-xs font-medium leading-none text-eg-ardesia">
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
        "relative inline-flex items-center gap-2 py-2 text-[0.9375rem] font-medium leading-none tracking-[-0.06em] text-eg-terra transition-colors hover:text-eg-cotto focus:outline-none focus-visible:ring-2 focus-visible:ring-eg-cotto focus-visible:ring-offset-4 focus-visible:ring-offset-eg-calce",
        isActive && "text-eg-cotto",
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
          className="absolute inset-x-0 -bottom-0.5 h-px bg-eg-cotto"
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
        "flex items-center justify-between gap-3 px-2 py-3 text-base font-medium tracking-[-0.06em] text-eg-terra transition-colors hover:text-eg-cotto focus:outline-none focus-visible:ring-2 focus-visible:ring-eg-cotto focus-visible:ring-offset-2 focus-visible:ring-offset-eg-calce",
        isActive && "text-eg-cotto",
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
    <div className="min-h-screen bg-eg-calce text-eg-terra">
      <header className="sticky top-0 z-40 border-b border-eg-hairline bg-eg-calce-translucent backdrop-blur">
        <Container
          size="lg"
          gutter="md"
          className="flex h-16 items-center justify-between md:h-[4.5rem]"
        >
          <AdminLogo onClick={closeMenu} />

          <nav
            aria-label="Navigazione admin"
            className="hidden items-center gap-10 md:flex lg:gap-12 xl:gap-14"
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
            className="h-10 w-10 rounded-[6px] px-0 text-eg-terra hover:bg-eg-calce-2 focus-visible:ring-2 focus-visible:ring-eg-cotto focus-visible:ring-offset-2 focus-visible:ring-offset-eg-calce md:hidden"
            onClick={() => {
              setIsMenuOpen((current) => !current);
            }}
          >
            <MenuGlyph isOpen={isMenuOpen} />
          </Button>
        </Container>

        {isMenuOpen ? (
          <div className="border-t border-eg-hairline bg-eg-calce md:hidden">
            <Container size="lg" gutter="md">
              <nav
                aria-label="Navigazione admin mobile"
                className="flex flex-col gap-1 py-4"
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
