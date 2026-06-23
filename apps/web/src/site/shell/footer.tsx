import Link from "next/link";

import { CookiePreferencesButton } from "./cookie-preferences-button";
import { cc, ccFont } from "./palette";

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/cookie-policy", label: "Informativa sui cookie" },
  { href: "/termini", label: "Termini di servizio" },
] as const;

export function Footer() {
  return (
    <footer style={{ ...ccFont, backgroundColor: cc.paper, color: cc.ink }}>
      <div
        className="mx-auto flex max-w-[1120px] flex-col gap-6 border-t px-5 py-16 sm:px-10 sm:flex-row sm:items-center sm:justify-between lg:px-16"
        style={{ borderColor: cc.hairline }}
      >
        <p className="text-[13px]" style={{ color: cc.inkSecondary }}>
          &copy; 2026 esigenta
        </p>

        <nav
          aria-label="Legale"
          className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]"
          style={{ color: cc.inkSecondary }}
        >
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} prefetch={false}>
              {link.label}
            </Link>
          ))}

          <CookiePreferencesButton className="text-left" />
        </nav>
      </div>
    </footer>
  );
}
