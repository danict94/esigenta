"use client"

import Link from "next/link"
import {
  Menu,
  X,
} from "lucide-react"
import {
  useState,
} from "react"

import {
  Button,
  Container,
} from "@fixpro/ui"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false)

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <header className="relative z-50 border-b border-border-primary bg-surface-primary">
      <Container
        size="xl"
        className="flex h-16 items-center justify-between md:h-20"
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="text-2xl font-bold tracking-tight md:text-3xl"
          aria-label="Esigenta home"
        >
          <span className="text-text-primary">Esi</span>
          <span className="text-brand-primary">genta</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/richieste/accesso"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Le mie richieste
          </Link>

          <Link
            href="/area-impresa/accedi"
            className="text-base text-text-primary transition-colors hover:text-brand-primary"
          >
            Accedi
          </Link>

          <Link
            href="/area-impresa"
            className="group text-base text-text-primary transition-colors hover:text-brand-primary"
          >
            <span>Sei un professionista?</span>
            <span
              aria-hidden="true"
              className="mt-1 block h-0.5 w-full bg-brand-primary"
            />
          </Link>
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={
            isMenuOpen
              ? "Chiudi menu"
              : "Apri menu"
          }
          aria-expanded={isMenuOpen}
          className="md:hidden"
          onClick={() => {
            setIsMenuOpen((current) => !current)
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
        <div className="border-t border-border-primary bg-surface-primary md:hidden">
          <Container size="xl">
            <nav className="flex flex-col gap-1 py-4">
              <Link
                href="/richieste/accesso"
                onClick={closeMenu}
                className="px-2 py-3 text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                Le mie richieste
              </Link>

              <Link
                href="/area-impresa/accedi"
                onClick={closeMenu}
                className="px-2 py-3 text-sm text-text-primary transition-colors hover:text-brand-primary"
              >
                Accedi
              </Link>

              <Link
                href="/area-impresa"
                onClick={closeMenu}
                className="px-2 py-3 text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
              >
                Sei un professionista?
              </Link>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  )
}