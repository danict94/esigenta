import { getAdminNotificationRecipientEmails, prisma } from "@esigenta/database"
import { newRequestAdminEmail, sendEmail } from "@esigenta/notifications"

function buildRequestAdminUrl(requestId: string): string | null {
  const baseUrl = process.env.ESIGENTA_ADMIN_URL?.trim()

  if (!baseUrl) {
    return null
  }

  return `${baseUrl.replace(/\/+$/, "")}/requests/${requestId}`
}

/**
 * Best-effort admin notification for the PENDING_VERIFICATION ->
 * PENDING_REVIEW transition. Always called AFTER the transaction that made
 * the transition has committed (verify-request.ts) — never inside it, so an
 * email failure can never roll back a successful verification. Swallows all
 * errors itself so callers never need their own try/catch.
 */
export async function notifyAdminsOfRequestPendingReview(
  requestId: string,
): Promise<void> {
  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        requestCode: true,
        interventionSlug: true,
        verifiedAt: true,
        geoLocation: {
          select: { city: true },
        },
      },
    })

    if (!request) {
      return
    }

    const recipients = await getAdminNotificationRecipientEmails()

    if (recipients.length === 0) {
      return
    }

    const email = newRequestAdminEmail({
      requestId: request.id,
      requestCode: request.requestCode,
      interventionSlug: request.interventionSlug,
      city: request.geoLocation?.city ?? null,
      verifiedAt: request.verifiedAt,
      adminUrl: buildRequestAdminUrl(request.id),
    })

    await sendEmail({ to: recipients, ...email })
  } catch (error) {
    console.error("admin_new_request_email_failed", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
