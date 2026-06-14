import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import {
  countUnreadAdminConversations,
} from "@esigenta/domain";

import { requireAdmin } from "../../auth/server";
import { AdminShell } from "../../components/admin-shell";

function isNamedError(
  error: unknown,
  name: string,
): boolean {
  return (
    error instanceof Error &&
    error.name === name
  );
}

async function requireProtectedAdminAccess() {
  try {
    return await requireAdmin();
  } catch (error) {
    if (
      isNamedError(
        error,
        "AuthenticationRequiredError",
      )
    ) {
      redirect("/accedi");
    }

    if (
      isNamedError(
        error,
        "AdminAuthorizationError",
      )
    ) {
      redirect("/unauthorized");
    }

    throw error;
  }
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin =
    await requireProtectedAdminAccess();
  const unreadSupportResult =
    await countUnreadAdminConversations({
      userId: admin.userId,
    });
  const unreadSupportCount =
    unreadSupportResult.ok
      ? unreadSupportResult.count
      : 0;

  return (
    <AdminShell unreadSupportCount={unreadSupportCount}>
      {children}
    </AdminShell>
  );
}
