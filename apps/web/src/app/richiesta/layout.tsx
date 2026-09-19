import type { ReactNode } from "react"

import { PublicAnalyticsLoader } from "../../site/shell/public-analytics-loader"

export default function RichiestaLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      {children}
      <PublicAnalyticsLoader />
    </>
  )
}
