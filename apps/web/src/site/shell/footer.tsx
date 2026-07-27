import Link from "next/link";

import { EsigentaLogo } from "@esigenta/ui";

import { CookiePreferencesButton } from "./cookie-preferences-button";

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/cookie-policy", label: "Cookie" },
  { href: "/termini", label: "Termini" },
] as const;

type FooterLink = {
  href: string;
  label: string;
};

type FooterGroup = {
  title: string;
  links: readonly FooterLink[];
};

// Selezione volutamente limitata (non l'intera taxonomy): ambiti diversi dai
// 5 lavori gia' mostrati in home, tutti realmente pubblicati e indicizzabili.
const footerGroups: readonly FooterGroup[] = [
  {
    title: "Servizi per la casa",
    links: [
      { href: "/servizi", label: "Tutti i servizi" },
      { href: "/servizi/idraulica", label: "Idraulica" },
      { href: "/servizi/pavimentazioni", label: "Pavimentazioni" },
      { href: "/servizi/serramenti-e-infissi", label: "Serramenti e infissi" },
      { href: "/servizi/finiture", label: "Imbianchini e finiture" },
    ],
  },
  {
    title: "Guide e costi",
    links: [{ href: "/costi", label: "Guide ai costi" }],
  },
  {
    title: "Per le imprese",
    links: [
      { href: "/area-impresa", label: "Per professionisti e imprese" },
      { href: "/area-impresa/accedi", label: "Accedi alla tua area" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="eg-footer relative z-1 border-t border-eg-border bg-eg-surface px-5.5 pt-16 pb-8 min-[861px]:px-12">
      <div className="grid grid-cols-1 gap-8 pb-11 min-[861px]:grid-cols-3 min-[861px]:gap-10">
        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="eg-eyebrow font-(family-name:--eg-font-brand)">{group.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="eg-nav-link inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="flex flex-col justify-between gap-6 border-t border-eg-border pt-6 text-eg-text-muted min-[861px]:flex-row min-[861px]:items-center">
        <div className="flex items-center gap-4">
          <EsigentaLogo decorative className="h-5 w-auto shrink-0" />
          <p>&copy; 2026 esigenta</p>
        </div>

        <nav aria-label="Legale" className="flex flex-wrap gap-[18px]">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="text-inherit hover:text-eg-brand-strong"
            >
              {link.label}
            </Link>
          ))}

          <CookiePreferencesButton className="border-0 bg-transparent text-left font-[inherit] uppercase tracking-[inherit] text-inherit hover:text-eg-brand-strong" />
        </nav>
      </div>
    </footer>
  );
}
