import type { FrozenProjectGroup } from "../types/project-group"

export const impiantiEManutenzioniElettriche: FrozenProjectGroup = {
  id: "impianti-e-manutenzioni-elettriche",
  slug: "impianti-e-manutenzioni-elettriche",
  name: "Impianti e manutenzioni elettriche",
  interventions: [
    {
      id: "fare-impianto-elettrico-nuovo",
      slug: "fare-impianto-elettrico-nuovo",
      name: "Fare impianto elettrico nuovo",
      aliases: ["impianto elettrico da zero", "nuovo impianto elettrico", "impianto elettrico nuovo"],
    },
    {
      id: "rifare-impianto-elettrico",
      slug: "rifare-impianto-elettrico",
      name: "Rifare impianto elettrico",
      aliases: ["adeguare impianto elettrico", "ammodernare impianto elettrico", "rifacimento impianto elettrico"],
    },
    {
      id: "riparare-guasto-elettrico",
      slug: "riparare-guasto-elettrico",
      name: "Riparare guasto elettrico",
      aliases: ["guasto elettrico", "saltata la corrente", "salvavita che scatta", "riparazione guasti elettrici", "salvavita"],
    },
    {
      id: "riparare-quadro-elettrico",
      slug: "riparare-quadro-elettrico",
      // Name allargato lato cliente (riparare/sostituire/adeguare); slug invariato.
      name: "Sistemare o sostituire quadro elettrico",
      aliases: ["sostituire quadro elettrico", "quadro elettrico"],
    },
    {
      id: "installare-illuminazione",
      slug: "installare-illuminazione",
      name: "Installare illuminazione",
      // "punti luce" spostato su `installare-prese-interruttori-punti-luce`:
      // in gergo elettrico è il punto cablato, non la plafoniera.
      aliases: ["installare faretti led", "montare lampadario", "faretti led", "installazione illuminazione", "strisce led", "applique"],
    },
    {
      id: "installare-prese-interruttori-punti-luce",
      slug: "installare-prese-interruttori-punti-luce",
      name: "Installare prese, interruttori o punti luce",
      // Lavori piccoli/medi su punti elettrici: aggiungere/spostare/sostituire
      // prese, interruttori, punti luce, prese TV/dati. NON è un guasto (quello
      // è `riparare-guasto-elettrico`) né un intero impianto.
      aliases: [
        "installare presa elettrica",
        "aggiungere presa elettrica",
        "spostare presa elettrica",
        "sostituire presa elettrica",
        "installare interruttore",
        "sostituire interruttore",
        "aggiungere punto luce",
        "spostare punto luce",
        "punto luce",
        "punti luce",
        "presa tv",
        "presa dati",
      ],
    },
  ],
}
