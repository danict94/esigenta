import type { FrozenCategory } from "../types/category"

// Professione tecnica distinta da Architetto e Ingegnere. La Category descrive
// pertinenza di catalogo e non certifica automaticamente abilitazioni o incarichi
// per il singolo caso. Distinta anche da `impresa-edile` (impresa esecutrice).
export const geometra: FrozenCategory = {
  id: "geometra",
  slug: "geometra",
  name: "Geometra",
  shortDescription:
    "Gestisce CILA, SCIA, APE, variazioni catastali, sanatorie edilizie e progetti di ristrutturazione.",
  aliases: ["geometri"],
  projectGroups: ["tecnici-e-pratiche-edilizie"],
}
