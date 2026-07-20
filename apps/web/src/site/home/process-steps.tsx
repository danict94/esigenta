import { useEffect, useRef, useState, type CSSProperties } from "react";

import { processSteps } from "../shared/process-steps";
import { SectionHeader } from "./section-header";

type TrackStyle = CSSProperties & Record<"--track-progress", string>;

export function ProcessSteps() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackProgress, setTrackProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    let frame = 0;

    function updateProgress() {
      const element = trackRef.current;

      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const anchor = window.innerHeight * 0.54;
      const raw = (anchor - rect.top) / Math.max(rect.height, 1);
      const nextProgress = Math.min(1, Math.max(0, raw));
      const nextActive = Math.min(
        processSteps.length - 1,
        Math.max(0, Math.floor(nextProgress * processSteps.length)),
      );

      setTrackProgress(Number(nextProgress.toFixed(3)));
      setActiveStepIndex(nextActive);
    }

    function scheduleUpdate() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateProgress);
    }

    frame = window.requestAnimationFrame(updateProgress);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <section
      id="processo"
      className="relative z-[1] py-[86px] min-[861px]:pb-[112px] min-[861px]:pt-[118px]"
      aria-labelledby="process-title"
    >
      <div className="eg-container-narrow">
        <SectionHeader
          eyebrow="Dal bisogno al lavoro"
          title="Un filo chiaro, dall'idea alla scelta."
          id="process-title"
          className="mb-[52px] min-[861px]:mb-[78px]"
        />

        <div
          ref={trackRef}
          className="relative before:absolute before:left-6 before:top-6 before:h-[calc(100%-48px)] before:w-px before:bg-eg-hairline before:content-[''] min-[861px]:before:left-1/2 min-[861px]:before:top-[29px] min-[861px]:before:h-[calc(100%-58px)] min-[861px]:before:-translate-x-1/2"
          style={{ "--track-progress": trackProgress.toString() } as TrackStyle}
        >
          <span
            className="absolute left-6 top-6 z-[1] h-[calc(100%-48px)] w-px origin-top bg-eg-terra transition-transform duration-[120ms] ease-linear [transform:scaleY(var(--track-progress))] min-[861px]:left-1/2 min-[861px]:top-[29px] min-[861px]:h-[calc(100%-58px)] min-[861px]:[transform:translateX(-50%)_scaleY(var(--track-progress))]"
            aria-hidden="true"
          />

          {processSteps.map((step, index) => {
            const isVerified = step.verified === true && activeStepIndex >= index;
            const state = index < activeStepIndex ? "past" : index === activeStepIndex ? "active" : "";

            return (
              <article
                key={step.title}
                className="relative z-[2] mb-9 grid grid-cols-[56px_minmax(0,1fr)] items-start gap-4 last:mb-0 min-[861px]:mb-[54px] min-[861px]:min-h-[190px] min-[861px]:grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] min-[861px]:gap-[22px]"
              >
                <span className="hidden min-[861px]:block" aria-hidden="true" />
                <StepMarker marker={step.marker} state={state} verified={isVerified} />
                <div className="col-start-2 max-w-none pt-0 min-[861px]:col-start-auto min-[861px]:max-w-[280px] min-[861px]:pt-1.5">
                  <h3 className="eg-h3">{step.title}</h3>
                  <p className="eg-body-muted mt-3">{step.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StepMarker({
  marker,
  state,
  verified,
}: {
  marker: string;
  state: string;
  verified: boolean;
}) {
  return (
    <span
      className={[
        "relative col-start-1 row-span-2 flex size-12 items-center justify-center justify-self-center rounded-full border border-eg-hairline bg-eg-terra font-(family-name:--eg-font-ui) text-sm font-medium tracking-[0.04em] text-eg-calce transition-[background-color,border-color,color,box-shadow] duration-[240ms] min-[861px]:col-start-auto min-[861px]:row-auto min-[861px]:size-[58px]",
        state === "active" ? "border-eg-cotto shadow-eg-elevation" : "",
        state === "past" ? "shadow-eg-elevation" : "",
        verified ? "border-eg-verde-conferma bg-eg-verde-conferma shadow-eg-elevation-lg" : "",
      ].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      {verified ? <span className="text-[17px] font-semibold leading-none text-eg-calce">&#10003;</span> : marker}
    </span>
  );
}
