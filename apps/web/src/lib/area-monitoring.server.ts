import "server-only"

import { after } from "next/server"

import {
  areaLog,
  areaTimestamp,
  isAreaImpresaDebugEnabled,
} from "./area-monitoring"

export function traceSideEffect(
  name: string,
  fn: () => Promise<unknown>,
): void {
  if (isAreaImpresaDebugEnabled()) {
    areaLog("area.sideEffect.scheduled", { name })
  }
  after(async () => {
    const start = areaTimestamp()
    try {
      await fn()
      if (isAreaImpresaDebugEnabled()) {
        areaLog("area.sideEffect.executed", {
          name,
          durationMs: Math.round(areaTimestamp() - start),
        })
      }
    } catch (error) {
      if (isAreaImpresaDebugEnabled()) {
        areaLog("area.sideEffect.failed", {
          name,
          durationMs: Math.round(areaTimestamp() - start),
          errorType: error instanceof Error ? error.name : "unknown",
        })
      }
    }
  })
}
