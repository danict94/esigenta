import { prisma } from "../client"

/**
 * Shared by @esigenta/auth and @esigenta/domain (which depends on
 * @esigenta/auth) for admin notification emails. Lives here, not in
 * @esigenta/domain, for the same reason as setCompanyLocationWithClient
 * above: @esigenta/auth cannot depend on @esigenta/domain without creating a
 * cycle. AdminProfile is the only source of truth for "who is admin" — no
 * separate ADMIN_EMAIL configuration.
 */
export async function getAdminNotificationRecipientEmails(): Promise<string[]> {
  const admins = await prisma.adminProfile.findMany({
    select: {
      user: {
        select: {
          email: true,
        },
      },
    },
  })

  const emails = new Set<string>()

  for (const admin of admins) {
    const email = admin.user?.email?.trim()

    if (email) {
      emails.add(email)
    }
  }

  if (emails.size === 0) {
    console.warn("[admin-notifications] No admin recipients configured")
  }

  return Array.from(emails)
}
