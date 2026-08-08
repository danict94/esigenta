import type { CityLocalOverride } from "../types";

/**
 * Nessuna pagina città per questa guida (stesso principio di rifare-tetto:
 * niente city page senza un local override reale, non generico, per ogni
 * città — vedi README site/seo). Il composer in content.ts gestisce un
 * array vuoto producendo cityPages/citySections vuoti, e cost-page-template
 * nasconde la sezione "Città" quando non ci sono pagine indicizzabili.
 */
export const impermeabilizzareTerrazzoLocalOverrides: readonly CityLocalOverride[] = [];
