/**
 * Esigenta — Admin: conferma testuale per "Elimina dati funnel" (FASE 9G)
 *
 * FOUNDATION — PURE, NO DB ACCESS, NO REACT
 *
 * Isola la SOLA regola "il pulsante finale si abilita solo se il testo
 * digitato corrisponde esattamente alla frase di conferma" dal componente
 * client (delete-funnel-data-button.tsx), così è testabile senza montare
 * React né toccare Prisma — stesso principio delle altre funzioni pure di
 * questo pacchetto (vedi packages/domain/.../funnel-session-status-policy.ts).
 */

export const DELETE_FUNNEL_DATA_CONFIRM_PHRASE = "ELIMINA DATI FUNNEL"

/**
 * Confronto ESATTO (case-sensitive), dopo un solo trim degli spazi
 * accidentali a inizio/fine — mai una corrispondenza parziale, mai
 * case-insensitive: la frase è volutamente scomoda da digitare per
 * errore, non un semplice "sì/no".
 */
export function isFunnelDataDeletionConfirmed(inputText: string): boolean {
  return inputText.trim() === DELETE_FUNNEL_DATA_CONFIRM_PHRASE
}
