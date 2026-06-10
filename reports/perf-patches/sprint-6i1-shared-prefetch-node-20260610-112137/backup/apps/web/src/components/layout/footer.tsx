import Link from "next/link";

import { CookiePreferencesButton } from "../privacy/cookie-preferences-button";
import { HomeContentRail } from "./home-content-rail";

const footerColumns = [
  {
    title: "Piattaforma",
    links: [{ href: "#", label: "Articoli" }],
  },
  {
    title: "Legale",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/cookie-policy", label: "Informativa sui cookie" },
      { href: "/termini", label: "Termini di servizio" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-0 bg-surface-footer text-text-on-hero-primary">
      <HomeContentRail>
        <div className="px-2 py-10 md:py-12 lg:py-14">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <Link
                href="/"
                className="text-xl font-medium tracking-tight"
                aria-label="esigenta home"
              >
                <span className="text-text-on-hero-primary">esi</span>
                <span className="text-brand-primary">genta</span>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-6 text-text-on-hero-secondary">
                Connetti con imprese artigianali verificate. Edilizia, impianti,
                finiture e molto altro.
              </p>
            </div>

            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-sm font-semibold text-text-on-hero-primary">
                  {column.title}
                </h2>

                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-on-hero-secondary transition-colors hover:text-text-on-hero-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}

                  {column.title === "Legale" ? (
                    <li>
                      <CookiePreferencesButton className="text-left text-sm text-text-on-hero-secondary transition-colors hover:text-text-on-hero-primary" />
                    </li>
                  ) : null}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-border-on-hero pt-6 text-xs text-text-on-hero-secondary md:flex-row md:items-center md:justify-between">
            <p>&copy; 2005-2026 esigenta web</p>
            <p>Piattaforma basata per il mercato casa</p>
          </div>
        </div>
      </HomeContentRail>
    </footer>
  );
}
