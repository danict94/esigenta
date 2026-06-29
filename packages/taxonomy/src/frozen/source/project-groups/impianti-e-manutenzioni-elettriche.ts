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
      name: "Riparare quadro elettrico",
      aliases: ["sostituire quadro elettrico", "quadro elettrico"],
    },
    {
      id: "installare-illuminazione",
      slug: "installare-illuminazione",
      name: "Installare illuminazione",
      aliases: ["installare faretti led", "montare lampadario", "punti luce", "faretti led", "installazione illuminazione"],
    },
  ],
}
