"use server"

import {
  redirect,
} from "next/navigation"

import {
  requestPasswordReset,
} from "@esigenta/auth"

export async function requestCompanyPasswordResetAction(
  formData: FormData,
) {
  const email =
    String(
      formData.get("email") ?? "",
    )

  const result =
    await requestPasswordReset({
      audience:
        "company",
      email,
    })

  if (!result.ok) {
    redirect(
      `/area-impresa/recupera-password?error=${result.code}`,
    )
  }

  redirect(
    "/area-impresa/recupera-password?sent=1",
  )
}
