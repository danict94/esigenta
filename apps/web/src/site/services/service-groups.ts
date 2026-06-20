/**
 * Service Group (Phase 20.9C — correzione della regressione 20.9).
 *
 * NON è una nuova entity taxonomy/Prisma/matching/funnel: è solo un
 * raggruppamento editoriale dei Service di una Category, usato come livello
 * UX intermedio per le Category molto ampie (oggi: solo "impresa-edile" e,
 * in misura minore, "imbianchino").
 *
 * Derivato esclusivamente dalla struttura reale Category -> Service
 * (packages/taxonomy/src/source/categories/*.ts) — non da PublicServiceMacroArea
 * né da Domain, che sono concetti SEO/navigazione e non riflettono il livello
 * naturale tra Category e Service (vedi 20_9_REGRESSION_ANALYSIS).
 *
 * Una Category assente da questa mappa (es. idraulico, elettricista,
 * cartongessista) non ha bisogno di gruppi: i suoi Service sono già pochi e
 * coerenti, quindi la UX consumer di questo modulo tratta l'assenza come "un
 * solo gruppo implicito" e salta lo step di scelta del gruppo.
 */
export type ServiceGroupDefinition = {
  slug: string;
  name: string;
  serviceSlugs: readonly string[];
};

export const serviceGroupsByCategorySlug: Readonly<
  Record<string, readonly ServiceGroupDefinition[]>
> = {
  "impresa-edile": [
    {
      slug: "ristrutturazioni",
      name: "Ristrutturazioni",
      serviceSlugs: [
        "ristrutturazione-bagno",
        "ristrutturazione-cucina",
        "ristrutturazione-appartamento",
        "ristrutturazione-casa",
      ],
    },
    {
      slug: "nuove-costruzioni",
      name: "Nuove costruzioni e ampliamenti",
      serviceSlugs: [
        "nuove-costruzioni",
        "costruzione-case",
        "costruzione-ville",
        "ampliamenti-edili",
        "sopraelevazioni",
      ],
    },
    {
      slug: "opere-murarie",
      name: "Opere murarie",
      serviceSlugs: [
        "opere-murarie",
        "demolizioni",
        "costruzione-tramezzi",
        "apertura-chiusura-vani",
        "riparazioni-muratura",
        "consolidamenti-murari",
        "intonaci",
        "rasature",
        "stuccature-murarie",
        "ripristino-muri",
      ],
    },
    {
      slug: "pavimenti",
      name: "Pavimenti e piastrelle",
      serviceSlugs: [
        "massetti",
        "sottofondi",
        "livellamento-pavimenti",
        "posa-pavimenti",
        "posa-rivestimenti",
        "posa-piastrelle",
      ],
    },
    {
      slug: "impermeabilizzazioni",
      name: "Impermeabilizzazioni",
      serviceSlugs: [
        "impermeabilizzazione-terrazzi",
        "impermeabilizzazione-balconi",
        "impermeabilizzazione-bagno",
        "impermeabilizzazione-piscine",
        "guaina-bituminosa",
      ],
    },
    {
      slug: "tetti-e-facciate",
      name: "Tetti e facciate",
      serviceSlugs: [
        "rifacimento-facciate",
        "ripristino-facciate",
        "intonaci-esterni",
        "isolamento-cappotto",
        "rifacimento-tetto",
        "riparazione-tetto",
        "coperture-edili",
        "lattoneria",
        "grondaie",
        "scossaline",
        "rifacimento-balconi",
        "rifacimento-terrazzi",
        "rifacimento-ballatoi",
        "ripristino-frontalini",
        "rifacimento-cornicioni",
        "ripristino-sottobalconi",
        "rifacimento-scale",
      ],
    },
    {
      slug: "piscine",
      name: "Piscine",
      serviceSlugs: [
        "costruzione-piscine",
        "ristrutturazione-piscine",
        "rivestimento-piscine",
      ],
    },
  ],

  imbianchino: [
    {
      slug: "tinteggiature",
      name: "Tinteggiature",
      serviceSlugs: [
        "tinteggiatura-pareti",
        "tinteggiatura-interni",
        "tinteggiatura-esterni",
      ],
    },
    {
      slug: "intonaci-e-rasature",
      name: "Intonaci e rasature",
      serviceSlugs: ["rasature", "stuccature-murarie"],
    },
  ],
} as const;

export function getServiceGroupsForCategory(
  categorySlug: string,
): readonly ServiceGroupDefinition[] {
  return serviceGroupsByCategorySlug[categorySlug] ?? [];
}

export type ServiceLike = {
  id: string;
  slug: string;
};

export type CategoryServiceGroup<T extends ServiceLike> = {
  groupSlug: string;
  groupName: string;
  services: T[];
};

/**
 * Raggruppa i Service di una Category secondo getServiceGroupsForCategory.
 * Ritorna un solo elemento (senza nome) se la Category non ha gruppi
 * dichiarati — chi consuma questa funzione tratta length <= 1 come "nessun
 * grouping visibile" (vedi Implementazione D, Phase 20.8/20.9).
 */
export function groupServicesByServiceGroup<T extends ServiceLike>(
  categorySlug: string,
  services: readonly T[],
): Array<CategoryServiceGroup<T>> {
  const groupDefinitions = getServiceGroupsForCategory(categorySlug);

  if (groupDefinitions.length === 0) {
    return [
      {
        groupSlug: categorySlug,
        groupName: "",
        services: [...services],
      },
    ];
  }

  const servicesBySlug = new Map(
    services.map((service) => [service.slug, service]),
  );

  return groupDefinitions.map((group) => ({
    groupSlug: group.slug,
    groupName: group.name,
    services: group.serviceSlugs.flatMap((serviceSlug) => {
      const service = servicesBySlug.get(serviceSlug);

      return service ? [service] : [];
    }),
  }));
}
