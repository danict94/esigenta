import type { CityLocalOverride } from "../types";

/**
 * Nessuna pagina città per questa guida (stesso pattern di tutte le altre
 * Cost Guide): nessun local override reale oggi, e le pagine città sono
 * comunque disabilitate globalmente (vedi engine/static-params.ts).
 */
export const rifarePavimentiLocalOverrides: readonly CityLocalOverride[] = [];
