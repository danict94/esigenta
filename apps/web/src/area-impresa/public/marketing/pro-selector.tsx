import Link from "next/link";

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
  return (
    <section
      id="inizia"
      className="relative z-[2] mx-auto mt-0 max-w-[820px] scroll-mt-28 px-12 max-[860px]:px-[22px]"
      aria-label="Configura il profilo professionista"
    >
      {hasDeactivatedCompany ? (
        <div className="border border-eg-border bg-eg-surface">
          <div className="eg-panel-header flex items-center justify-between gap-4 border-b border-eg-border px-5 py-3.5">
            <span>Profilo trovato</span>
            <span>riattiva</span>
          </div>
          <div className="px-[26px] py-7 max-[860px]:px-5">
            <p className="eg-eyebrow">Account disattivato</p>
            <h2 className="eg-h3 mt-4">Riattiva il tuo profilo impresa</h2>
            <p className="eg-body-muted mt-4">
              Abbiamo trovato un account impresa associato a questa sessione.
              Puoi riattivarlo mantenendo storico, richieste e configurazione.
            </p>
            <form action={reactivateAction} className="mt-6">
              <button
                type="submit"
                className="eg-button-primary"
              >
                Riattiva account <span aria-hidden="true">&rarr;</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <CompanyLeadForm categories={categories} />
      )}

      <p className="eg-body-muted mt-4 text-center text-sm">
        Hai gia un profilo?{" "}
        <Link href="/area-impresa/accedi" prefetch={false} className="font-medium text-eg-brand-strong hover:text-eg-brand">
          Accedi all&apos;area impresa
        </Link>
      </p>
    </section>
  );
}
