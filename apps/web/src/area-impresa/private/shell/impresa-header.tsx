"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button, Card, cn, useDismissableMenu } from "@esigenta/ui";

import { authClient } from "../../../auth/client";
import {
  headerGutterClassName,
  headerHeightClassName,
  headerSurfaceClassName,
  headerTriggerBaseClassName,
  headerTriggerSolidClassName,
} from "../../../site/shell/header-gutter";
import {
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
} from "../../../site/shell/icons";
import { ProBrand } from "../../shared/pro-brand";

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

// Stessa geometria di Button (ghost) per l'azione testuale "Esci":
// qui si sovrascrivono i colori e si sostituisce il ring del componente
// globale con l'outline condiviso dagli header (vedi Esigenta Header Shell).
const logoutActionClassName =
  "border-eg-border text-eg-ink hover:bg-eg-brand-soft hover:text-eg-brand-strong focus-visible:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eg-brand-strong";

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
      className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-eg-brand-soft text-sm font-semibold text-eg-brand-strong"
      aria-hidden="true"
    >
      {getInitials(label)}
    </span>
  );
}

function NavBadge({ value }: { value: string }) {
  return (
    <span className="ml-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-eg-brand px-1 text-[11px] font-semibold leading-none text-eg-on-brand">
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
    <div className="flex items-center gap-2.5 rounded-full border border-eg-border bg-eg-surface-muted py-[7px] pr-[7px] pl-4 font-(family-name:--eg-font-ui)">
      <span className="text-[10px] uppercase tracking-[0.08em] text-eg-text-muted">
        Credito
      </span>
      <span className="text-base font-medium text-eg-ink">
        {balance}
      </span>
      <Link
        href="/area-impresa/crediti"
        onClick={onClick}
        prefetch={false}
        className="rounded-full bg-eg-brand px-[13px] py-[7px] text-[11px] text-eg-on-brand transition-colors hover:bg-eg-brand-strong"
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
    "eg-nav-link relative inline-flex items-center gap-1.5",
    headerHeightClassName,
    active
      ? "text-eg-brand-strong"
      : "text-eg-text-muted hover:text-eg-ink",
    !item.enabled ? "cursor-not-allowed text-eg-text-muted" : "",
  );

  const content = (
    <>
      <span>{item.label}</span>

      {item.badge ? <NavBadge value={item.badge} /> : null}

      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 bg-eg-brand-strong"
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
    "eg-nav-link flex items-center justify-between gap-3 px-2 py-3",
    active
      ? "text-eg-brand-strong"
      : "text-eg-text-muted hover:text-eg-ink",
    !item.enabled ? "cursor-not-allowed text-eg-text-muted" : "",
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
      "hover:bg-eg-surface-muted",
    item.enabled && active
      ? "text-eg-brand-strong"
      : item.enabled
        ? "text-eg-ink"
        : "cursor-not-allowed text-eg-text-muted",
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

export function ImpresaHeader({
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

  const {
    isOpen: isMobileMenuOpen,
    containerRef: mobileMenuRef,
    toggle: toggleMobileMenuState,
    close: closeMobileMenu,
  } = useDismissableMenu();
  const {
    isOpen: isAccountMenuOpen,
    containerRef: accountMenuRef,
    toggle: toggleAccountMenuState,
    close: closeAccountMenu,
  } = useDismissableMenu<HTMLDivElement>();

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

  function toggleMobileMenu() {
    closeAccountMenu();
    toggleMobileMenuState();
  }

  function toggleAccountMenu() {
    closeMobileMenu();
    toggleAccountMenuState();
  }

  function closeMenus() {
    closeMobileMenu();
    closeAccountMenu();
  }

  async function handleLogout() {
    await authClient.signOut();
    closeMenus();
    router.replace("/area-impresa/accedi");
    router.refresh();
  }

  return (
    <header
      ref={mobileMenuRef}
      className={cn("sticky top-0 z-50", headerSurfaceClassName)}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between",
          headerHeightClassName,
          headerGutterClassName,
        )}
      >
        <Link
          href="/area-impresa/richieste"
          onClick={closeMenus}
          aria-label="Esigenta — area professionisti"
          prefetch={false}
        >
          <span className="inline-flex items-center text-eg-ink">
            <ProBrand />
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 min-[861px]:flex"
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

        <div className="hidden items-center gap-3 min-[861px]:flex">
          <CreditBalanceChip balance={creditBalance} />

          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eg-brand-strong"
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="menu"
              aria-label="Il mio account"
              onClick={toggleAccountMenu}
            >
              <Avatar label={accountLabel} />

              <ChevronDownIcon
                className={cn(
                  "size-4 text-eg-text-muted transition-transform",
                  isAccountMenuOpen ? "rotate-180" : "",
                )}
              />
            </button>

            {isAccountMenuOpen ? (
              <Card
                className="absolute right-0 top-12 w-72 py-3 shadow-lg"
                role="menu"
              >
                <div className="border-b border-eg-border px-5 pb-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-eg-text-muted">
                    Account impresa
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-eg-ink">
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

                <div className="border-t border-eg-border px-3 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn("w-full justify-start", logoutActionClassName)}
                    onClick={handleLogout}
                  >
                    Esci
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className={cn(headerTriggerBaseClassName, headerTriggerSolidClassName)}
          aria-label={isMobileMenuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={isMobileMenuOpen}
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <CloseIcon className="size-5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-eg-border bg-eg-surface min-[861px]:hidden">
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

              <div className="my-2 border-t border-eg-border" />

              <p className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-eg-text-muted">
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
                className={cn("mt-2 justify-start", logoutActionClassName)}
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
