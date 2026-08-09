import type { CityLocalOverride } from "../types";

/**
 * Nessuna pagina città per questa guida (stesso pattern di rifare-tetto e
 * ristrutturare-bagno): nessun local override reale oggi, e le pagine città
 * sono comunque disabilitate globalmente (vedi engine/static-params.ts).
 */
export const rifareFacciataLocalOverrides: readonly CityLocalOverride[] = [];
