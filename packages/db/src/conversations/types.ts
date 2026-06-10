import type {
  ConversationActorType,
  ConversationType,
  Prisma,
  RequestStatus,
} from "@prisma/client"

import type {
  CompanyActor,
} from "../identity/company/actor"

export type CompanyConversationActor = {
  actorType: "COMPANY"
  companyId: string
  userId: string
}

export type CustomerConversationActor = {
  actorType: "CUSTOMER"
  token: string
}

export type UserConversationActor = {
  actorType: "USER"
  userId: string
}

export type AdminConversationActor = {
  actorType: "ADMIN"
  userId: string
}

export type ConversationActor =
  | CompanyConversationActor
  | CustomerConversationActor
  | UserConversationActor
  | AdminConversationActor

export type CreateCompanyCustomerConversationInput = {
  companyId: string
  requestId: string
  userId: string
  recordPerf?: (
    operation: string,
    durationMs: number,
  ) => void
}

export type CreateCompanyCustomerConversationResult =
  | {
      ok: true
      conversationId: string
      requestId: string
      requestUnlockId: string
      companyParticipantId: string
      customerParticipantId: string
      created: boolean
    }
  | {
      ok: false
      code:
        | "invalid_company_id"
        | "invalid_request_id"
        | "invalid_user_id"
        | "unauthorized"
        | "request_unlock_not_found"
        | "request_unlock_not_valid"
        | "customer_not_found"
      message: string
    }

export type CreateSupportConversationInput = {
  companyId: string
  userId: string
  adminUserId?: string | null
}

export type CreateSupportConversationResult =
  | {
      ok: true
      conversationId: string
      companyId: string
      adminUserId: string
      companyParticipantId: string
      adminParticipantId: string
      created: boolean
    }
  | {
      ok: false
      code:
        | "admin_not_found"
        | "invalid_admin_user_id"
        | "invalid_company_id"
        | "invalid_user_id"
        | "unauthorized"
      message: string
    }

export type EnsureCompanyCustomerConversationForUnlockInput = {
  tx: Prisma.TransactionClient
  requestUnlockId: string
  now?: Date
}

export type EnsureCompanyCustomerConversationForUnlockResult =
  | {
      ok: true
      conversationId: string
      requestId: string
      requestUnlockId: string
      companyId: string
      customerId: string
      customerConversationAccessToken: string
      customerConversationAccessTokenId: string
      customerConversationAccessTokenExpiresAt: Date
      created: boolean
    }
  | {
      ok: false
      code:
        | "request_unlock_not_found"
        | "request_unlock_not_valid"
        | "customer_not_found"
      message: string
    }

export type CreateCustomerConversationTokenInput = {
  conversationId: string
  requestedBy:
    | CompanyConversationActor
    | AdminConversationActor
  expiresAt?: Date
  now?: Date
}

export type CreateCustomerConversationTokenResult =
  | {
      ok: true
      token: string
      tokenId: string
      conversationId: string
      requestId: string
      customerId: string
      expiresAt: Date
    }
  | {
      ok: false
      code:
        | "conversation_not_found"
        | "customer_not_found"
        | "invalid_conversation"
        | "invalid_expiration"
        | "invalid_requester"
        | "request_unlock_not_valid"
        | "unauthorized"
      message: string
    }

export type ResolveCustomerConversationAccessInput = {
  conversationId: string
  token: string
  now?: Date
}

export type ResolveCustomerConversationAccessResult =
  | {
      ok: true
      tokenId: string
      conversationId: string
      requestId: string
      customerId: string
      customerParticipantId: string
      email: string
      expiresAt: Date
    }
  | {
      ok: false
      code:
        | "conversation_not_found"
        | "invalid_conversation"
        | "invalid_token"
        | "request_unlock_not_valid"
        | "token_expired"
        | "token_revoked"
        | "unauthorized"
      message: string
    }

export type SendConversationMessageInput = {
  conversationId: string
  sender: ConversationActor
  body: string
  now?: Date
}

export type ConversationMessageSideEffects = {
  companyNotificationCreated: boolean
  companyEmailSentCount: number
  customerEmailSent: boolean
  emailFailedCount: number
}

export type SendConversationMessageResult =
  | {
      ok: true
      messageId: string
      conversationId: string
      sideEffects: ConversationMessageSideEffects
    }
  | {
      ok: false
      code:
        | "conversation_not_found"
        | "empty_message"
        | "invalid_sender"
        | "invalid_token"
        | "request_unlock_not_valid"
        | "token_expired"
        | "token_revoked"
        | "unauthorized"
      message: string
    }

export type ListCompanyConversationsInput = {
  companyId: string
  userId: string
  limit?: number
}

export type CompanyConversationListItem = {
  id: string
  type: ConversationType
  requestId: string | null
  requestUnlockId: string | null
  createdAt: Date
  updatedAt: Date
  request: {
    id: string
    requestCode: string | null
    status: RequestStatus
    interventionSlug: string | null
    city: string | null
    createdAt: Date
  } | null
  customer: {
    id: string
    email: string
    name: string | null
    phone: string | null
  } | null
  lastMessage: {
    id: string
    body: string
    createdAt: Date
    senderActorType: ConversationActorType
  } | null
  hasUnread: boolean
}

export type AdminSupportConversationListItem = {
  id: string
  type: "SUPPORT"
  createdAt: Date
  updatedAt: Date
  isResolved: boolean
  resolvedAt: Date | null
  company: {
    id: string
    name: string
  } | null
  lastMessage: {
    id: string
    body: string
    createdAt: Date
    senderActorType: ConversationActorType
  } | null
  hasUnread: boolean
}

export type ListAdminSupportConversationsInput = {
  userId: string
  limit?: number
  includeResolved?: boolean
}

export type ListAdminSupportConversationsResult =
  | {
      ok: true
      conversations: AdminSupportConversationListItem[]
    }
  | {
      ok: false
      code:
        | "invalid_user_id"
        | "unauthorized"
      message: string
    }

export type ListCompanyConversationsResult =
  | {
      ok: true
      conversations: CompanyConversationListItem[]
    }
  | {
      ok: false
      code:
        | "invalid_company_id"
        | "invalid_user_id"
        | "unauthorized"
      message: string
    }

export type ConversationThreadMessage = {
  id: string
  body: string
  createdAt: Date
  senderActorType: ConversationActorType
  senderLabel: string
}

export type ConversationThread = {
  id: string
  type: ConversationType
  requestId: string | null
  requestUnlockId: string | null
  createdAt: Date
  updatedAt: Date
  isResolved: boolean
  resolvedAt: Date | null
  resolvedBy: {
    id: string
    name: string | null
    email: string
  } | null
  request: {
    id: string
    requestCode: string | null
    status: RequestStatus
    interventionSlug: string | null
    city: string | null
    createdAt: Date
  } | null
  company: {
    id: string
    name: string
  } | null
  customer: {
    id: string
    email: string
    name: string | null
    phone: string | null
  } | null
  messages: ConversationThreadMessage[]
}

export type GetCompanyConversationThreadInput = {
  companyId: string
  userId: string
  conversationId: string
}

export type GetCompanyConversationThreadResult =
  | {
      ok: true
      thread: ConversationThread
    }
  | {
      ok: false
      code:
        | "conversation_not_found"
        | "invalid_company_id"
        | "invalid_user_id"
        | "request_unlock_not_valid"
        | "unauthorized"
      message: string
    }

export type GetAdminConversationThreadInput = {
  userId: string
  conversationId: string
}

export type GetAdminConversationThreadResult =
  | {
      ok: true
      thread: ConversationThread
    }
  | {
      ok: false
      code:
        | "conversation_not_found"
        | "invalid_user_id"
        | "unauthorized"
      message: string
    }

export type ResolveCustomerConversationAccessByTokenInput = {
  token: string
  now?: Date
}

export type ResolveCustomerConversationAccessByTokenResult =
  ResolveCustomerConversationAccessResult

export type GetCustomerConversationThreadByTokenInput = {
  token: string
  now?: Date
}

export type GetCustomerConversationThreadByTokenResult =
  | {
      ok: true
      thread: ConversationThread
      access: Extract<
        ResolveCustomerConversationAccessResult,
        { ok: true }
      >
    }
  | Extract<
      ResolveCustomerConversationAccessResult,
      { ok: false }
    >

export type MarkConversationReadInput = {
  conversationId: string
  reader: ConversationActor
  authorizedActor?: CompanyActor
  now?: Date
}

export type MarkConversationReadResult =
  | {
      ok: true
      conversationId: string
      participantId: string
      readAt: Date
    }
  | {
      ok: false
      code:
        | "conversation_not_found"
        | "invalid_reader"
        | "invalid_token"
        | "request_unlock_not_valid"
        | "token_expired"
        | "token_revoked"
        | "unauthorized"
      message: string
    }

export type CountUnreadCompanyConversationsInput = {
  companyId: string
  userId: string
  authorizedActor?: CompanyActor
}

export type CountUnreadCompanyConversationsResult =
  | {
      ok: true
      count: number
    }
  | {
      ok: false
      code:
        | "invalid_company_id"
        | "invalid_user_id"
        | "unauthorized"
      message: string
    }

export type CountUnreadCompanyConversationSummaryInput = {
  companyId: string
  userId: string
  authorizedActor?: CompanyActor
}

export type CountUnreadCompanyConversationSummaryResult =
  | {
      ok: true
      contactsCount: number
      supportCount: number
      totalCount: number
    }
  | {
      ok: false
      code:
        | "invalid_company_id"
        | "invalid_user_id"
        | "unauthorized"
      message: string
    }

export type CountUnreadAdminConversationsInput = {
  userId: string
}

export type CountUnreadAdminConversationsResult =
  | {
      ok: true
      count: number
    }
  | {
      ok: false
      code:
        | "invalid_user_id"
        | "unauthorized"
      message: string
    }

export type ResolveSupportConversationInput = {
  conversationId: string
  userId: string
  now?: Date
}

export type ResolveSupportConversationResult =
  | {
      ok: true
      conversationId: string
      resolvedAt: Date
      resolvedById: string
    }
  | {
      ok: false
      code:
        | "conversation_not_found"
        | "invalid_conversation"
        | "invalid_user_id"
        | "unauthorized"
      message: string
    }
