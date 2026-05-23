import {
  cn,
  Container,
  tokens,
} from "@fixpro/ui"

import { FunnelEntry } from "./funnel-entry"

type IllustrationSource =
  | string
  | null

const heroIllustrationSrc: IllustrationSource =
  null

export function Hero() {
  return (
    <section className="pb-8 md:pb-10">
      <Container size="full" gutter="sm">
        <div
          className={cn(
            tokens.surfaces.hero,
            "relative overflow-visible px-6 py-10 md:px-12 md:py-12 lg:px-24 lg:py-14",
          )}
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
            <div className="flex flex-col gap-8 lg:pl-12 xl:pl-20">
              <div className="flex flex-col gap-5">
                <h1
                  className={cn(
                    "max-w-2xl text-text-primary",
                    tokens.typography.hero,
                  )}
                >
                  <span className="block">
                    Trova il professionista
                  </span>

                  <span
                    className={cn(
                      "block",
                      tokens.typography.heroSecondary,
                    )}
                  >
                    <span className="text-brand-primary">
                      giusto
                    </span>{" "}
                    per le tue esigenze
                  </span>
                </h1>

                <p className="max-w-xl text-lg leading-8 text-text-secondary">
                  Descrivi il lavoro che devi svolgere e ricevi
                  proposte da professionisti qualificati.
                </p>
              </div>

              <div className="relative z-20 max-w-xl md:max-w-2xl">
                <FunnelEntry />
              </div>
            </div>

            <HeroIllustration />
          </div>
        </div>
      </Container>
    </section>
  )
}

function HeroIllustration() {
  if (heroIllustrationSrc) {
    return (
      <div className="relative min-h-80">
        <img
          src={heroIllustrationSrc}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex min-h-80 items-center justify-center bg-surface-elevated text-center text-sm text-text-muted",
        tokens.radius["3xl"],
      )}
    >
      Inserisci qui:
      <br />
      /illustrations/donna_con_laptop.svg
    </div>
  )
}



