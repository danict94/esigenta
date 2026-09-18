import type { TechnicalReference } from "../editorial/cost-guide-editorial";

export function CostGuideTechnicalReferences({ references }: { references?: readonly TechnicalReference[] }) {
  if (!references || references.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 text-[16px] font-semibold text-eg-ink">Riferimenti tecnici</h3>
      <ul className="max-w-190 border-t border-eg-border">
        {references.map((reference) => (
          <li key={reference.label} className="grid gap-1 border-b border-eg-border py-4 text-[14px] leading-normal text-eg-ink sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-eg-text-muted">{reference.type}</span>
            {reference.href ? (
              <a
                href={reference.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-eg-brand-strong underline decoration-eg-border underline-offset-4 transition-colors hover:text-eg-brand-hover"
              >
                {reference.label}
                <span className="sr-only"> (apre in una nuova scheda)</span>
              </a>
            ) : (
              <span className="font-semibold">{reference.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
