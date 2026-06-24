import type { ReactNode } from "react"

import { PublicShell } from "../../../site/shell/public-shell"
import { Grain } from "../../../site/home/grain"

// Shared Cantiere layout for the Area Impresa auth flow — a single clean,
// centered form panel on the warm linen ground. No marketing rail, no repeated
// value props: just the form, done in the same system as the rest of the area.

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
        <div className="mx-auto w-full max-w-[480px] px-5 pb-20 pt-28 sm:px-8 sm:pt-32 md:pb-24">
          <div className="w-full rounded-[8px] border border-cantiere-hairline bg-cantiere-paper p-6 shadow-cantiere-slab md:p-8">
            {children}
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
