import type {
  CompanyActor,
} from "@esigenta/auth"

import {
  countUnreadCompanyConversationSummary,
} from "../../internal/conversation"

import {
  countUnreadCompanyNotifications,
} from "../notifications"

export type AreaImpresaShellCounts = {
  unreadNotificationCount: number
  unreadContactCount: number
  unreadSupportCount: number
}

export async function getAreaImpresaShellCounts(
  actor: CompanyActor,
): Promise<AreaImpresaShellCounts> {
  const [unreadNotificationCount, unreadMessageSummary] =
    await Promise.all([
      countUnreadCompanyNotifications(actor.company.id),
      countUnreadCompanyConversationSummary({
        companyId: actor.company.id,
        userId: actor.user.id,
        authorizedActor: actor,
      }),
    ])

  return {
    unreadNotificationCount,
    unreadContactCount: unreadMessageSummary.ok
      ? unreadMessageSummary.contactsCount
      : 0,
    unreadSupportCount: unreadMessageSummary.ok
      ? unreadMessageSummary.supportCount
      : 0,
  }
}
