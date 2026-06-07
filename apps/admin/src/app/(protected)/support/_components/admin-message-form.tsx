import {
  Button,
  Textarea,
} from "@esigenta/ui";

type AdminMessageFormProps = {
  action: (formData: FormData) => Promise<void>;
};

export function AdminMessageForm({
  action,
}: AdminMessageFormProps) {
  return (
    <form action={action} className="space-y-3">
      <div className="space-y-2">
        <label
          htmlFor="support-message-body"
          className="text-sm font-medium text-text-primary"
        >
          Messaggio
        </label>

        <Textarea
          id="support-message-body"
          name="body"
          required
          minLength={1}
          maxLength={5000}
          placeholder="Scrivi una risposta all'impresa..."
        />
      </div>

      <Button type="submit">
        Invia risposta
      </Button>
    </form>
  );
}
