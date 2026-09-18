import type { CostGuideTocItem } from "../editorial/cost-guide-toc";

export function CostGuideToc({ sections }: { sections: readonly CostGuideTocItem[] }) {
  if (sections.length === 0) return null;

  return (
    <nav aria-label="Indice della guida" className="eg-container">
      <p className="text-[12px] font-semibold text-eg-ink">In questa guida</p>
      <ol className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="inline-flex items-center text-[12.5px] font-semibold text-eg-text-muted underline decoration-eg-border underline-offset-4 transition-colors hover:text-eg-brand-strong hover:decoration-eg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eg-brand-hover"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
