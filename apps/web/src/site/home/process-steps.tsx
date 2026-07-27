import { processSteps } from "../shared/process-steps";
import { Reveal } from "../shared/reveal";
import { blueprintEyebrowClassName, blueprintTitleClassName, SectionHeader } from "../shared/section-header";

export function ProcessSteps() {
  return (
    <section
      id="processo"
      className="relative z-[1] py-24 max-[600px]:py-16"
      aria-labelledby="process-title"
    >
      <div className="eg-container">
        <Reveal>
          <SectionHeader
            eyebrow="Dal bisogno al lavoro"
            title="Un filo chiaro, dall'idea alla scelta."
            id="process-title"
            className="max-w-[640px] text-left mb-14"
            eyebrowClassName={blueprintEyebrowClassName}
            titleClassName={blueprintTitleClassName}
          />
        </Reveal>

        <Reveal className="grid grid-cols-1 gap-px border border-eg-border bg-eg-border min-[861px]:grid-cols-3">
          {processSteps.map((step) => (
            <article
              key={step.title}
              className="relative bg-eg-page px-7.5 pt-9 pb-8.5 transition-[background-color,box-shadow] duration-250 ease-(--eg-ease-brand) hover:z-2 hover:bg-eg-surface hover:shadow-eg-step"
            >
              <span className="mb-4.5 block font-(family-name:--eg-font-brand) text-[13px] font-bold text-eg-accent">
                {step.verified ? "OK" : step.marker.padStart(2, "0")}
              </span>
              <h3 className="eg-h3 mb-2.5 text-[17px] font-semibold">{step.title}</h3>
              <p className="eg-body-muted text-[14.5px] leading-[1.55]">{step.description}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
