"use server"

import {
  revalidatePath,
} from "next/cache"
import {
  redirect,
} from "next/navigation"

import {
  ensureCompanySupportConversation,
} from "@esigenta/domain"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"
import {
  areaLog,
  isAreaMonitoringEnabled,
  shortId,
} from "../../../../lib/area-monitoring"

export async function openSupportAction() {
  const monitored = isAreaMonitoringEnabled()
  const actionStart = performance.now()

  const actor = await requireAreaImpresaAccess()

  if (monitored) {
    areaLog("area.support.open.start", {
      companyIdSafe: shortId(actor.company.id),
    })
  }

  const result = await ensureCompanySupportConversation(actor)

  if (!result.ok) {
    if (monitored) {
      areaLog("area.support.open.end", {
        result: result.code,
        durationMs: Math.round(performance.now() - actionStart),
      })
    }

    redirect(`/area-impresa/assistenza?error=${encodeURIComponent(result.code)}`)
  }

  if (monitored) {
    areaLog("area.support.open.end", {
      result: result.created ? "created" : "existing",
      durationMs: Math.round(performance.now() - actionStart),
    })
  }

  revalidatePath("/area-impresa/assistenza")
  revalidatePath("/area-impresa", "layout")

  redirect(`/area-impresa/assistenza/${encodeURIComponent(result.conversationId)}`)
}
