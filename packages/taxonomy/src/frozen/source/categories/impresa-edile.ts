import type { FrozenCategory } from "../types/category"

export const impresaEdile: FrozenCategory = {
  id: "impresa-edile",
  slug: "impresa-edile",
  name: "Impresa edile",
  shortDescription:
    "Si occupa di ristrutturazioni, facciate, pavimenti, tetti, opere murarie, demolizioni e nuove costruzioni.",
  aliases: ["impresa di costruzioni", "ditta edile"],
  projectGroups: ["ristrutturazioni", "facciate-e-balconi", "pavimentazioni", "tetti", "opere-murarie-e-demolizioni", "costruzioni-e-ampliamenti"],
  onboardingDefaults: [
    "ristrutturare-appartamento",
    "ristrutturare-bagno",
    "ristrutturare-casa",
    "ristrutturare-cucina",
    "aprire-o-chiudere-vano",
    "costruire-parete-o-tramezzo",
    "demolire-parete-o-tramezzo",
    "demolizioni-interne",
    "piccole-opere-murarie",
    "fare-massetto",
    "posare-o-rifare-pavimento-interno",
    "riparare-pavimento",
    "rifare-facciata",
    "ripristinare-balconi-e-ballatoi",
    "ripristino-frontalino",
  ],
}
