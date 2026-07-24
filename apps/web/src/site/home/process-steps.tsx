import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { processSteps } from "../shared/process-steps";
import { SectionHeader } from "./section-header";

type TrackStyle = CSSProperties & Record<"--track-progress" | "--line-length", string>;

export function ProcessSteps() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [trackProgress, setTrackProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  // Distanza reale, misurata a runtime, fra il centro del primo e
  // dell'ultimo marker: la linea non deve mai proseguire oltre l'ultimo
  // marker, e un calc() basato sull'altezza totale del track (che include
  // anche il testo sotto l'ultimo marker) non può garantirlo a contenuto
  // variabile.
  const [lineLength, setLineLength] = useState(0);

  useLayoutEffect(() => {
    function measureLine() {
      const first = markerRefs.current[0];
      const last = markerRefs.current[markerRefs.current.length - 1];

      if (!first || !last) {
        return;
      }

      const firstRect = first.getBoundingClientRect();
      const lastRect = last.getBoundingClientRect();
      const firstCenter = firstRect.top + firstRect.height / 2;
      const lastCenter = lastRect.top + lastRect.height / 2;

      setLineLength(lastCenter - firstCenter);
    }

    measureLine();
    window.addEventListener("resize", measureLine);

    return () => window.removeEventListener("resize", measureLine);
  }, []);

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
      className="relative z-[1] pt-[86px] pb-0 min-[861px]:pt-[118px]"
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
          className="relative before:absolute before:left-6 before:top-6 before:h-(--line-length) before:w-px before:bg-eg-border before:content-[''] min-[861px]:before:left-1/2 min-[861px]:before:top-[29px] min-[861px]:before:-translate-x-1/2"
          style={
            {
              "--track-progress": trackProgress.toString(),
              "--line-length": `${lineLength}px`,
            } as TrackStyle
          }
        >
          <span
            className="absolute left-6 top-6 z-[1] h-(--line-length) w-px origin-top bg-eg-brand transition-transform duration-[120ms] ease-linear [transform:scaleY(var(--track-progress))] min-[861px]:left-1/2 min-[861px]:top-[29px] min-[861px]:[transform:translateX(-50%)_scaleY(var(--track-progress))]"
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
                <StepMarker
                  marker={step.marker}
                  state={state}
                  verified={isVerified}
                  markerRef={(el) => {
                    markerRefs.current[index] = el;
                  }}
                />
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
  markerRef,
}: {
  marker: string;
  state: string;
  verified: boolean;
  markerRef: (el: HTMLSpanElement | null) => void;
}) {
  return (
    <span
      ref={markerRef}
      className={[
        "relative col-start-1 row-span-2 flex size-12 items-center justify-center justify-self-center rounded-full border font-(family-name:--eg-font-ui) text-sm font-medium tracking-[0.04em] transition-[background-color,border-color,color,box-shadow] duration-[240ms] min-[861px]:col-start-auto min-[861px]:row-auto min-[861px]:size-[58px]",
        state === "active" || state === "past" || verified
          ? "border-eg-brand bg-eg-brand text-eg-on-brand"
          : "border-eg-border bg-eg-surface text-eg-text-muted",
        state === "active" || state === "past" ? "shadow-eg-elevation" : "",
        verified ? "shadow-eg-elevation-lg" : "",
      ].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      {verified ? <span className="text-[17px] font-semibold leading-none text-eg-on-brand">&#10003;</span> : marker}
    </span>
  );
}
