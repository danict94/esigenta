"use server"

import {
  redirect,
} from "next/navigation"

import {
  resetPasswordWithToken,
} from "@esigenta/auth"

function buildResetRetryUrl({
  token,
  error,
}: {
  token: string
  error: string
}) {
  const url =
    new URL(
      "/area-impresa/reimposta-password",
      "http://local",
    )

  url.searchParams.set("token", token)
  url.searchParams.set("error", error)

  return `${url.pathname}${url.search}`
}

export async function resetCompanyPasswordAction(
  formData: FormData,
) {
  const token =
    String(
      formData.get("token") ?? "",
    ).trim()
  const password =
    String(
      formData.get("password") ?? "",
    )
  const confirmPassword =
    String(
      formData.get("confirmPassword") ?? "",
    )

  if (password !== confirmPassword) {
    redirect(
      buildResetRetryUrl({
        token,
        error:
          "password_mismatch",
      }),
    )
  }

  const result =
    await resetPasswordWithToken({
      audience:
        "company",
      token,
      password,
    })

  if (!result.ok) {
    redirect(
      buildResetRetryUrl({
        token,
        error:
          result.code,
      }),
    )
  }

  redirect(
    "/area-impresa/accedi?passwordReset=1",
  )
}
