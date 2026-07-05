import Link from "next/link";

import { CookiePreferencesButton } from "./cookie-preferences-button";

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/cookie-policy", label: "Cookie" },
  { href: "/termini", label: "Termini" },
] as const;

export function Footer() {
  return (
    <footer className="relative z-[1] flex flex-col justify-between gap-6 bg-eg-calce px-[22px] py-[30px] font-mono text-xs uppercase tracking-[0.08em] text-eg-ardesia-2 min-[861px]:flex-row min-[861px]:px-12 min-[861px]:py-[34px]">
      <p>&copy; 2026 esigenta</p>

      <nav aria-label="Legale" className="flex flex-wrap gap-[18px]">
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} prefetch={false} className="text-inherit">
            {link.label}
          </Link>
        ))}

        <CookiePreferencesButton className="border-0 bg-transparent text-left font-[inherit] uppercase tracking-[inherit] text-inherit" />
      </nav>
    </footer>
  );
}
