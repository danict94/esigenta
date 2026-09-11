import assert from "node:assert/strict"
import test from "node:test"
import Link from "next/link"
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react"

import {
  ACTIVE_WORKS_CTA_LABEL,
  ACTIVE_WORKS_HREF,
  ActiveWorksCard,
  formatActiveWorksCount,
} from "./active-works-card"

function collectLinks(node: ReactNode): ReactElement[] {
  if (!isValidElement(node)) return []

  const links = node.type === Link ? [node] : []
  const children = (node.props as { children?: ReactNode }).children

  return [
    ...links,
    ...Children.toArray(children).flatMap(collectLinks),
  ]
}

test("formats persisted CompanyIntervention totals for 0, 1 and N", () => {
  assert.equal(formatActiveWorksCount(15), "15 lavori attivi")
  assert.equal(formatActiveWorksCount(7), "7 lavori attivi")
  assert.equal(formatActiveWorksCount(1), "1 lavoro attivo")
  assert.equal(formatActiveWorksCount(0), "Nessun lavoro attivo")
})

test("exposes the permanent service-management CTA", () => {
  assert.equal(ACTIVE_WORKS_CTA_LABEL, "Gestisci lavori")
  assert.equal(ACTIVE_WORKS_HREF, "/area-impresa/configura-servizi")
})

test("uses one Link for the whole card without nested links", () => {
  const links = collectLinks(ActiveWorksCard({ count: 7 }))

  assert.equal(links.length, 1)
  assert.equal(
    (links[0]?.props as { href?: string }).href,
    ACTIVE_WORKS_HREF,
  )
})
