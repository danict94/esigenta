"use client";

import { useFormStatus } from "react-dom";

type SendMessageFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
};

function SendMessageSubmitButton({ submitLabel }: { submitLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="eg-button-primary w-full disabled:pointer-events-none disabled:opacity-50 sm:w-fit"
    >
      {pending ? "Invio in corso..." : submitLabel}
    </button>
  );
}

export function SendMessageForm({
  action,
  submitLabel = "Invia messaggio",
}: SendMessageFormProps) {
  return (
    <form action={action} className="space-y-4">
      <label htmlFor="message-body" className="eg-form-field">
        <span className="eg-form-label">Messaggio</span>

        <textarea
          id="message-body"
          name="body"
          required
          minLength={1}
          maxLength={5000}
          placeholder="Scrivi una risposta..."
          className="min-h-32 w-full resize-y border-0 border-b border-eg-ink bg-transparent px-0 py-3 text-base leading-7 text-eg-ink outline-none placeholder:text-eg-text-muted focus:border-eg-brand"
        />
      </label>

      <SendMessageSubmitButton submitLabel={submitLabel} />
    </form>
  );
}
