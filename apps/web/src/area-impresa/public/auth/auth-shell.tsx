import type { ReactNode } from "react"

import { PublicShell } from "../../../site/shell/public-shell"
import { Grain } from "../../../site/home/grain"
import {
  CreditGlyph,
  SupportGlyph,
  UnlockGlyph,
  VerifiedGlyph,
} from "../marketing/marketing-glyphs"

// Shared Cantiere layout for the Area Impresa auth flow — sibling of the
// professionals page and /area-impresa/iscriviti. Light editorial split: a
// calm fiduciary rail on the left, a clean form panel on the right. No
// generic centered auth card, no SaaS chrome.

const introPoints = [
  { glyph: VerifiedGlyph, label: "Richieste verificate" },
  { glyph: UnlockGlyph, label: "Contatti sbloccati" },
  { glyph: SupportGlyph, label: "Assistenza dedicata" },
  { glyph: CreditGlyph, label: "Crediti senza abbonamento" },
] as const

function AuthIntroRail() {
  return (
    <aside className="lg:pt-2">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-cantiere-accent">
        Area Impresa
      </p>

      <p className="mt-4 max-w-[18ch] font-medium tracking-[-0.01em] text-cantiere-ink text-[clamp(1.5rem,1.1rem+1.6vw,2.125rem)]">
        Accedi per gestire richieste, contatti e conversazioni.
      </p>

      <ul className="mt-8 flex flex-col gap-4">
        {introPoints.map(({ glyph: Glyph, label }) => (
          <li key={label} className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-cantiere-accent-tint text-cantiere-accent">
              <Glyph className="size-[18px]" />
            </span>

            <span className="text-[15px] text-cantiere-ink">{label}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export type AuthShellProps = {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <PublicShell>
      <Grain />

      <section
        className="relative bg-cantiere-linen"
        style={{
          backgroundImage:
            "linear-gradient(180deg, var(--color-cantiere-paper) 0%, var(--color-cantiere-linen) 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1120px] px-5 pb-20 pt-28 sm:px-10 sm:pt-32 md:px-12 md:pb-24 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:items-center xl:gap-16">
            <AuthIntroRail />

            <div className="w-full rounded-[8px] border border-cantiere-hairline bg-cantiere-paper p-6 shadow-cantiere-slab md:p-8">
              {children}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
