"use client"

import { useFormStatus } from "react-dom"

import {
  Button,
  Textarea,
} from "@esigenta/ui"

type SendMessageFormProps = {
  action: (
    formData: FormData,
  ) => Promise<void>
  submitLabel?: string
}

function SendMessageSubmitButton({
  submitLabel,
}: {
  submitLabel: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Invio in corso..." : submitLabel}
    </Button>
  )
}

export function SendMessageForm({
  action,
  submitLabel = "Invia messaggio",
}: SendMessageFormProps) {
  return (
    <form
      action={action}
      className="space-y-3"
    >
      <div className="space-y-2">
        <label
          htmlFor="message-body"
          className="text-sm font-medium text-cantiere-ink"
        >
          Messaggio
        </label>

        <Textarea
          id="message-body"
          name="body"
          required
          minLength={1}
          maxLength={5000}
          placeholder="Scrivi una risposta..."
        />
      </div>

      <SendMessageSubmitButton submitLabel={submitLabel} />
    </form>
  )
}
