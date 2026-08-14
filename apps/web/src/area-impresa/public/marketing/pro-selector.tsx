import { blueprintEyebrowClassName } from "../../../site/shared/section-header";
import { CompanyLeadForm } from "./company-lead-form";

type CategoryOption = {
  slug: string;
  name: string;
};

type ProSelectorProps = {
  categories: CategoryOption[];
  hasDeactivatedCompany: boolean;
  reactivateAction: () => Promise<void>;
};

export function ProSelector({
  categories,
  hasDeactivatedCompany,
  reactivateAction,
}: ProSelectorProps) {
  if (hasDeactivatedCompany) {
    return (
      <div className="border border-eg-border bg-eg-surface shadow-eg-slab">
        <div className="flex items-center justify-between gap-4 border-b border-eg-border px-6.5 py-5.5">
          <span className={blueprintEyebrowClassName}>Profilo trovato</span>
          <span className="font-(family-name:--eg-font-mono) text-xs text-eg-text-muted">
            riattiva
          </span>
        </div>
        <div className="px-6.5 py-7">
          <p className="eg-eyebrow">Account disattivato</p>
          <h2 className="eg-h3 mt-4">Riattiva il tuo profilo impresa</h2>
          <p className="eg-body-muted mt-4">
            Abbiamo trovato un account impresa associato a questa sessione.
            Puoi riattivarlo mantenendo storico, richieste e configurazione.
          </p>
          <form action={reactivateAction} className="mt-6">
            <button type="submit" className="eg-button-primary eg-button-arrow">
              Riattiva account
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <CompanyLeadForm categories={categories} />;
}
