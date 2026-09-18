import type { ResolvedCostGuideEditorial } from "../editorial/cost-guide-editorial";

function formatEditorialDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const months = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
  ];
  const monthName = month ? months[month - 1] : undefined;

  return year && day && monthName ? `${day} ${monthName} ${year}` : value;
}

export function CostGuideEditorialMeta({ editorial }: { editorial: ResolvedCostGuideEditorial }) {
  return (
    <div className="max-w-[56rem] py-3 text-[12.5px] leading-[1.55] text-eg-text-muted">
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        <p><span className="font-semibold text-eg-ink">Autore:</span> {editorial.author.name} — {editorial.author.affiliation}</p>
        <p><span className="font-semibold text-eg-ink">Editore:</span> {editorial.publisher.name}</p>
        {editorial.datePublished || editorial.dateModified ? (
          <p>
            {editorial.datePublished ? (
              <time dateTime={editorial.datePublished}>Pubblicato il {formatEditorialDate(editorial.datePublished)}</time>
            ) : null}
            {editorial.datePublished && editorial.dateModified ? <span aria-hidden="true"> · </span> : null}
            {editorial.dateModified ? (
              <time dateTime={editorial.dateModified}>Aggiornato il {formatEditorialDate(editorial.dateModified)}</time>
            ) : null}
          </p>
        ) : null}
      </div>
      <p className="mt-2 max-w-[68ch]">Metodologia e fonti: {editorial.methodology}</p>
    </div>
  );
}
