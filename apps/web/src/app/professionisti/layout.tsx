import type { ReactNode } from "react"

import { Ga4MinimalLoader } from "../../site/shell/ga4-minimal-loader"

export default function ProfessionistiLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      {children}
      <Ga4MinimalLoader />
    </>
  )
}
