"use server"

import {
  revalidatePath,
  revalidateTag,
} from "next/cache"
import {
  redirect,
} from "next/navigation"

import {
  processConversationMessageSideEffects,
  sendCompanyConversationMessage,
} from "@esigenta/domain"

import {
  requireAreaImpresaAccess,
} from "../../../../auth/server"
import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
  shortId,
} from "../../../../platform/monitoring/area-monitoring"
import {
  traceSideEffect,
} from "../../../monitoring/area-impresa-monitoring.server"
import {
  shellCountsTag,
} from "../../shell/shell-counts-cache"

import {
  buildThreadHref,
} from "../view-models/conversation-view-model"

export async function sendMessageAction(
  conversationId: string,
  hrefBase: string,
  listPath: string,
  formData: FormData,
) {
  const monitored = isAreaMonitoringEnabled()
  const sendStart = areaTimestamp()

  if (monitored) {
    areaLog("area.message.send.start", {
      conversationIdSafe: shortId(conversationId),
    })
  }

  const actorStart = areaTimestamp()
  const currentActor = await requireAreaImpresaAccess()
  const actorMs = Math.round(areaTimestamp() - actorStart)

  const body = String(formData.get("body") ?? "")

  const cmdStart = areaTimestamp()
  const sendResult = await sendCompanyConversationMessage(
    currentActor,
    conversationId,
    body,
  )
  const cmdMs = Math.round(areaTimestamp() - cmdStart)

  if (!sendResult.ok) {
    if (monitored) {
      areaLog("area.message.send.end", {
        conversationIdSafe: shortId(conversationId),
        result: sendResult.code,
        durationMs: Math.round(areaTimestamp() - sendStart),
        actorMs,
        sendCommandMs: cmdMs,
      })
    }
    redirect(
      buildThreadHref({
        hrefBase,
        conversationId,
        params: {
          error: sendResult.code,
        },
      }),
    )
  }

  if (monitored) {
    areaLog("area.message.send.end", {
      conversationIdSafe: shortId(conversationId),
      result: "ok",
      durationMs: Math.round(areaTimestamp() - sendStart),
      actorMs,
      sendCommandMs: cmdMs,
    })
  }

  traceSideEffect("processConversationMessageSideEffects", () =>
    processConversationMessageSideEffects({
      messageId: sendResult.messageId,
      sender: {
        actorType: "COMPANY",
        companyId: currentActor.company.id,
        userId: currentActor.user.id,
      },
    }),
  )

  revalidatePath(listPath)
  revalidateTag(shellCountsTag(currentActor.company.id), { expire: 0 })

  redirect(
    buildThreadHref({
      hrefBase,
      conversationId,
      params: {
        sent: "1",
      },
    }),
  )
}
