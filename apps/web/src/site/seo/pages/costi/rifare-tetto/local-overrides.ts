import type { CityLocalOverride } from "../ristrutturare-bagno/local-overrides";

export type { CityLocalOverride };

/**
 * Nessuna pagina città per questa guida in Phase 20.1 (decisione esplicita:
 * non creare city pages nuove finché non c'è un local override reale, non
 * generico, per ogni città — vedi README site/seo). Il composer in content.ts
 * gestisce un array vuoto producendo cityPages/citySections vuoti, e
 * cost-page-template.tsx nasconde la sezione "Città" quando non ci sono pagine
 * indicizzabili.
 */
export const rifareTettoLocalOverrides: readonly CityLocalOverride[] = [];
