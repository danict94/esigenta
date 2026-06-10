"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button, Container, cn, tokens } from "@esigenta/ui";

export type NavbarVariant = "default" | "embedded" | "hero" | "funnel";

type NavbarProps = {
  variant?: NavbarVariant;
};

type NavItem = {
  accent?: boolean;
  href: string;
  label: string;
};

const navLinks: NavItem[] = [
  {
    href: "/richieste/accesso",
    label: "Le mie richieste",
  },
  {
    href: "/area-impresa/accedi",
    label: "Accedi",
  },
  {
    href: "/area-impresa",
    label: "Sei un professionista?",
    accent: true,
  },
] as const;

export function Navbar({ variant = "default" }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const visibleNavLinks = variant === "funnel" ? navLinks.slice(1) : navLinks;

  function closeMenu() {
    setIsMenuOpen(false);
  }

  if (variant === "hero") {
    return (
      <header className="pointer-events-none absolute inset-0 z-50">
        <Logo onClick={closeMenu} className={tokens.home.nav.heroLogo} />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={isMenuOpen}
          className="pointer-events-auto absolute right-4 top-3 lg:hidden"
          onClick={() => {
            setIsMenuOpen((current) => !current);
          }}
        >
          {isMenuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </Button>

        <nav
          aria-label="Navigazione principale"
          className={tokens.home.nav.heroMenu}
        >
          {visibleNavLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              onClick={closeMenu}
              className={cn(
                tokens.home.nav.heroLink,
                link.accent && tokens.home.nav.heroAccentLink,
              )}
            />
          ))}
        </nav>

        {isMenuOpen ? (
          <MobileMenu links={visibleNavLinks} onClick={closeMenu} />
        ) : null}
      </header>
    );
  }

  const isEmbedded = variant === "embedded";

  return (
    <header
      className={cn(
        tokens.home.nav.root,
        isEmbedded && tokens.home.nav.embeddedRoot,
      )}
    >
      <Container
        size="lg"
        gutter="md"
        className={cn(
          isEmbedded
            ? cn(tokens.home.nav.container, tokens.home.nav.embeddedContainer)
            : tokens.home.nav.container,
        )}
      >
        <Logo onClick={closeMenu} inverse={isEmbedded} />

        <nav
          aria-label="Navigazione principale"
          className={cn(
            tokens.home.nav.desktopMenu,
            isEmbedded && tokens.home.nav.desktopMenuEmbedded,
          )}
        >
          {visibleNavLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              onClick={closeMenu}
              className={cn(
                tokens.home.nav.link,
                isEmbedded ? tokens.home.nav.linkEmbedded : undefined,
                link.accent &&
                  (isEmbedded
                    ? tokens.home.nav.accentLinkEmbedded
                    : tokens.home.nav.accentLink),
              )}
            />
          ))}
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={isMenuOpen}
          className={cn(
            tokens.home.nav.mobileToggle,
            isEmbedded && tokens.home.nav.mobileToggleEmbedded,
          )}
          onClick={() => {
            setIsMenuOpen((current) => !current);
          }}
        >
          {isMenuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </Button>
      </Container>

      {isMenuOpen ? (
        <div
          className={cn(
            tokens.home.nav.mobilePanel,
            isEmbedded && tokens.home.nav.mobilePanelEmbedded,
          )}
        >
          <Container size="lg" gutter="md">
            <MobileMenuContent
              links={visibleNavLinks}
              onClick={closeMenu}
              inverse={isEmbedded}
            />
          </Container>
        </div>
      ) : null}
    </header>
  );
}

type LogoProps = {
  className?: string;
  inverse?: boolean;
  onClick: () => void;
};

function Logo({ className, inverse = false, onClick }: LogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        tokens.home.nav.logo,
        inverse && tokens.home.nav.logoInverse,
        className,
      )}
      aria-label="esigenta home"
    >
      <span
        aria-hidden="true"
        className={cn(
          tokens.home.nav.logoMark,
          inverse && tokens.home.nav.logoMarkInverse,
        )}
      >
        e
      </span>

      <span className={tokens.home.nav.logoText}>
        <span>esi</span>
        <span className="text-accent-warm">genta</span>
      </span>
    </Link>
  );
}

type NavLinkProps = {
  className?: string;
  href: string;
  label: string;
  onClick: () => void;
};

function NavLink({ className, href, label, onClick }: NavLinkProps) {
  return (
    <Link href={href} onClick={onClick} className={className}>
      <span>{label}</span>
    </Link>
  );
}

function MobileMenu({
  links,
  onClick,
}: {
  links: NavItem[];
  onClick: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute left-0 right-0 top-14 border-t border-border-primary bg-surface-elevated lg:hidden">
      <Container size="lg">
        <MobileMenuContent links={links} onClick={onClick} />
      </Container>
    </div>
  );
}

function MobileMenuContent({
  inverse = false,
  links,
  onClick,
}: {
  inverse?: boolean;
  links: NavItem[];
  onClick: () => void;
}) {
  return (
    <nav
      aria-label="Navigazione principale"
      className={tokens.home.nav.mobileMenu}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClick}
          className={cn(
            tokens.home.nav.mobileLink,
            inverse && tokens.home.nav.mobileLinkEmbedded,
            link.accent && tokens.home.nav.mobileAccentLink,
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
