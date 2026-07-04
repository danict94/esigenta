import type { FrozenProjectGroup } from "../types/project-group"

// Riscaldamento (categoria `idraulico`, che fa idraulica + termo). Generazione ed
// emissione calore + produzione ACS: caldaia, pompa di calore (aria-acqua),
// termosifoni/radiatori, pavimento radiante, scaldabagno, manutenzione caldaia.
// Confini: perdite d'acqua/scarichi/sanitari/box doccia → `idraulica`;
// condizionatori/split aria-aria/raffrescamento → `climatizzazione` ("pompa di
// calore" = riscaldamento, "condizionatore" = climatizzazione). Fuori scope
// (micro/€50): sfiato/spurgo, ricarica pressione, sblocco, singola valvola.
export const riscaldamento: FrozenProjectGroup = {
  id: "riscaldamento",
  slug: "riscaldamento",
  name: "Riscaldamento",
  interventions: [
    {
      id: "installare-o-sostituire-caldaia",
      slug: "installare-o-sostituire-caldaia",
      name: "Installare o sostituire caldaia",
      // "rifare/nuovo impianto di riscaldamento" vive qui come alias, non come
      // intervento a sé.
      aliases: [
        "sostituire caldaia",
        "cambiare caldaia",
        "installare caldaia",
        "nuova caldaia",
        "caldaia a condensazione",
        "installare caldaia a condensazione",
        "sostituzione caldaia",
        "caldaia a gas",
        "caldaia murale",
        "rifare impianto di riscaldamento",
        "nuovo impianto di riscaldamento",
        "installare impianto di riscaldamento",
      ],
    },
    {
      id: "installare-pompa-di-calore",
      slug: "installare-pompa-di-calore",
      name: "Installare pompa di calore",
      // Aria-acqua per riscaldamento/ACS. Aria-aria (split) resta in
      // `climatizzazione`. "installare pompa di calore" NON è alias (== slug).
      aliases: [
        "pompa di calore",
        "pompa di calore aria acqua",
        "installare pompa di calore aria acqua",
        "sostituire pompa di calore",
        "pompa di calore riscaldamento",
        "pompa di calore per riscaldamento",
        "impianto a pompa di calore",
        "pompa di calore ibrida",
        "sistema ibrido caldaia pompa di calore",
        "pompa di calore casa",
      ],
    },
    {
      id: "installare-o-sostituire-termosifoni",
      slug: "installare-o-sostituire-termosifoni",
      name: "Installare o sostituire termosifoni",
      aliases: [
        "installare termosifoni",
        "sostituire termosifoni",
        "cambiare termosifoni",
        "nuovi termosifoni",
        "installare radiatori",
        "sostituire radiatori",
        "termosifoni",
        "radiatori",
        "spostare termosifoni",
        "aggiungere termosifoni",
        "valvole termostatiche",
        "installare valvole termostatiche",
      ],
    },
    {
      id: "installare-riscaldamento-a-pavimento",
      slug: "installare-riscaldamento-a-pavimento",
      name: "Installare riscaldamento a pavimento",
      // "installare riscaldamento a pavimento" NON è alias (== slug/name).
      aliases: [
        "riscaldamento a pavimento",
        "pavimento radiante",
        "installare pavimento radiante",
        "impianto a pavimento",
        "riscaldamento a pavimento radiante",
        "riscaldamento pavimento",
        "sistema radiante",
        "massetto radiante",
      ],
    },
    {
      id: "installare-o-sostituire-scaldabagno",
      slug: "installare-o-sostituire-scaldabagno",
      name: "Installare o sostituire scaldabagno",
      // Apparecchio termico per ACS: sta qui, non in idraulica.
      aliases: [
        "scaldabagno",
        "installare scaldabagno",
        "sostituire scaldabagno",
        "cambiare scaldabagno",
        "scaldabagno elettrico",
        "scaldabagno a gas",
        "boiler",
        "boiler elettrico",
        "installare boiler",
        "sostituire boiler",
        "scaldacqua",
        "scaldino",
      ],
    },
    {
      id: "fare-manutenzione-caldaia",
      slug: "fare-manutenzione-caldaia",
      name: "Fare manutenzione caldaia",
      // Ricorrente e obbligatoria (controllo fumi/bollino). "fare manutenzione
      // caldaia" NON è alias (== slug/name).
      aliases: [
        "manutenzione caldaia",
        "revisione caldaia",
        "controllo caldaia",
        "controllo fumi caldaia",
        "pulizia caldaia",
        "assistenza caldaia",
        "bollino blu caldaia",
        "manutenzione caldaia a gas",
        "tagliando caldaia",
      ],
    },
  ],
}
