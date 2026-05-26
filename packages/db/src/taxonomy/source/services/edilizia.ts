import type { TaxonomyService } from "../../shared/types"

export const ediliziaServices: TaxonomyService[] = [
  // Ristrutturazioni
  {
    slug: "ristrutturazione-bagno",
    name: "Ristrutturazione bagno",
    runtimePresetSlugs: [
      "BATHROOM_RENOVATION",
    ],
  },

  {
    slug: "ristrutturazione-cucina",
    name: "Ristrutturazione cucina",
  },

  {
    slug: "ristrutturazione-appartamento",
    name: "Ristrutturazione appartamento",
    runtimePresetSlugs: [
      "HOME_RENOVATION",
    ],
  },

  {
    slug: "ristrutturazione-casa",
    name: "Ristrutturazione casa",
    runtimePresetSlugs: [
      "HOME_RENOVATION",
    ],
  },

  // Nuove costruzioni e ampliamenti
  {
    slug: "nuove-costruzioni",
    name: "Nuove costruzioni",
  },

  {
    slug: "costruzione-case",
    name: "Costruzione case",
  },

  {
    slug: "costruzione-ville",
    name: "Costruzione ville",
  },

  {
    slug: "ampliamenti-edili",
    name: "Ampliamenti edili",
  },

  {
    slug: "sopraelevazioni",
    name: "Sopraelevazioni",
  },

  // Opere murarie
  {
    slug: "opere-murarie",
    name: "Opere murarie",
  },

  {
    slug: "demolizioni",
    name: "Demolizioni",
  },

  {
    slug: "costruzione-tramezzi",
    name: "Costruzione tramezzi",
  },

  {
    slug: "apertura-chiusura-vani",
    name: "Apertura e chiusura vani",
  },

  {
    slug: "riparazioni-muratura",
    name: "Riparazioni muratura",
  },

  {
    slug: "consolidamenti-murari",
    name: "Consolidamenti murari",
  },

  // Massetti, sottofondi e pavimenti
  {
    slug: "massetti",
    name: "Massetti",
  },

  {
    slug: "sottofondi",
    name: "Sottofondi",
  },

  {
    slug: "livellamento-pavimenti",
    name: "Livellamento pavimenti",
  },

  {
    slug: "posa-pavimenti",
    name: "Posa pavimenti",
  },

  {
    slug: "posa-rivestimenti",
    name: "Posa rivestimenti",
  },

  {
    slug: "posa-piastrelle",
    name: "Posa piastrelle",
  },

  // Intonaci, rasature e ripristini
  {
    slug: "intonaci",
    name: "Intonaci",
  },

  {
    slug: "rasature",
    name: "Rasature",
  },

  {
    slug: "stuccature-murarie",
    name: "Stuccature murarie",
  },

  {
    slug: "ripristino-muri",
    name: "Ripristino muri",
  },

  // Impermeabilizzazioni
  {
    slug: "impermeabilizzazione-terrazzi",
    name: "Impermeabilizzazione terrazzi",
  },

  {
    slug: "impermeabilizzazione-balconi",
    name: "Impermeabilizzazione balconi",
  },

  {
    slug: "impermeabilizzazione-bagno",
    name: "Impermeabilizzazione bagno",
  },

  {
    slug: "impermeabilizzazione-piscine",
    name: "Impermeabilizzazione piscine",
  },

  {
    slug: "guaina-bituminosa",
    name: "Guaina bituminosa",
  },

  // Facciate, cappotti ed esterni
  {
    slug: "rifacimento-facciate",
    name: "Rifacimento facciate",
  },

  {
    slug: "ripristino-facciate",
    name: "Ripristino facciate",
  },

  {
    slug: "intonaci-esterni",
    name: "Intonaci esterni",
  },

  {
    slug: "isolamento-cappotto",
    name: "Isolamento a cappotto",
  },

  // Tetti e coperture
  {
    slug: "rifacimento-tetto",
    name: "Rifacimento tetto",
  },

  {
    slug: "riparazione-tetto",
    name: "Riparazione tetto",
  },

  {
    slug: "coperture-edili",
    name: "Coperture edili",
  },

  {
    slug: "lattoneria",
    name: "Lattoneria",
  },

  {
    slug: "grondaie",
    name: "Grondaie",
  },

  {
    slug: "scossaline",
    name: "Scossaline",
  },

  // Balconi, terrazzi, frontalini e ballatoi
  {
    slug: "rifacimento-balconi",
    name: "Rifacimento balconi",
  },

  {
    slug: "rifacimento-terrazzi",
    name: "Rifacimento terrazzi",
  },

  {
    slug: "rifacimento-ballatoi",
    name: "Rifacimento ballatoi",
  },

  {
    slug: "ripristino-frontalini",
    name: "Ripristino frontalini",
  },

  {
    slug: "rifacimento-cornicioni",
    name: "Rifacimento cornicioni",
  },

  {
    slug: "ripristino-sottobalconi",
    name: "Ripristino sottobalconi",
  },

  {
    slug: "rifacimento-scale",
    name: "Rifacimento scale",
  },

  // Piscine
  {
    slug: "costruzione-piscine",
    name: "Costruzione piscine",
  },

  {
    slug: "ristrutturazione-piscine",
    name: "Ristrutturazione piscine",
  },

  {
    slug: "rivestimento-piscine",
    name: "Rivestimento piscine",
  },

  // Cartongesso
  {
    slug: "cartongesso",
    name: "Cartongesso",
  },

  {
    slug: "pareti-cartongesso",
    name: "Pareti in cartongesso",
  },

  {
    slug: "controsoffitti",
    name: "Controsoffitti",
  },

  {
    slug: "velette-cartongesso",
    name: "Velette in cartongesso",
  },

  {
    slug: "nicchie-cartongesso",
    name: "Nicchie in cartongesso",
  },

  {
    slug: "librerie-cartongesso",
    name: "Librerie in cartongesso",
  },

  {
    slug: "pareti-attrezzate-cartongesso",
    name: "Pareti attrezzate in cartongesso",
  },

  {
    slug: "contropareti-cartongesso",
    name: "Contropareti in cartongesso",
  },

  {
    slug: "cassonetti-cartongesso",
    name: "Cassonetti in cartongesso",
  },

  {
    slug: "botole-cartongesso",
    name: "Botole in cartongesso",
  },

  {
    slug: "riparazioni-cartongesso",
    name: "Riparazioni cartongesso",
  },

  //Imbianchino-tinteggiature

  {
    slug: "tinteggiatura-pareti",
    name: "Tinteggiatura pareti",
    runtimePresetSlugs: [
      "PAINTING",
    ],
  },

  {
    slug: "tinteggiatura-interni",
    name: "Tinteggiatura interni",
    runtimePresetSlugs: [
      "PAINTING",
    ],
  },

  {
    slug: "tinteggiatura-esterni",
    name: "Tinteggiatura esterni",
    runtimePresetSlugs: [
      "PAINTING",
    ],
  },
]
