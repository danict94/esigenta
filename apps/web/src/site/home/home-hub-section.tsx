import Link from "next/link";

import { homeHubs, type HomeHub } from "./home-content";
import { SectionHeader } from "./section-header";

const hubToneClass: Record<HomeHub["tone"], string> = {
  cotto: "hover:bg-eg-cotto",
  salvia: "hover:bg-eg-salvia",
  miele: "hover:bg-eg-miele",
  terra: "hover:bg-eg-terra",
};

export function HomeHubSection() {
  return (
    <section id="hub" className="eg-section-large bg-eg-calce-2" aria-labelledby="hub-title">
      <div className="eg-container">
        <SectionHeader
          eyebrow="Esplora per ambito"
          title="Sei Hub, un solo metodo."
          id="hub-title"
          className="text-left"
        />

        <div className="mt-[54px] grid grid-cols-2 gap-px overflow-hidden border border-eg-hairline bg-eg-hairline min-[861px]:grid-cols-3">
          {homeHubs.map((hub) => (
            <ServiceCard key={hub.title} hub={hub} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ hub }: { hub: HomeHub }) {
  return (
    <Link
      href={hub.href}
      prefetch={false}
      className={[
        "group relative min-h-[190px] overflow-hidden bg-eg-calce p-6 text-eg-terra no-underline transition-colors duration-[260ms] hover:text-eg-calce min-[861px]:min-h-[218px] min-[861px]:p-[30px]",
        hubToneClass[hub.tone],
      ].join(" ")}
    >
      <HubIcon name={hub.icon} />
      <h3 className="mt-[34px] text-lg font-medium tracking-[-0.01em] min-[861px]:mt-[42px] min-[861px]:text-xl">
        {hub.title}
      </h3>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-eg-ardesia transition-colors duration-[260ms] group-hover:text-eg-calce/70">
        {hub.meta}
      </p>
      <span
        className="absolute bottom-7 right-7 font-mono text-lg text-eg-cotto-dark transition-[color,transform] duration-[260ms] group-hover:translate-x-2 group-hover:text-eg-calce"
        aria-hidden="true"
      >
        &rarr;
      </span>
    </Link>
  );
}

function HubIcon({ name }: { name: HomeHub["icon"] }) {
  const common = {
    className: "h-[38px] w-[38px] transition-transform duration-[260ms] group-hover:-rotate-6 group-hover:scale-[1.08]",
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    focusable: false,
  } as const;

  if (name === "bath") {
    return (
      <svg {...common}>
        <path d="M11 25h26v5a9 9 0 0 1-9 9h-8a9 9 0 0 1-9-9v-5Z" stroke="currentColor" strokeWidth="2" />
        <path d="M15 25V13a5 5 0 0 1 5-5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 10h7v6h-7z" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "roof") {
    return (
      <svg {...common}>
        <path d="M8 24 24 10l16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 22v17h20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 39V28h8v11" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "bolt") {
    return (
      <svg {...common}>
        <path d="M27 5 12 27h11l-2 16 15-22H25l2-16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "sun") {
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.5 10.5l4.2 4.2M33.3 33.3l4.2 4.2M37.5 10.5l-4.2 4.2M14.7 33.3l-4.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "fan") {
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M24 21c-1-7 2-12 7-13 4 4 3 10-4 14M27 25c7-1 12 2 13 7-4 4-10 3-14-4M21 27c1 7-2 12-7 13-4-4-3-10 4-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M24 10v28M10 24h28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
