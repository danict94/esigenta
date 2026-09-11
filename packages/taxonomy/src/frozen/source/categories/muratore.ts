import type { FrozenCategory } from "../types/category"

export const muratore: FrozenCategory = {
  id: "muratore",
  slug: "muratore",
  name: "Muratore",
  shortDescription:
    "Esegue opere murarie, tramezzi, demolizioni interne e piccoli interventi edili.",
  aliases: ["muratori"],
  isPublic: true,
  projectGroups: ["opere-murarie-e-demolizioni"],
  interventionOverrides: {
    include: [
      "fare-massetto",
      "posare-o-rifare-pavimento-interno",
      "riparare-pavimento",
      "rifare-facciata",
      "ripristinare-balconi-e-ballatoi",
      "ripristino-frontalino",
    ],
  },
  onboardingDefaults: [
    "aprire-o-chiudere-vano",
    "costruire-parete-o-tramezzo",
    "demolire-parete-o-tramezzo",
    "demolizioni-interne",
    "piccole-opere-murarie",
    "fare-massetto",
  ],
}
