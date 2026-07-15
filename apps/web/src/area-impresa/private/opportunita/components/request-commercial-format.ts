/**
 * Pure presentation formatting for commercial (credit) fields — no
 * @esigenta/domain import, so client components (e.g. RequestListCard, which
 * needs usePathname for row-selection styling) can use it without dragging
 * server-only/Prisma code into the browser bundle. Domain semantics
 * (getRequestCommercialState) stay in request-commercial-display.ts for
 * server-only consumers.
 */
export function formatCreditCost(value: number | null) {
  return value === null ? "Costo non impostato" : `${value} crediti`;
}

export function formatUnlockAvailability(value: number | null) {
  return value === null ? "Disponibilità non impostata" : `${value} posti disponibili`;
}
