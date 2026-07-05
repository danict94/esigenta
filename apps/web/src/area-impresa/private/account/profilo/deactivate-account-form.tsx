"use client"

import {
  useMemo,
  useState,
} from "react"

import {
  Button,
  Input,
} from "@esigenta/ui"

type DeactivateAccountFormProps = {
  action: (
    formData: FormData,
  ) => Promise<void>
}

export function DeactivateAccountForm({
  action,
}: DeactivateAccountFormProps) {
  const [confirmation, setConfirmation] =
    useState("")

  const isConfirmed =
    useMemo(
      () =>
        confirmation
          .trim()
          .toUpperCase() ===
        "ELIMINA",
      [confirmation],
    )

  return (
    <form
      action={action}
      className="mt-6 grid gap-5"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-eg-terra">
          Scrivi ELIMINA per confermare
        </label>

        <Input
          value={confirmation}
          onChange={(event) =>
            setConfirmation(
              event.target.value,
            )
          }
          placeholder="ELIMINA"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isConfirmed}
        >
          Elimina account
        </Button>
      </div>
    </form>
  )
}
