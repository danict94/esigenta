import type { FrozenProjectGroup } from "../types/project-group"

// Costruzioni e ampliamenti (categoria `impresa-edile`, sector edilizia): opera/
// cantiere strutturato big-ticket — NUOVO volume edilizio. Confine: QUI si compra
// un'opera, NON una pratica tecnica (CILA/SCIA/progetto → tecnici-e-pratiche-
// edilizie), NON il rifacimento dell'esistente (→ ristrutturazioni), NON piccola
// muratura interna (parete/tramezzo/vano → opere-murarie-e-demolizioni), NON
// muretti/recinzioni (→ esterni-e-giardino), NON tetti (→ tetti). Copy prudente:
// mai promettere permessi, fattibilità, tempi, prezzi o "chiavi in mano".
// Batch 1 prudente: i 2 interventi core più chiari e ad alto valore.
// Sopraelevazione, garage/deposito e dependance/annesso arrivano dopo, 1-2 alla
// volta. Fondazioni/platea NON è intervento a sé (fase di cantiere).
export const costruzioniEAmpliamenti: FrozenProjectGroup = {
  id: "costruzioni-e-ampliamenti",
  slug: "costruzioni-e-ampliamenti",
  name: "Costruzioni e ampliamenti",
  interventions: [
    {
      id: "costruire-casa",
      slug: "costruire-casa",
      name: "Costruire casa",
      // Nuova costruzione (casa/villetta) da zero. NIENTE alias "ristrutturare"/
      // "rifare casa" (→ ristrutturazioni) né "impresa edile" nudo (categoria).
      aliases: [
        "costruzione casa",
        "nuova costruzione",
        "costruire casa nuova",
        "costruire casa da zero",
        "costruire villetta",
        "costruire villa",
        "costruzione villetta",
        "costruire abitazione",
        "costruzione nuova",
        "costruire una casa",
      ],
    },
    {
      id: "ampliare-casa",
      slug: "ampliare-casa",
      name: "Ampliare casa",
      // Nuovo volume aggiunto a un edificio esistente (estensione). Distinto da
      // ristrutturazione (rifà l'esistente) e da sopraelevazione (aggiunge un
      // piano — intervento a sé, batch successivo).
      aliases: [
        "ampliamento casa",
        "ampliare la casa",
        "ampliare casa esistente",
        "ampliare abitazione",
        "ampliamento abitazione",
        "ingrandire casa",
        "aggiungere stanza",
        "ampliamento volumetrico",
        "costruire ampliamento",
        "nuovo volume casa",
      ],
    },
  ],
}
