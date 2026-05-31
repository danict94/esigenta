"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button, Container, cn, tokens } from "@fixpro/ui";

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
  const visibleNavLinks =
    variant === "funnel" ? navLinks.slice(1) : navLinks;

  function closeMenu() {
    setIsMenuOpen(false);
  }

  if (variant === "hero") {
    return (
      <header className="pointer-events-none absolute inset-0 z-50">
        <Logo
          onClick={closeMenu}
          className={tokens.home.nav.heroLogo}
        />

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

        <nav className={tokens.home.nav.heroMenu}>
          {visibleNavLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              accent={link.accent}
              onClick={closeMenu}
              className={cn(
                "text-sm font-medium text-text-on-hero-secondary hover:text-text-on-hero-primary",
                link.accent && "text-text-on-hero-primary",
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
  const isFunnel = variant === "funnel";

  return (
    <header
      className={cn(
        "relative z-50",
        !isEmbedded && !isFunnel && "border-b border-border-primary",
      )}
    >
      <Container
        size={isEmbedded ? "lg" : "full"}
        gutter={isEmbedded ? "none" : "sm"}
        className={cn(
          "flex items-center justify-between",
          !isEmbedded && tokens.home.railFrame,
          isEmbedded
            ? cn("h-14 md:h-16 lg:h-20", tokens.layout.marketing.heroGutter)
            : tokens.home.nav.defaultContainer,
        )}
      >
        <Logo
          onClick={closeMenu}
          className={cn(
            isEmbedded
              ? "text-lg font-medium md:text-xl lg:text-2xl"
              : "text-lg font-medium md:text-xl",
          )}
          inverse={isEmbedded}
        />

        <nav className={cn("hidden items-center md:flex", isEmbedded ? "gap-6 lg:gap-9" : "gap-8")}>
          {visibleNavLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              accent={link.accent}
              onClick={closeMenu}
              className={cn(
                isEmbedded
                  ? "text-xs font-medium text-text-on-hero-secondary hover:text-text-on-hero-primary lg:text-sm"
                  : "text-sm font-medium text-text-secondary hover:text-action-primary",
                link.accent &&
                  (isEmbedded
                    ? "text-text-on-hero-primary"
                    : "text-text-primary"),
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
            "md:hidden",
            isEmbedded &&
              "text-text-on-hero-primary hover:bg-transparent hover:text-text-on-hero-primary",
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
            "border-t border-border-primary md:hidden",
            !isEmbedded && "bg-surface-primary",
          )}
        >
          <Container
            size={isEmbedded ? "lg" : "full"}
            gutter={isEmbedded ? "md" : "sm"}
            className={!isEmbedded ? tokens.home.railFrame : undefined}
          >
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
      className={cn("tracking-tight", className ?? "text-lg font-medium")}
      aria-label="esigenta home"
    >
      <span className={inverse ? "text-text-on-hero-primary" : "text-text-primary"}>
        esi
      </span>
      <span className="text-brand-primary">genta</span>
    </Link>
  );
}

type NavLinkProps = {
  accent?: boolean;
  className?: string;
  href: string;
  label: string;
  onClick: () => void;
};

function NavLink({
  accent = false,
  className,
  href,
  label,
  onClick,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("transition-colors", className)}
    >
      <span>{label}</span>
      {accent ? (
        <span
          aria-hidden="true"
          className="mt-1 block h-0.5 w-full bg-brand-primary"
        />
      ) : null}
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
    <div className="pointer-events-auto absolute left-0 right-0 top-14 border-t border-border-primary bg-surface-secondary lg:hidden">
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
    <nav className="flex flex-col gap-1 py-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClick}
          className={cn(
            "px-2 py-3 text-sm transition-colors hover:text-brand-primary",
            inverse ? "text-text-on-hero-primary" : "text-text-primary",
            link.accent && "font-medium text-brand-primary",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
