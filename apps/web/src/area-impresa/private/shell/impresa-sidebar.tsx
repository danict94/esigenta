"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button, Card, cn } from "@esigenta/ui";

import { authClient } from "../../../auth/client";
import {
  ChevronDownIcon,
  CloseIcon,
  CreditCoinIcon,
  MenuIcon,
} from "../../../site/shell/icons";

type NavigationItem = {
  label: string;
  href: string;
  enabled: boolean;
  badge?: string;
  disabledReason?: string;
};

const mainNavigation: NavigationItem[] = [
  {
    label: "Nuove richieste",
    href: "/area-impresa/richieste",
    enabled: true,
  },
  {
    label: "Notifiche",
    href: "/area-impresa/notifiche",
    enabled: true,
  },
  {
    label: "Contatti",
    href: "/area-impresa/contatti",
    enabled: true,
  },
  {
    label: "Assistenza",
    href: "/area-impresa/assistenza",
    enabled: true,
  },
];

const accountNavigation: NavigationItem[] = [
  {
    label: "Richieste salvate",
    href: "/area-impresa/richieste-salvate",
    enabled: true,
  },
  {
    label: "Richieste acquistate",
    href: "/area-impresa/richieste-acquistate",
    enabled: true,
  },
  {
    label: "Configura servizi",
    href: "/area-impresa/configura-servizi",
    enabled: true,
  },
  {
    label: "Profilo",
    href: "/area-impresa/profilo",
    enabled: true,
  },
  {
    label: "Crediti",
    href: "/area-impresa/crediti",
    enabled: true,
  },
];

const commercialNavigationHrefs = new Set([
  "/area-impresa/richieste",
  "/area-impresa/contatti",
  "/area-impresa/richieste-salvate",
  "/area-impresa/richieste-acquistate",
  "/area-impresa/crediti",
]);

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatUnreadCount(count: number) {
  if (count <= 0) {
    return null;
  }

  return count > 99 ? "99+" : String(count);
}

function Brand() {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="text-[17px] font-semibold tracking-[-0.01em] text-cantiere-ink">
        esigenta
      </span>

      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cantiere-accent">
        Imprese
      </span>
    </span>
  );
}

function NavBadge({ value }: { value: string }) {
  return (
    <span className="ml-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cantiere-accent px-1 text-[11px] font-semibold leading-none text-cantiere-paper">
      {value}
    </span>
  );
}

function CreditBalanceChip({
  balance,
  onClick,
}: {
  balance: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/area-impresa/crediti"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-cantiere-hairline bg-cantiere-surface px-3 py-1.5 text-xs font-semibold text-cantiere-ink transition-colors hover:border-cantiere-accent"
      prefetch={false}
    >
      <CreditCoinIcon className="size-3.5 text-cantiere-ink-secondary" />
      {balance} {balance === 1 ? "credito" : "crediti"}
    </Link>
  );
}

function DesktopNavLink({
  item,
  active,
}: {
  item: NavigationItem;
  active: boolean;
}) {
  const className = cn(
    "relative inline-flex h-[72px] items-center gap-1.5 text-sm font-medium transition-colors",
    active
      ? "text-cantiere-accent"
      : "text-cantiere-ink-secondary hover:text-cantiere-ink",
    !item.enabled ? "cursor-not-allowed text-cantiere-ink-secondary" : "",
  );

  const content = (
    <>
      <span>{item.label}</span>

      {item.badge ? <NavBadge value={item.badge} /> : null}

      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 bg-cantiere-accent"
        />
      ) : null}
    </>
  );

  if (!item.enabled) {
    return (
      <span
        className={className}
        aria-disabled="true"
        title={item.disabledReason ?? "Sezione non disponibile"}
      >
        {content}
      </span>
    );
  }

  return (
    <Link href={item.href} className={className} prefetch={false}>
      {content}
    </Link>
  );
}

function MobileNavLink({
  item,
  active,
  onClick,
}: {
  item: NavigationItem;
  active: boolean;
  onClick: () => void;
}) {
  const className = cn(
    "flex items-center justify-between gap-3 px-2 py-3 text-sm font-medium transition-colors",
    active
      ? "text-cantiere-accent"
      : "text-cantiere-ink-secondary hover:text-cantiere-ink",
    !item.enabled ? "cursor-not-allowed text-cantiere-ink-secondary" : "",
  );

  const content = (
    <>
      <span>{item.label}</span>

      {item.badge ? <NavBadge value={item.badge} /> : null}
    </>
  );

  if (!item.enabled) {
    return (
      <span
        className={className}
        aria-disabled="true"
        title={item.disabledReason}
      >
        {content}
      </span>
    );
  }

  return (
    <Link href={item.href} onClick={onClick} className={className} prefetch={false}>
      {content}
    </Link>
  );
}

function AccountMenuItem({
  item,
  active,
  onClick,
}: {
  item: NavigationItem;
  active: boolean;
  onClick: () => void;
}) {
  const className = cn(
    "block px-5 py-3 text-sm font-medium transition-colors",
    item.enabled &&
      "hover:bg-cantiere-linen",
    item.enabled && active
      ? "text-cantiere-accent"
      : item.enabled
        ? "text-cantiere-ink"
        : "cursor-not-allowed text-cantiere-ink-secondary",
  );

  if (!item.enabled) {
    return (
      <span
        className={className}
        role="menuitem"
        aria-disabled="true"
        title={item.disabledReason}
      >
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={className}
      role="menuitem"
      prefetch={false}
    >
      {item.label}
    </Link>
  );
}

export function ImpresaSidebar({
  accountLabel,
  unreadNotificationCount,
  unreadContactCount,
  unreadSupportCount,
  marketplaceEnabled,
  creditBalance,
}: {
  accountLabel: string;
  unreadNotificationCount: number;
  unreadContactCount: number;
  unreadSupportCount: number;
  marketplaceEnabled: boolean;
  creditBalance: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const notificationBadge = formatUnreadCount(unreadNotificationCount);
  const contactBadge = formatUnreadCount(unreadContactCount);
  const supportBadge = formatUnreadCount(unreadSupportCount);
  const disabledReason = marketplaceEnabled
    ? undefined
    : "Disponibile dopo approvazione del profilo impresa";

  const mainNavigationItems = mainNavigation.map((item) => {
    const availability =
      !marketplaceEnabled &&
      commercialNavigationHrefs.has(item.href)
        ? {
            enabled: false,
            disabledReason,
          }
        : {};

    if (item.href === "/area-impresa/notifiche" && notificationBadge) {
      return {
        ...item,
        ...availability,
        badge: notificationBadge,
      };
    }

    if (item.href === "/area-impresa/contatti" && contactBadge) {
      return {
        ...item,
        ...availability,
        badge: contactBadge,
      };
    }

    if (item.href === "/area-impresa/assistenza" && supportBadge) {
      return {
        ...item,
        ...availability,
        badge: supportBadge,
      };
    }

    return {
      ...item,
      ...availability,
    };
  });
  const accountNavigationItems = accountNavigation.map((item) =>
    !marketplaceEnabled &&
    commercialNavigationHrefs.has(item.href)
      ? {
          ...item,
          enabled: false,
          disabledReason,
        }
      : item,
  );

  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    function handleMouseDown(event: MouseEvent) {
      const target = event.target;

      if (
        !(target instanceof Node) ||
        !accountMenuRef.current ||
        accountMenuRef.current.contains(target)
      ) {
        return;
      }

      setAccountOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountOpen]);

  function closeMenus() {
    setIsMenuOpen(false);
    setAccountOpen(false);
  }

  async function handleLogout() {
    await authClient.signOut();
    closeMenus();
    router.replace("/area-impresa/accedi");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-cantiere-hairline bg-cantiere-paper">
      <div className="mx-auto flex h-[72px] items-center justify-between px-5 sm:px-10 lg:px-16">
        <Link
          href="/area-impresa/richieste"
          onClick={closeMenus}
          aria-label="esigenta Imprese"
          prefetch={false}
        >
          <Brand />
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navigazione area impresa"
        >
          {mainNavigationItems.map((item) => (
            <DesktopNavLink
              key={item.href}
              item={item}
              active={item.enabled && isActivePath(pathname, item.href)}
            />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CreditBalanceChip balance={creditBalance} />

          <div ref={accountMenuRef} className="relative">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => setAccountOpen((open) => !open)}
            >
              <span className="max-w-40 truncate">Il mio account</span>

              <ChevronDownIcon
                className={cn(
                  "size-4 text-cantiere-ink-secondary transition-transform",
                  accountOpen ? "rotate-180" : "",
                )}
              />
            </Button>

            {accountOpen ? (
              <Card
                className="absolute right-0 top-12 w-72 py-3 shadow-lg"
                role="menu"
              >
                <div className="border-b border-cantiere-hairline px-5 pb-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-cantiere-ink-secondary">
                    Account impresa
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-cantiere-ink">
                    {accountLabel}
                  </p>
                </div>

                <nav className="py-2">
                  {accountNavigationItems.map((item) => (
                    <AccountMenuItem
                      key={item.href}
                      item={item}
                      active={
                        item.enabled &&
                        isActivePath(pathname, item.href)
                      }
                      onClick={closeMenus}
                    />
                  ))}
                </nav>

                <div className="border-t border-cantiere-hairline px-3 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    Esci
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={isMenuOpen}
          className="md:hidden"
          onClick={() => {
            setIsMenuOpen((current) => !current);
            setAccountOpen(false);
          }}
        >
          {isMenuOpen ? (
            <CloseIcon className="size-5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </Button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-cantiere-hairline bg-cantiere-paper md:hidden">
          <div className="px-5 sm:px-10">
            <nav
              className="flex flex-col gap-1 py-4"
              aria-label="Navigazione area impresa mobile"
            >
              <div className="px-2 pb-3">
                <CreditBalanceChip
                  balance={creditBalance}
                  onClick={closeMenus}
                />
              </div>

              {mainNavigationItems.map((item) => (
                <MobileNavLink
                  key={item.href}
                  item={item}
                  active={item.enabled && isActivePath(pathname, item.href)}
                  onClick={closeMenus}
                />
              ))}

              <div className="my-2 border-t border-cantiere-hairline" />

              <p className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-cantiere-ink-secondary">
                Il mio account
              </p>

              {accountNavigationItems.map((item) => (
                <MobileNavLink
                  key={item.href}
                  item={item}
                  active={item.enabled && isActivePath(pathname, item.href)}
                  onClick={closeMenus}
                />
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 justify-start"
                onClick={handleLogout}
              >
                Esci
              </Button>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
