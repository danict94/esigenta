"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button, Card, EsigentaWordmark, cn } from "@esigenta/ui";

import { authClient } from "../../../auth/client";
import {
  ChevronDownIcon,
  CloseIcon,
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

function getInitials(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "?";
}

function Avatar({ label }: { label: string }) {
  return (
    <span
      className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-eg-salvia text-sm font-semibold text-eg-calce"
      aria-hidden="true"
    >
      {getInitials(label)}
    </span>
  );
}

function Brand() {
  return (
    <span className="inline-flex items-center gap-[13px] text-eg-terra">
      <EsigentaWordmark decorative className="block h-[22px] w-auto" />
      <small className="eg-pro-tag">/ pro</small>
    </span>
  );
}

function NavBadge({ value }: { value: string }) {
  return (
    <span className="ml-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-eg-cotto px-1 text-[11px] font-semibold leading-none text-eg-calce">
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
    <div className="flex items-center gap-2.5 rounded-full border border-eg-hairline bg-eg-calce-2 py-[7px] pr-[7px] pl-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-eg-ardesia">
        Credito
      </span>
      <span className="font-mono text-base font-medium text-eg-terra">
        {balance}
      </span>
      <Link
        href="/area-impresa/crediti"
        onClick={onClick}
        prefetch={false}
        className="rounded-full bg-eg-terra px-[13px] py-[7px] font-mono text-[11px] text-eg-calce transition-colors hover:bg-eg-cotto-dark"
      >
        Ricarica
      </Link>
    </div>
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
      ? "text-eg-cotto"
      : "text-eg-ardesia hover:text-eg-terra",
    !item.enabled ? "cursor-not-allowed text-eg-ardesia" : "",
  );

  const content = (
    <>
      <span>{item.label}</span>

      {item.badge ? <NavBadge value={item.badge} /> : null}

      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 bg-eg-cotto"
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
      ? "text-eg-cotto"
      : "text-eg-ardesia hover:text-eg-terra",
    !item.enabled ? "cursor-not-allowed text-eg-ardesia" : "",
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
      "hover:bg-eg-calce-2",
    item.enabled && active
      ? "text-eg-cotto"
      : item.enabled
        ? "text-eg-terra"
        : "cursor-not-allowed text-eg-ardesia",
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
  requestPreviewEnabled,
  creditBalance,
}: {
  accountLabel: string;
  unreadNotificationCount: number;
  unreadContactCount: number;
  unreadSupportCount: number;
  marketplaceEnabled: boolean;
  requestPreviewEnabled: boolean;
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
    const requestPreviewAvailable =
      requestPreviewEnabled &&
      item.href === "/area-impresa/richieste";
    const availability =
      !marketplaceEnabled &&
      !requestPreviewAvailable &&
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
    <header className="sticky top-0 z-50 border-b border-eg-hairline bg-eg-calce">
      <div className="mx-auto flex h-[72px] items-center justify-between px-5 sm:px-10 lg:px-16">
        <Link
          href="/area-impresa/richieste"
          onClick={closeMenus}
          aria-label="esigenta / pro"
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
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-eg-cotto"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              aria-label="Il mio account"
              onClick={() => setAccountOpen((open) => !open)}
            >
              <Avatar label={accountLabel} />

              <ChevronDownIcon
                className={cn(
                  "size-4 text-eg-ardesia transition-transform",
                  accountOpen ? "rotate-180" : "",
                )}
              />
            </button>

            {accountOpen ? (
              <Card
                className="absolute right-0 top-12 w-72 py-3 shadow-lg"
                role="menu"
              >
                <div className="border-b border-eg-hairline px-5 pb-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-eg-ardesia">
                    Account impresa
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-eg-terra">
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

                <div className="border-t border-eg-hairline px-3 pt-3">
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
        <div className="border-t border-eg-hairline bg-eg-calce md:hidden">
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

              <div className="my-2 border-t border-eg-hairline" />

              <p className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-eg-ardesia">
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
