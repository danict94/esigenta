import type { FrozenProjectGroup } from "../types/project-group"

export const fotovoltaico: FrozenProjectGroup = {
  id: "fotovoltaico",
  slug: "fotovoltaico",
  name: "Fotovoltaico",
  // Mappa a 3 interventi madre lungo il ciclo di vita: nuovo impianto /
  // ampliamento-modifica / riparazione-manutenzione. Niente intervento per
  // singolo componente (inverter, quadro, centralina, batteria, monitoraggio,
  // pulizia pannelli): restano alias e domande/opzioni di funnel.
  //
  // Accumulo/batteria: nuovo impianto con accumulo → `installare-fotovoltaico`
  // (alias "con accumulo/batteria", l'accumulo è una domanda nel funnel).
  // Aggiungere batteria a un impianto ESISTENTE → `modificare-o-potenziare`.
  // Guasto/problema/errore → `riparare-o-fare-manutenzione`.
  interventions: [
    {
      id: "installare-fotovoltaico",
      slug: "installare-fotovoltaico",
      name: "Installare fotovoltaico",
      aliases: [
        "impianto fotovoltaico",
        "pannelli solari",
        "installazione fotovoltaico",
        "fotovoltaico con accumulo",
        "fotovoltaico con batteria",
        "impianto con accumulo",
        "preventivo fotovoltaico",
        "mettere pannelli solari",
      ],
    },
    {
      id: "modificare-o-potenziare-impianto-fotovoltaico",
      slug: "modificare-o-potenziare-impianto-fotovoltaico",
      name: "Ampliare o modificare impianto fotovoltaico",
      aliases: [
        "ampliare impianto fotovoltaico",
        "ampliare fotovoltaico",
        "aggiungere pannelli fotovoltaici",
        "aggiungere pannelli solari",
        "aggiungere batteria fotovoltaico",
        "aggiungere accumulo a impianto esistente",
        "potenziare fotovoltaico",
        "potenziare impianto fotovoltaico",
        "modificare impianto fotovoltaico",
        "sostituire inverter fotovoltaico",
        "monitoraggio fotovoltaico",
      ],
    },
    {
      id: "riparare-o-fare-manutenzione-fotovoltaico",
      slug: "riparare-o-fare-manutenzione-fotovoltaico",
      name: "Riparare o fare manutenzione al fotovoltaico",
      aliases: [
        "manutenzione fotovoltaico",
        "riparazione fotovoltaico",
        "riparare impianto fotovoltaico",
        "fotovoltaico non produce",
        "impianto fotovoltaico fermo",
        "impianto fotovoltaico non funziona",
        "errore inverter",
        "inverter fotovoltaico guasto",
        "pulizia pannelli solari",
        "pulire pannelli fotovoltaici",
        "controllo impianto fotovoltaico",
        "assistenza fotovoltaico",
      ],
    },
  ],
}
