import type { FrozenProjectGroup } from "../types/project-group"

export const impiantiIdraulici: FrozenProjectGroup = {
  id: "impianti-idraulici",
  slug: "impianti-idraulici",
  name: "Impianti idraulici",
  interventions: [
    {
      id: "rifare-impianto-idraulico-bagno",
      slug: "rifare-impianto-idraulico-bagno",
      name: "Rifare impianto idraulico bagno",
      runtimePresetSlugs: ["BATHROOM_RENOVATION", "RENOVATION"],
      aliases: ["rifacimento tubazioni bagno", "rifacimento impianto idraulico bagno"],
    },
    {
      id: "riparare-perdita-acqua",
      slug: "riparare-perdita-acqua",
      name: "Riparare perdita acqua",
      runtimePresetSlugs: ["EMERGENCY_REPAIR", "PLUMBING_EMERGENCY"],
      aliases: ["perdita acqua", "tubo che perde", "riparazione perdita acqua"],
    },
    {
      id: "disostruire-scarichi",
      slug: "disostruire-scarichi",
      name: "Disostruire scarichi",
      runtimePresetSlugs: ["PLUMBING_EMERGENCY", "QUICK_SERVICE"],
      aliases: ["scarico otturato", "tubo intasato", "disostruzione scarichi"],
    },
    {
      id: "sostituire-box-doccia",
      slug: "sostituire-box-doccia",
      name: "Sostituire box doccia",
      runtimePresetSlugs: ["BATHROOM_RENOVATION"],
      aliases: ["cambiare box doccia", "nuova doccia", "sostituzione box doccia"],
    },
    {
      id: "installare-sanitari",
      slug: "installare-sanitari",
      name: "Installare sanitari",
      runtimePresetSlugs: ["BATHROOM_RENOVATION", "PLUMBING_EMERGENCY"],
      aliases: ["montare sanitari bagno", "sostituire sanitari", "installazione sanitari"],
    },
  ],
}
