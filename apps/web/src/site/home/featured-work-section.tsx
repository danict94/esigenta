import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { featuredWorks, type FeaturedWork } from "./home-content";
import { HomeImage } from "./home-image";
import { SectionHeader } from "./section-header";

const toneOverlayClass: Record<FeaturedWork["tone"], string> = {
  terra: "after:bg-eg-terra",
  cotto: "after:bg-eg-cotto",
  salvia: "after:bg-eg-salvia",
};

export function FeaturedWorkSection() {
  return (
    <section id="lavori" className="relative z-[1] pb-0 pt-[88px] min-[861px]:pt-32" aria-labelledby="works-title">
      <div className="eg-container-narrow mb-[52px] min-[861px]:mb-[78px]">
        <SectionHeader
          eyebrow="Lavori piu richiesti"
          title="Le richieste che partono piu spesso da casa."
          id="works-title"
        />
      </div>

      <div>
        {featuredWorks.map((work) => (
          <WorkRow key={work.idx} work={work} />
        ))}
      </div>

      <div className="border-t border-eg-hairline">
        <div className="eg-container-narrow flex flex-col items-center gap-2 py-10 text-center min-[861px]:flex-row min-[861px]:justify-between min-[861px]:gap-6 min-[861px]:py-8 min-[861px]:text-left">
          <p className="eg-body-muted">Non trovi il lavoro che ti serve tra questi?</p>
          <Link href="/servizi" prefetch={false} className="eg-action-link shrink-0">
            Scopri tutti i servizi <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function WorkRow({ work }: { work: FeaturedWork }) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.22 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className="relative z-[1] grid min-h-0 grid-cols-1 border-t border-eg-hairline bg-eg-calce last:border-b last:border-eg-hairline min-[861px]:min-h-[560px] min-[861px]:grid-cols-2"
    >
      <div
        className={[
          "relative isolate h-80 min-h-80 overflow-hidden after:absolute after:inset-0 after:z-[2] after:opacity-[0.18] after:mix-blend-multiply after:content-[''] min-[861px]:h-auto min-[861px]:min-h-[560px]",
          work.reverse ? "min-[861px]:order-2" : "",
          toneOverlayClass[work.tone],
        ].filter(Boolean).join(" ")}
      >
        <div
          className={[
            "absolute inset-0 z-[1] transition-transform duration-[1200ms] ease-[cubic-bezier(0.65,0,0.15,1)]",
            visible ? "scale-100" : "scale-[1.04]",
          ].join(" ")}
        >
          <HomeImage
            src={work.imageSrc}
            alt={work.imageAlt}
            fallbackLabel={work.fallbackLabel}
            sizes="(max-width: 860px) 100vw, 50vw"
            className="h-full w-full"
            imageClassName="object-cover [filter:saturate(0.96)_contrast(1.04)]"
          />
        </div>
        <div
          className={[
            "absolute inset-0 z-[3] origin-left bg-eg-terra transition-transform duration-[1100ms] ease-[cubic-bezier(0.65,0,0.15,1)]",
            visible ? "scale-x-0" : "scale-x-100",
          ].join(" ")}
          aria-hidden="true"
        />
      </div>

      <div className={["flex flex-col justify-center px-[26px] py-9 min-[861px]:px-16 min-[861px]:py-[72px]", work.reverse ? "min-[861px]:order-1" : ""].filter(Boolean).join(" ")}>
        <p className="eg-eyebrow">{work.idx}</p>
        <h3 className="mt-5 text-[clamp(26px,3vw,38px)] font-medium leading-[1.12] tracking-[-0.01em]">
          {work.title}
        </h3>
        <p className="eg-body-muted mt-5 max-w-[42ch]">{work.description}</p>
        <Link href={work.href} prefetch={false} className="eg-action-link mt-8">
          {work.cta} <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
