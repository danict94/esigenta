import Image from "next/image"

import {
  cn,
  HeroSurface,
  tokens,
} from "@fixpro/ui"

import { FunnelEntry } from "./funnel-entry"

type IllustrationSource =
  | string
  | null

const heroIllustrationSrc: IllustrationSource =
  "/assets/images/donna-con-laptop.webp"

export function Hero() {
  return (
    <HeroSurface className="mb-8 md:mb-10">
      <div className="grid gap-8 md:gap-10 xl:grid-cols-[minmax(0,1fr)_640px] xl:items-center">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 text-center xl:mx-0 xl:pl-20 xl:text-left">
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

            <p className="mx-auto max-w-xl text-base leading-7 text-text-secondary md:text-lg md:leading-8 xl:mx-0">
              Descrivi il lavoro che devi svolgere e ricevi
              proposte da professionisti qualificati.
            </p>
          </div>

          <div className="relative z-20 mx-auto w-full max-w-xl md:max-w-2xl xl:mx-0">
            <FunnelEntry />
          </div>
        </div>

        <HeroIllustration />
      </div>
    </HeroSurface>
  )
}

function HeroIllustration() {
  if (heroIllustrationSrc) {
    return (
      <div className="relative z-10 mx-auto min-h-[260px] w-full max-w-[360px] md:min-h-[340px] md:max-w-[480px] xl:mx-0 xl:min-h-[430px] xl:max-w-[560px] xl:-ml-16 xl:-mb-14">
        <Image
          src={heroIllustrationSrc}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1280px) 640px, 100vw"
          className="object-contain object-bottom"
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
      /assets/images/donna-con-laptop.webp
    </div>
  )
}
