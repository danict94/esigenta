import type { CityLocalOverride } from "../types";

/**
 * Nessuna pagina città per questa guida (stesso pattern di rifare-tetto e
 * impermeabilizzare-tetto): nessun local override reale oggi, e le pagine
 * città sono comunque disabilitate globalmente (vedi engine/static-params.ts).
 */
export const rifareImpiantoElettricoLocalOverrides: readonly CityLocalOverride[] = [];
