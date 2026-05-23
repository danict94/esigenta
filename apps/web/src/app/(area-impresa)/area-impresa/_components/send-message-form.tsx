import {
  Button,
  Textarea,
} from "@fixpro/ui"

type SendMessageFormProps = {
  action: (
    formData: FormData,
  ) => Promise<void>
  submitLabel?: string
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
          className="text-sm font-medium text-text-primary"
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

      <Button type="submit">
        {submitLabel}
      </Button>
    </form>
  )
}
