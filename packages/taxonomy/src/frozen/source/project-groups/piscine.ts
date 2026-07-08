import type { FrozenProjectGroup } from "../types/project-group"

// Piscine (categoria `piscinista`, sector edilizia): servizi specializzati per
// piscina — costruzione, rinnovo, manutenzione e coperture. Confini: NON
// giardino/irrigazione/pavimentazione esterna (→ esterni-e-giardino), NON
// idraulica domestica (→ idraulica), NON opera edile generica/casa/garage (→
// costruzioni-e-ampliamenti / ristrutturazioni), NON spa/idromassaggio/jacuzzi/
// laghetto/piscine gonfiabili-rimovibili (prodotti diversi). Batch 1: i 2
// interventi core. Manutenzione e copertura arrivano dopo; impianto/filtrazione
// resta opzione funnel, non intervento autonomo.
export const piscine: FrozenProjectGroup = {
  id: "piscine",
  slug: "piscine",
  name: "Piscine",
  interventions: [
    {
      id: "costruire-piscina",
      slug: "costruire-piscina",
      name: "Costruire piscina",
      // Nuova piscina: interrata, seminterrata o fuori terra STRUTTURATA. NON
      // gonfiabile/rimovibile (prodotto). Copy funnel prudente sul permesso
      // (interrata = permesso di costruire). Niente alias spa/idromassaggio/
      // jacuzzi/laghetto/giardino/casa/garage.
      aliases: [
        "realizzare piscina",
        "costruzione piscina",
        "costruire piscina interrata",
        "realizzare piscina interrata",
        "piscina interrata",
        "piscina seminterrata",
        "realizzare piscina in giardino",
        "piscina in muratura",
        "piscina prefabbricata",
      ],
    },
    {
      id: "ristrutturare-piscina",
      slug: "ristrutturare-piscina",
      name: "Ristrutturare piscina",
      // Rinnovo di una piscina esistente: rivestimento, bordo, struttura,
      // impianto o intervento complessivo. NON manutenzione ordinaria/pulizia
      // occasionale (→ futuro fare-manutenzione-piscina). Niente alias
      // manutenzione/pulizia/prodotti/spa.
      aliases: [
        "rifare piscina",
        "sistemare piscina",
        "rinnovare piscina",
        "ristrutturazione piscina",
        "rifacimento piscina",
        "rifare rivestimento piscina",
        "cambiare rivestimento piscina",
        "sistemare bordo piscina",
        "ripristinare piscina",
      ],
    },
  ],
}
