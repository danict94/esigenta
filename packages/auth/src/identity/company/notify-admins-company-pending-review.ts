import { getAdminNotificationRecipientEmails, prisma } from "@esigenta/database"
import { newCompanyAdminEmail, sendEmail } from "@esigenta/notifications"

function buildCompanyAdminUrl(): string | null {
  const baseUrl = process.env.ESIGENTA_ADMIN_URL?.trim()

  if (!baseUrl) {
    return null
  }

  return `${baseUrl.replace(/\/+$/, "")}/imprese?status=PENDING_REVIEW`
}

/**
 * Best-effort admin notification for a freshly created Company
 * (status PENDING_REVIEW). Always called AFTER createCompanyForUser's
 * transaction has committed — never inside it, so an email failure can
 * never roll back a successful company creation. Swallows all errors
 * itself so callers never need their own try/catch.
 *
 * No per-company detail route exists in apps/admin today, only the
 * filtered list at /imprese?status=PENDING_REVIEW — that is what the link
 * points to.
 */
export async function notifyAdminsOfCompanyPendingReview({
  companyId,
  userId,
}: {
  companyId: string
  userId: string
}): Promise<void> {
  try {
    const [company, user] = await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      }),
    ])

    if (!company) {
      return
    }

    const recipients = await getAdminNotificationRecipientEmails()

    if (recipients.length === 0) {
      return
    }

    const email = newCompanyAdminEmail({
      companyId: company.id,
      companyName: company.name,
      userEmail: user?.email ?? null,
      createdAt: company.createdAt,
      adminUrl: buildCompanyAdminUrl(),
    })

    await sendEmail({ to: recipients, ...email })
  } catch (error) {
    console.error("admin_new_company_email_failed", {
      companyId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
