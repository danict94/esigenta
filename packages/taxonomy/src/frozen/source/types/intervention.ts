/**
 * Unico stato canonico di pubblicazione di un Intervention, letto da ogni
 * superficie pubblica (search, funnel/richiesta, landing di gruppo,
 * professionisti/onboarding, /interventi, /costi, sitemap). "draft" = esiste
 * nella SSOT/DB/alias/funnel/contenuti ma non è raggiungibile, ricercabile o
 * richiedibile da un utente reale. Obbligatorio (non opzionale): un
 * Intervention senza questo campo non compila — niente stato implicito,
 * niente differenza di semantica tra record vecchi e nuovi.
 */
export type InterventionPublicationStatus = "draft" | "published"

export type FrozenIntervention = {
  id: string
  slug: string
  name: string
  publicationStatus: InterventionPublicationStatus
  description?: string
  aliases?: string[]
}
