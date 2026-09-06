import type { FrozenCategory } from "../types/category"

// Discovery category, non albo chiuso: "Geometra" è il termine più riconosciuto
// dall'utente per pratiche e certificazioni edilizie, ma gli alias coprono anche
// architetti, ingegneri e studi tecnici. Distinta da `impresa-edile` (impresa
// esecutrice). Sector DB: edilizia.
export const geometra: FrozenCategory = {
  id: "geometra",
  slug: "geometra",
  name: "Geometra",
  shortDescription:
    "Gestisce CILA, SCIA, APE, variazioni catastali, sanatorie edilizie e progetti di ristrutturazione.",
  aliases: [
    "geometri",
    "studio tecnico",
    "tecnico abilitato",
    "tecnico edilizio",
    "architetto",
    "ingegnere",
    "pratiche edilizie",
  ],
  projectGroups: ["tecnici-e-pratiche-edilizie"],
}
