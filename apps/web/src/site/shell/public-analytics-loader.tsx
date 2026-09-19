import { Suspense } from "react"

import { Ga4MinimalLoader } from "./ga4-minimal-loader"
import { MetaPixelLoader } from "./meta-pixel-loader"

/** Unico punto di montaggio dei provider analytics per le superfici pubbliche. */
export function PublicAnalyticsLoader() {
  return (
    <>
      <Ga4MinimalLoader />
      <Suspense fallback={null}>
        <MetaPixelLoader />
      </Suspense>
    </>
  )
}
