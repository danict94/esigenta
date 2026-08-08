/**
 * Validatore unico e centralizzato per `lastModified` editoriale (formato
 * YYYY-MM-DD), usato da listSeoIndexablePaths() per SeoInterventionLanding,
 * CostGuide e SeoGroupLanding prima di passarlo alla sitemap. Nessuna
 * generazione di date qui dentro (mai `new Date()`, mai un fallback): solo
 * verifica che una data già dichiarata a mano sia una data di calendario
 * reale. Una data assente resta assente — non è un errore, è la normalità
 * per una pagina senza revisione editoriale registrata.
 *
 * Regola per aggiornare `lastModified` (vale ovunque il campo è dichiarato:
 * SeoInterventionLanding, CostGuideBaseContent, SeoGroupLanding):
 * aggiornalo quando cambia davvero contenuto principale, prezzi/range, FAQ
 * sostanziali, perimetro dell'intervento, structured data significativo o
 * link editoriali importanti. NON aggiornarlo per formattazione, CSS,
 * refactor, rename interni, build/deploy o typo minori.
 */

const EDITORIAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Ritorna `value` invariato se è una data di calendario reale in formato
 * YYYY-MM-DD, `undefined` se `value` è `undefined`. Lancia un errore
 * esplicito (mai un XML ambiguo) se `value` è presente ma malformato o non
 * è una data di calendario esistente (es. 2026-02-30). `context` identifica
 * la pagina nel messaggio d'errore.
 */
export function validateEditorialLastModified(
  value: string | undefined,
  context: string,
): string | undefined {
  if (value === undefined) return undefined;

  const match = EDITORIAL_DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error(
      `lastModified "${value}" su ${context} non è nel formato YYYY-MM-DD.`,
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const maxDay = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];

  if (month < 1 || month > 12 || !maxDay || day < 1 || day > maxDay) {
    throw new Error(
      `lastModified "${value}" su ${context} non è una data di calendario valida.`,
    );
  }

  return value;
}
