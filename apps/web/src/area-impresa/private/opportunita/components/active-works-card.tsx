import Link from "next/link"
import React from "react"

import { Card, buttonClassName } from "@esigenta/ui"

export const ACTIVE_WORKS_HREF = "/area-impresa/configura-servizi"
export const ACTIVE_WORKS_CTA_LABEL = "Gestisci lavori"

export function formatActiveWorksCount(count: number): string {
  if (count === 0) return "Nessun lavoro attivo"
  if (count === 1) return "1 lavoro attivo"
  return `${count} lavori attivi`
}

export function ActiveWorksCard({ count }: { count: number }) {
  return (
    <div className="border-b border-eg-border px-7 py-4">
      <Link
        href={ACTIVE_WORKS_HREF}
        className="group block cursor-pointer rounded-eg-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eg-brand-strong"
        prefetch={false}
      >
        <Card className="p-5 transition-colors group-hover:bg-eg-surface-muted">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-eg-ink">
                Lavori che esegui
              </h2>
              <p className="mt-1 text-sm font-medium text-eg-brand-strong">
                {formatActiveWorksCount(count)}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-eg-text-muted">
                Controlla o modifica i lavori che offri per ricevere richieste
                più pertinenti.
              </p>
            </div>

            <span
              className={buttonClassName({ size: "sm", className: "shrink-0" })}
            >
              {ACTIVE_WORKS_CTA_LABEL}
            </span>
          </div>
        </Card>
      </Link>
    </div>
  )
}
