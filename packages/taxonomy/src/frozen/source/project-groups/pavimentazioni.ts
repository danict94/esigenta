import type { FrozenProjectGroup } from "../types/project-group"

export const pavimentazioni: FrozenProjectGroup = {
  id: "pavimentazioni",
  slug: "pavimentazioni",
  name: "Pavimentazioni",
  interventions: [
    {
      id: "fare-massetto",
      slug: "fare-massetto",
      name: "Realizzare o rifare massetto",
      // Alias mirati sul massetto/sottofondo. "fare massetto" NON è alias:
      // normalizzato coincide con lo slug (vietato dal validator) ed è già
      // coperto dalla ricerca via slug. Niente alias larghi tipo "rifare
      // pavimento"/"posa pavimento" (serviranno ad altri interventi futuri).
      aliases: [
        "gettare massetto",
        "realizzare massetto",
        "rifare massetto",
        "rifare il sottofondo",
        "massetti",
        "massetto per pavimento",
        "sottofondo pavimento",
        "rifare sottofondo pavimento",
      ],
    },
    {
      id: "posare-o-rifare-pavimento-interno",
      slug: "posare-o-rifare-pavimento-interno",
      name: "Posare o rifare pavimento interno",
      // Intervento madre: posa/sostituzione/rifacimento pavimenti interni.
      // Materiali (piastrelle/gres/laminato/pvc/vinilico/spc/lvt/click) sono
      // opzioni di funnel + alias, NON interventi separati. Lista curata a 20
      // (MAX_ALIAS_PER_ENTITY): ≥1 alias per materiale + forme d'azione; scartati
      // 6 doppioni di fraseggio (coperti a livello di token dagli alias tenuti).
      aliases: [
        "posare pavimento",
        "rifare pavimento",
        "cambiare pavimento",
        "sostituire pavimento",
        "posa pavimento",
        "nuovo pavimento",
        "pavimento interno",
        "posare piastrelle",
        "posa piastrelle",
        "posare gres",
        "posa gres",
        "pavimento laminato",
        "posare laminato",
        "pavimento pvc",
        "pavimento vinilico",
        "pavimento spc",
        "posare spc",
        "pavimento lvt",
        "posare lvt",
        "pavimento a click",
      ],
    },
    {
      id: "posare-levigare-o-ripristinare-parquet",
      slug: "posare-levigare-o-ripristinare-parquet",
      name: "Posare, levigare o ripristinare parquet",
      // Intervento dedicato al legno: posa nuova, levigatura/lucidatura,
      // ripristino. laminato/PVC/SPC/LVT restano su `posare-o-rifare-pavimento-
      // interno` (non parquet). Niente alias larghi tipo "pavimento in legno".
      aliases: [
        "posare parquet",
        "posa parquet",
        "installare parquet",
        "mettere parquet",
        "levigare parquet",
        "lucidare parquet",
        "lamare parquet",
        "ripristinare parquet",
        "trattamento parquet",
        "parquet rovinato",
        "parquet graffiato",
        "parquet da sistemare",
        "rifare parquet",
        "sostituire parquet",
        "parquet flottante",
        "parquet prefinito",
      ],
    },
    {
      id: "riparare-pavimento",
      slug: "riparare-pavimento",
      // Name cliente-friendly: la domanda reale arriva via "piastrella rotta" &
      // simili, non dal verbo astratto "riparare pavimento". Slug invariato.
      name: "Riparare piastrelle o pavimento rotto",
      // Riparazione puntuale: piastrelle rotte/sollevate, fughe, piccole zone.
      // "riparare pavimento" NON è alias: normalizzato coincide con lo slug
      // (vietato dal validator), già coperto via slug. Il parquet resta nel suo
      // intervento dedicato; niente alias larghi di posa/rifacimento.
      aliases: [
        "riparazione pavimento",
        "pavimento rotto",
        "pavimento danneggiato",
        "pavimento sollevato",
        "pavimento staccato",
        "pavimento che si muove",
        "piastrelle rotte",
        "piastrella rotta",
        "riparare piastrelle",
        "sostituire piastrelle rotte",
        "piastrelle sollevate",
        "piastrelle staccate",
        "fughe rovinate",
        "rifare fughe pavimento",
        "sistemare pavimento",
      ],
    },
  ],
}
