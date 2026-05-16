import type { ReactNode } from "react";
import { redirect } from "next/navigation";

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
    await requireAdmin();
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
  await requireProtectedAdminAccess();

  return <AdminShell>{children}</AdminShell>;
}