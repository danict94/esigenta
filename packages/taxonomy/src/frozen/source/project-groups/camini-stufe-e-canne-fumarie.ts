import type { FrozenProjectGroup } from "../types/project-group"

// Camini, stufe e canne fumarie (categoria `fumista`, sector edilizia): stufe a
// pellet/legna, caminetti/inserti/termocamini, canne fumarie (installazione/
// adeguamento) e pulizia (spazzacamino). Confini: infiltrazioni da comignolo/
// canna fumaria (acqua dal tetto) → tetti; caldaia/termosifoni/PdC → riscaldamento
// (termoidraulico). Fuori scope: barbecue/forni esterni → eventuale esterni-giardino.
export const caminiStufeECanneFumarie: FrozenProjectGroup = {
  id: "camini-stufe-e-canne-fumarie",
  slug: "camini-stufe-e-canne-fumarie",
  name: "Camini, stufe e canne fumarie",
  interventions: [
    {
      id: "installare-o-sostituire-stufa",
      slug: "installare-o-sostituire-stufa",
      name: "Installare o sostituire stufa",
      // Pellet/legna (tipo nel funnel). Caldaia → riscaldamento.
      aliases: [
        "installare stufa",
        "sostituire stufa",
        "cambiare stufa",
        "stufa",
        "stufa a pellet",
        "installare stufa a pellet",
        "sostituire stufa a pellet",
        "stufa a legna",
        "installare stufa a legna",
        "stufa a pellet canalizzata",
        "stufa a pellet ad aria",
        "termostufa",
      ],
    },
    {
      id: "installare-caminetto-o-inserto",
      slug: "installare-caminetto-o-inserto",
      name: "Installare caminetto o inserto",
      aliases: [
        "installare caminetto",
        "sostituire caminetto",
        "caminetto",
        "camino",
        "caminetto a legna",
        "caminetto a pellet",
        "camino a legna",
        "inserto camino",
        "installare inserto camino",
        "termocamino",
        "installare termocamino",
        "monoblocco camino",
      ],
    },
    {
      id: "installare-o-adeguare-canna-fumaria",
      slug: "installare-o-adeguare-canna-fumaria",
      name: "Installare o adeguare canna fumaria",
      // Installazione/adeguamento. Infiltrazione comignolo/canna fumaria → tetti.
      aliases: [
        "installare canna fumaria",
        "canna fumaria",
        "adeguare canna fumaria",
        "adeguamento canna fumaria",
        "canna fumaria stufa",
        "canna fumaria camino",
        "canna fumaria a norma",
        "rifare canna fumaria",
        "sostituire canna fumaria",
        "installare canna fumaria stufa",
        "canna fumaria acciaio",
        "tubo canna fumaria",
      ],
    },
    {
      id: "pulire-canna-fumaria",
      slug: "pulire-canna-fumaria",
      name: "Pulire canna fumaria",
      // Spazzacamino: ricorrente/obbligatoria (UNI/assicurazione). "pulire canna
      // fumaria" NON è alias (== slug/name).
      aliases: [
        "pulizia canna fumaria",
        "spazzacamino",
        "pulizia camino",
        "pulire camino",
        "pulizia canna fumaria stufa",
        "controllo canna fumaria",
        "videoispezione canna fumaria",
        "pulizia stufa a pellet",
        "manutenzione stufa",
        "manutenzione canna fumaria",
      ],
    },
  ],
}
