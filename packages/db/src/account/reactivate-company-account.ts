import {
  prisma,
} from "../prisma/client"

export async function reactivateCompanyAccount(
  userId: string,
) {
  const membership =
    await prisma.companyMembership.findFirst({
      where: {
        userId,
      },
      select: {
        companyId: true,
      },
    })

  if (!membership) {
    return {
      ok: false,
      code: "membership_not_found",
    } as const
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: true,
        deletedAt: null,
      },
    }),

    prisma.company.update({
      where: {
        id: membership.companyId,
      },
      data: {
        isActive: true,
        deletedAt: null,
      },
    }),
  ])

  return {
    ok: true,
  } as const
}
