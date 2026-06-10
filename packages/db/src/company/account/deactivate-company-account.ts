import { prisma } from "../../prisma/client";

import type {
  DeactivateCompanyAccountInput,
  DeactivateCompanyAccountResult,
} from "./types";

export async function deactivateCompanyAccount(
  input: DeactivateCompanyAccountInput,
): Promise<DeactivateCompanyAccountResult> {
  const companyId = input.companyId.trim();

  const userId = input.userId.trim();

  if (!companyId) {
    return {
      ok: false,
      code: "invalid_company",
      message: "Company non valida.",
    };
  }

  if (!userId) {
    return {
      ok: false,
      code: "invalid_user",
      message: "Utente non valido.",
    };
  }

  const membership = await prisma.companyMembership.findUnique({
    where: {
      companyId_userId: {
        companyId,
        userId,
      },
    },
  });

  if (!membership) {
    return {
      ok: false,
      code: "membership_not_found",
      message: "Membership non trovata.",
    };
  }

  if (membership.role !== "OWNER") {
    return {
      ok: false,
      code: "not_owner",
      message: "Solo il proprietario può eliminare l’account.",
    };
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.company.update({
      where: {
        id: companyId,
      },
      data: {
        isActive: false,
        deletedAt: now,
      },
    }),

    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: false,
        deletedAt: now,
      },
    }),

    prisma.session.deleteMany({
      where: {
        userId,
      },
    }),
  ]);

  return {
    ok: true,
  };
}
