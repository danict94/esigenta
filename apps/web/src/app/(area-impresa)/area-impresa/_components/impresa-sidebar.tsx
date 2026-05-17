"use client"

import {
  useState,
} from "react"
import Link from "next/link"
import {
  usePathname,
  useRouter,
} from "next/navigation"

import {
  cn,
} from "@fixpro/ui"

import {
  authClient,
} from "../../../../auth/client"

type NavigationItem = {
  label: string
  href: string
  enabled: boolean
  badge?: string
}

const mainNavigation: NavigationItem[] = [
  {
    label: "Nuove richieste",
    href: "/area-impresa/richieste",
    enabled: true,
  },
  {
    label: "Aggiornamenti",
    href: "/area-impresa/aggiornamenti",
    enabled: false,
  },
  {
    label: "Contatti",
    href: "/area-impresa/contatti",
    enabled: false,
  },
]

const accountNavigation: NavigationItem[] = [
  {
    label: "Richieste salvate",
    href: "/area-impresa/richieste-salvate",
    enabled: false,
  },
 {
    label: "configura servizi",
    href: "/area-impresa/configura-servizi",
    enabled: true,
  },

  {
    label: "Profilo",
    href: "/area-impresa/profilo",
    enabled: false,
  },
  {
    label: "Crediti",
    href: "/area-impresa/crediti",
    enabled: true,
  },
]

function isActivePath(
  pathname: string,
  href: string,
) {
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  )
}

function TopNavLink({
  item,
  onClick,
}: {
  item: NavigationItem
  onClick?: () => void
}) {
  const pathname = usePathname()
  const active =
    item.enabled &&
    isActivePath(pathname, item.href)

  if (!item.enabled) {
    return (
      <span
        className="relative inline-flex h-10 cursor-not-allowed items-center px-3 text-sm font-medium text-text-muted"
        aria-disabled="true"
        title="Sezione prevista per una fase successiva"
      >
        {item.label}

        {item.badge ? (
          <span className="absolute -right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
            {item.badge}
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-10 items-center px-3 text-sm font-semibold transition-colors",
        active
          ? "text-text-primary"
          : "text-text-secondary hover:text-text-primary",
      )}
    >
      <span className="relative">
        {item.label}

        {active ? (
          <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-brand-primary" />
        ) : null}
      </span>

      {item.badge ? (
        <span className="absolute -right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  )
}

function AccountMenuItem({
  item,
  onClick,
}: {
  item: NavigationItem
  onClick?: () => void
}) {
  if (!item.enabled) {
    return (
      <span
        className="block cursor-not-allowed px-5 py-3 text-sm font-medium text-text-primary"
        aria-disabled="true"
      >
        {item.label}
      </span>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="block px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
    >
      {item.label}
    </Link>
  )
}

export function ImpresaSidebar({
  accountLabel,
}: {
  accountLabel: string
}) {
  const router =
    useRouter()

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false)

  const [
    accountOpen,
    setAccountOpen,
  ] = useState(false)

  async function handleLogout() {
    await authClient.signOut()
    setAccountOpen(false)
    setMobileOpen(false)
    router.replace("/area-impresa/accedi")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border-primary bg-surface-primary">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
  href="/area-impresa/richieste"
  className="inline-flex min-w-0 items-center"
>
  <span className="truncate text-lg font-semibold tracking-tight text-text-primary">
    FixPro
  </span>
</Link>

        <div className="hidden items-center gap-7 md:flex">
          <nav
            className="flex items-center gap-3"
            aria-label="Navigazione area impresa"
          >
            {mainNavigation.map((item) => (
              <TopNavLink
                key={item.href}
                item={item}
              />
            ))}
          </nav>

          <div className="relative">
            <button
              type="button"
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-md border border-border-primary bg-surface-primary px-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary",
                accountOpen
                  ? "bg-surface-secondary"
                  : null,
              )}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() =>
                setAccountOpen((open) => !open)
              }
            >
              Il mio account
              <span
                className={cn(
                  "text-text-muted transition-transform",
                  accountOpen ? "rotate-180" : "",
                )}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>

            {accountOpen ? (
              <div
                className="absolute right-0 top-12 w-64 rounded-xl border border-border-primary bg-surface-elevated py-3 shadow-lg"
                role="menu"
              >
                <p className="px-5 pb-3 pt-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                  Account impresa
                </p>

                <p className="truncate px-5 pb-3 text-sm font-semibold text-text-primary">
                  {accountLabel}
                </p>

                <div className="border-t border-border-primary pt-2">
                  {accountNavigation.map((item) => (
                    <AccountMenuItem
                      key={item.href}
                      item={item}
                      onClick={() =>
                        setAccountOpen(false)
                      }
                    />
                  ))}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-5 py-3 text-left text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
                  >
                    Esci
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-primary bg-surface-primary text-text-primary transition-colors hover:bg-surface-secondary md:hidden"
          aria-label={
            mobileOpen
              ? "Chiudi menu"
              : "Apri menu"
          }
          aria-expanded={mobileOpen}
          onClick={() =>
            setMobileOpen((open) => !open)
          }
        >
          <span className="grid gap-1">
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-4 bg-current" />
          </span>
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border-primary bg-surface-primary px-4 py-4 md:hidden">
          <nav
            className="grid gap-1"
            aria-label="Menu area impresa"
          >
            {mainNavigation.map((item) => (
              <TopNavLink
                key={item.href}
                item={item}
                onClick={() =>
                  setMobileOpen(false)
                }
              />
            ))}
          </nav>

          <div className="mt-4 border-t border-border-primary pt-4">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
              Il mio account
            </p>

            <p className="truncate px-3 pb-3 text-sm font-semibold text-text-primary">
              {accountLabel}
            </p>

            <div className="grid gap-1">
              {accountNavigation.map((item) => (
                <AccountMenuItem
                  key={item.href}
                  item={item}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                />
              ))}

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-3 text-left text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
