import {
  conversationMessageEmail,
  sendEmail,
} from "@esigenta/notifications"
import {
  prisma,
} from "@esigenta/database"

import {
  buildCompanyConversationUrl,
  buildCustomerConversationUrl,
} from "../request/request-links"
import {
  createCustomerConversationToken,
} from "../../customer/conversations/conversation-token"
import type {
  ConversationActor,
  ConversationMessageSideEffects,
} from "./types"

const PREVIEW_MAX_LENGTH = 240

type ProcessConversationMessageSideEffectsInput = {
  messageId: string
  sender: ConversationActor
}

type LoadedMessageContext =
  NonNullable<
    Awaited<
      ReturnType<
        typeof loadMessageContext
      >
    >
  >

const emptySideEffects: ConversationMessageSideEffects = {
  companyNotificationCreated: false,
  companyEmailSentCount: 0,
  customerEmailSent: false,
  emailFailedCount: 0,
}

function formatRequestTitle(
  conversation: LoadedMessageContext["conversation"],
) {
  const { request } = conversation

  if (request?.interventionSlug) {
    return request.interventionSlug
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase(),
      )
  }

  return request?.requestCode
    ? `Richiesta ${request.requestCode}`
    : conversation.type === "SUPPORT"
      ? "supporto Esigenta"
    : "richiesta"
}

function createMessagePreview(
  body: string,
) {
  const normalized =
    body.replace(/\s+/g, " ").trim()

  if (
    normalized.length <=
    PREVIEW_MAX_LENGTH
  ) {
    return normalized
  }

  return `${normalized.slice(
    0,
    PREVIEW_MAX_LENGTH - 1,
  )}...`
}

function createSenderLabel(
  message: LoadedMessageContext,
) {
  const sender =
    message.senderParticipant

  if (sender.actorType === "COMPANY") {
    return sender.company?.name ?? "Impresa"
  }

  if (sender.actorType === "CUSTOMER") {
    return sender.customer?.name ?? "Cliente"
  }

  if (sender.actorType === "ADMIN") {
    return sender.user?.name ?? "Team Esigenta"
  }

  return sender.user?.name ?? "Operatore"
}

function uniqueRecipients(
  recipients: Array<{
    email: string
    name: string | null
  }>,
) {
  const seen =
    new Set<string>()

  return recipients.filter((recipient) => {
    const normalizedEmail =
      recipient.email.trim().toLowerCase()

    if (!normalizedEmail) {
      return false
    }

    if (seen.has(normalizedEmail)) {
      return false
    }

    seen.add(normalizedEmail)

    return true
  })
}

async function loadMessageContext(
  messageId: string,
) {
  return prisma.message.findUnique({
    where: {
      id: messageId,
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      conversationId: true,
      senderParticipantId: true,
      senderParticipant: {
        select: {
          id: true,
          actorType: true,
          company: {
            select: {
              name: true,
            },
          },
          customer: {
            select: {
              email: true,
              name: true,
            },
          },
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
      conversation: {
        select: {
          id: true,
          type: true,
          requestId: true,
          request: {
            select: {
              requestCode: true,
              interventionSlug: true,
              geoLocation: {
                select: { city: true },
              },
            },
          },
          participants: {
            select: {
              id: true,
              actorType: true,
              userId: true,
              user: {
                select: {
                  email: true,
                  name: true,
                },
              },
              companyId: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  memberships: {
                    where: {
                      user: {
                        isActive: true,
                        deletedAt: null,
                      },
                    },
                    select: {
                      user: {
                        select: {
                          email: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
              customerId: true,
              customer: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

async function sendConversationEmail({
  to,
  recipientLabel,
  accessUrl,
  senderLabel,
  requestTitle,
  messagePreview,
}: {
  to: string
  recipientLabel?: string | null
  accessUrl: string
  senderLabel: string
  requestTitle: string
  messagePreview: string
}) {
  const email =
    conversationMessageEmail({
      accessUrl,
      recipientLabel,
      senderLabel,
      requestTitle,
      messagePreview,
    })

  await sendEmail({
    to,
    ...email,
  })
}

// ── Eligibility (decided exactly once; channels below only deliver) ────────────
//
// THE recipient resolution for a CONVERSATION_MESSAGE notification — see
// docs/domain-invariants/04_NOTIFICATION_ARCHITECTURE.md. Previously the
// in-app and email branches each independently re-derived the company
// participant via their own `.find()` over message.conversation.participants
// — same data, same logic, computed twice. A third channel (WhatsApp/SMS/
// Push) would have been a third independent derivation. Now there is one.
type CompanyMessageRecipients = {
  companyId: string
  users: Array<{ email: string; name: string | null }>
}

function resolveCompanyMessageRecipients(
  message: LoadedMessageContext,
): CompanyMessageRecipients | null {
  const companyParticipant =
    message.conversation.participants.find(
      (participant) =>
        participant.actorType === "COMPANY" &&
        participant.companyId,
    )

  if (!companyParticipant?.companyId) {
    return null
  }

  return {
    companyId: companyParticipant.companyId,
    users: uniqueRecipients(
      companyParticipant.company?.memberships.map(
        (companyMember) => companyMember.user,
      ) ?? [],
    ),
  }
}

// ── Delivery: app channel ───────────────────────────────────────────────────

async function createCompanyMessageNotification({
  message,
  recipients,
  requestTitle,
  senderLabel,
}: {
  message: LoadedMessageContext
  recipients: CompanyMessageRecipients
  requestTitle: string
  senderLabel: string
}) {
  const existingNotification =
    await prisma.companyNotification.findFirst({
      where: {
        companyId: recipients.companyId,
        messageId: message.id,
        type: "CONVERSATION_MESSAGE",
      },
      select: {
        id: true,
      },
    })

  if (existingNotification) {
    return false
  }

  const result =
    await prisma.companyNotification.createMany({
      data: [
        {
          companyId: recipients.companyId,
          requestId:
            message.conversation.requestId,
          conversationId:
            message.conversationId,
          messageId: message.id,
          type: "CONVERSATION_MESSAGE",
          title: "Nuovo messaggio",
          body:
            `${senderLabel} ha scritto per ${requestTitle}.`,
        },
      ],
      skipDuplicates: true,
    })

  return result.count > 0
}

// ── Delivery: email channel ─────────────────────────────────────────────────

async function notifyCompanyRecipients({
  message,
  recipients,
  senderLabel,
  requestTitle,
  messagePreview,
}: {
  message: LoadedMessageContext
  recipients: CompanyMessageRecipients
  senderLabel: string
  requestTitle: string
  messagePreview: string
}) {
  const accessUrl =
    buildCompanyConversationUrl({
      conversationId:
        message.conversationId,
      conversationType:
        message.conversation.type,
    })

  const results =
    await Promise.allSettled(
      recipients.users.map((recipient) =>
        sendConversationEmail({
          to: recipient.email,
          recipientLabel:
            recipient.name,
          accessUrl,
          senderLabel,
          requestTitle,
          messagePreview,
        }),
      ),
    )

  return {
    sentCount: results.filter(
      (result) =>
        result.status === "fulfilled",
    ).length,
    failedCount: results.filter(
      (result) =>
        result.status === "rejected",
    ).length,
  }
}

async function notifyCustomerRecipient({
  message,
  sender,
  senderLabel,
  requestTitle,
  messagePreview,
}: {
  message: LoadedMessageContext
  sender: ConversationActor
  senderLabel: string
  requestTitle: string
  messagePreview: string
}) {
  if (sender.actorType !== "COMPANY") {
    return {
      sent: false,
      failedCount: 0,
    }
  }

  const customerParticipant =
    message.conversation.participants.find(
      (participant) =>
        participant.actorType ===
          "CUSTOMER" &&
        participant.customer,
    )
  const customer =
    customerParticipant?.customer

  if (!customer?.email) {
    return {
      sent: false,
      failedCount: 0,
    }
  }

  const tokenResult =
    await createCustomerConversationToken({
      conversationId:
        message.conversationId,
      requestedBy: sender,
    })

  if (!tokenResult.ok) {
    return {
      sent: false,
      failedCount: 1,
    }
  }

  try {
    await sendConversationEmail({
      to: customer.email,
      recipientLabel:
        customer.name,
      accessUrl:
        buildCustomerConversationUrl({
          token: tokenResult.token,
        }),
      senderLabel,
      requestTitle,
      messagePreview,
    })

    return {
      sent: true,
      failedCount: 0,
    }
  } catch {
    return {
      sent: false,
      failedCount: 1,
    }
  }
}

export async function processConversationMessageSideEffects({
  messageId,
  sender,
}: ProcessConversationMessageSideEffectsInput): Promise<ConversationMessageSideEffects> {
  const message =
    await loadMessageContext(messageId)

  if (!message) {
    return emptySideEffects
  }

  const senderLabel =
    createSenderLabel(message)
  const requestTitle =
    formatRequestTitle(
      message.conversation,
    )
  const messagePreview =
    createMessagePreview(message.body)

  if (
    message.senderParticipant.actorType !==
    "COMPANY"
  ) {
    // Eligibility decided exactly once; both channels below deliver to the
    // same resolved recipient set — see resolveCompanyMessageRecipients.
    const recipients =
      resolveCompanyMessageRecipients(message)

    if (!recipients) {
      return emptySideEffects
    }

    const [
      companyNotificationCreated,
      companyEmail,
    ] = await Promise.all([
      createCompanyMessageNotification({
        message,
        recipients,
        requestTitle,
        senderLabel,
      }),
      notifyCompanyRecipients({
        message,
        recipients,
        senderLabel,
        requestTitle,
        messagePreview,
      }),
    ])

    return {
      companyNotificationCreated,
      companyEmailSentCount:
        companyEmail.sentCount,
      customerEmailSent: false,
      emailFailedCount:
        companyEmail.failedCount,
    }
  }

  const customerEmail =
    message.conversation.type ===
    "COMPANY_CUSTOMER"
      ? await notifyCustomerRecipient({
          message,
          sender,
          senderLabel,
          requestTitle,
          messagePreview,
        })
      : {
          sent: false,
          failedCount: 0,
        }

  return {
    companyNotificationCreated: false,
    companyEmailSentCount: 0,
    customerEmailSent:
      customerEmail.sent,
    emailFailedCount:
      customerEmail.failedCount,
  }
}
