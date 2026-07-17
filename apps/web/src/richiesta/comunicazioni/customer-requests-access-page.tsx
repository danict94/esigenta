import { PublicShell } from "../../site/shell/public-shell";
import { requestCustomerAccessAction } from "./actions/request-customer-access-action";

type CustomerRequestsAccessPageProps = {
  hasSent: boolean;
};

export function CustomerRequestsAccessPage({
  hasSent,
}: CustomerRequestsAccessPageProps) {
  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <div className="grid items-start gap-[clamp(42px,6vw,82px)] lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
              <div className="max-w-[720px] max-lg:max-w-none">
                <p className="eg-eyebrow">Le mie richieste</p>

                <h1 className="eg-h1 mt-5">
                  Accedi al tuo storico richieste
                </h1>

                <p className="eg-body-muted mt-6 max-w-[52ch] text-[17px] leading-8">
                  Inserisci la tua email e ricevi un link sicuro per controllare
                  le richieste che hai inviato su esigenta. Non devi ricordare
                  password e non devi creare un account.
                </p>
              </div>

              <div className="eg-panel p-6 md:p-8">
                <div>
                  <h2 className="eg-h3">Ricevi il link di accesso</h2>

                  <p className="eg-body-muted mt-3">
                    Ti invieremo un&apos;email con un link sicuro per entrare
                    nella tua area richieste.
                  </p>
                </div>

                {hasSent ? (
                  <div className="eg-alert mt-6">
                    <strong className="font-medium">Controlla la tua email.</strong>{" "}
                    Se l&apos;indirizzo e associato a una o piu richieste,
                    riceverai un link di accesso.
                  </div>
                ) : null}

                <form
                  action={requestCustomerAccessAction}
                  className="mt-7 flex flex-col gap-5"
                >
                  <label htmlFor="email" className="eg-form-field">
                    <span className="eg-form-label">Email</span>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="es.nome@email.it"
                      className="w-full border-0 border-b border-eg-terra bg-transparent px-0 py-3 text-base text-eg-terra outline-none placeholder:text-eg-ardesia-2 focus:border-eg-cotto-dark"
                    />
                  </label>

                  <button type="submit" className="eg-button-primary w-full">
                    Invia link di accesso
                  </button>
                </form>

                <p className="eg-form-help mt-5 text-center">
                  Non serve una password. Usa la stessa email indicata quando
                  hai inviato la richiesta.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
