"use server"

import { redirect } from "next/navigation"

import { sendCustomerRequestsAccessEmail } from "@esigenta/domain"

export async function requestCustomerAccessAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()

  await sendCustomerRequestsAccessEmail({ email })

  redirect("/richieste/accesso?sent=1")
}
