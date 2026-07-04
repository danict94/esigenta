import type { FrozenProjectGroup } from "../types/project-group"

// Fabbro (categoria `fabbro`, sector edilizia): serrature/cilindri, apertura
// porta, serrande metalliche, inferriate/grate, ringhiere/parapetti, cancelli
// fisici in ferro. Confini: porta blindata prodotto → serramenti-e-infissi;
// tapparelle domestiche → serramenti; automazione cancello → citofoni-sicurezza-
// e-smart-home; balconi/frontalini/strutture → facciate-e-balconi. Fuori scope:
// cassaforte, chiavi auto, duplicazione/copia chiavi, serrature smart.
export const fabbroSerrandeECancelli: FrozenProjectGroup = {
  id: "fabbro-serrande-e-cancelli",
  slug: "fabbro-serrande-e-cancelli",
  name: "Fabbro, serrande e cancelli",
  interventions: [
    {
      id: "cambiare-o-riparare-serratura",
      slug: "cambiare-o-riparare-serratura",
      name: "Cambiare o riparare serratura",
      // Serratura/cilindro/meccanismo, anche di una blindata. Il prodotto porta
      // blindata resta in serramenti-e-infissi.
      aliases: [
        "cambiare serratura",
        "sostituire serratura",
        "riparare serratura",
        "serratura rotta",
        "serratura bloccata",
        "cambiare cilindro",
        "sostituire cilindro",
        "cilindro europeo",
        "sostituire cilindro europeo",
        "cambiare cilindro europeo",
        "serratura porta blindata",
        "cambiare serratura porta blindata",
      ],
    },
    {
      id: "aprire-porta-bloccata",
      slug: "aprire-porta-bloccata",
      name: "Aprire porta bloccata",
      // Lead premium/urgenza. Nessuna promessa di pronto intervento 24h o tempi
      // garantiti (qui e nel futuro funnel). "aprire porta bloccata" NON è alias
      // (== slug/name).
      aliases: [
        "porta bloccata",
        "porta chiusa fuori",
        "chiavi dentro casa",
        "chiavi perse casa",
        "aprire porta senza chiavi",
        "fabbro apertura porta",
        "apertura porta",
        "porta non si apre",
        "serratura bloccata porta",
      ],
    },
    {
      id: "riparare-o-sostituire-serranda",
      slug: "riparare-o-sostituire-serranda",
      name: "Riparare o sostituire serranda",
      // Serrande metalliche/garage/negozio. Tapparelle domestiche → serramenti.
      aliases: [
        "riparare serranda",
        "sostituire serranda",
        "serranda rotta",
        "serranda bloccata",
        "serranda garage",
        "serranda negozio",
        "serranda metallica",
        "riparare serranda garage",
        "riparare serranda negozio",
        "motore serranda",
        "sostituire motore serranda",
        "serranda elettrica",
      ],
    },
    {
      id: "installare-inferriate-o-grate",
      slug: "installare-inferriate-o-grate",
      name: "Installare inferriate o grate di sicurezza",
      // Bonus/detrazioni NON promessi: il professionista valuta requisiti.
      aliases: [
        "installare inferriate",
        "sostituire inferriate",
        "inferriate",
        "inferriate di sicurezza",
        "grate di sicurezza",
        "installare grate",
        "grate finestre",
        "inferriate finestre",
        "inferriate apribili",
        "inferriate su misura",
        "grate antintrusione",
        "protezione finestre",
      ],
    },
    {
      id: "installare-ringhiere",
      slug: "installare-ringhiere",
      name: "Installare ringhiere",
      // Ringhiere/parapetti metallici. Ripristino frontalini/balconi/strutture →
      // facciate-e-balconi. "installare ringhiere" NON è alias (== slug/name).
      aliases: [
        "installare ringhiera",
        "sostituire ringhiera",
        "sostituire ringhiere",
        "ringhiera ferro",
        "ringhiera balcone",
        "ringhiera scala",
        "ringhiere in ferro",
        "ringhiere esterne",
        "parapetto in ferro",
        "parapetti metallici",
        "carpenteria metallica ringhiere",
      ],
    },
    {
      id: "installare-o-riparare-cancello",
      slug: "installare-o-riparare-cancello",
      name: "Installare o riparare cancello",
      // Cancello fisico/metallico. NIENTE alias di automazione: motore/
      // motorizzare/automazione/telecomando/cancello automatico → citofoni.
      aliases: [
        "installare cancello",
        "riparare cancello",
        "cancello in ferro",
        "cancello di ferro",
        "cancello pedonale",
        "cancello carrabile",
        "cancello scorrevole",
        "cancello a battente",
        "saldare cancello",
        "cancello ferro battuto",
        "sostituire cancello",
        "riparare cancello in ferro",
      ],
    },
  ],
}
