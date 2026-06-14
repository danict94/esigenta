"use server"

import { revalidatePath } from "next/cache"

import {
  markAllCompanyNotificationsRead,
  markCompanyNotificationReadByActor,
} from "@esigenta/domain"

import { requireAreaImpresaAccess } from "../../../../auth/server"
import {
  areaLog,
  isAreaMonitoringEnabled,
  shortId,
} from "../../../../lib/area-monitoring"

export async function markNotificationReadAction(formData: FormData) {
  const monitored = isAreaMonitoringEnabled()
  const actionStart = performance.now()

  const actor = await requireAreaImpresaAccess()
  const notificationId = String(formData.get("notificationId") ?? "").trim()

  if (monitored) {
    areaLog("area.notifications.mark-read.start", {
      companyIdSafe: shortId(actor.company.id),
    })
  }

  const result = await markCompanyNotificationReadByActor(actor, notificationId)

  if (monitored) {
    areaLog("area.notifications.mark-read.end", {
      result: result.ok ? (result.alreadyRead ? "already_read" : "ok") : result.code,
      durationMs: Math.round(performance.now() - actionStart),
    })
  }

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath("/area-impresa/notifiche")
  revalidatePath("/area-impresa", "layout")
}

export async function markAllNotificationsReadAction() {
  const monitored = isAreaMonitoringEnabled()
  const actionStart = performance.now()

  const actor = await requireAreaImpresaAccess()

  if (monitored) {
    areaLog("area.notifications.mark-all-read.start", {
      companyIdSafe: shortId(actor.company.id),
    })
  }

  const result = await markAllCompanyNotificationsRead(actor)

  if (monitored) {
    areaLog("area.notifications.mark-all-read.end", {
      result: result.ok ? "ok" : result.code,
      count: result.ok ? result.count : 0,
      durationMs: Math.round(performance.now() - actionStart),
    })
  }

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath("/area-impresa/notifiche")
  revalidatePath("/area-impresa", "layout")
}
