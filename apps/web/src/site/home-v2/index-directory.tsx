import Link from "next/link";
import type { CSSProperties } from "react";

import { listCostGuides } from "../seo/pages/costi";

import { cc, ccFont, ccType } from "./palette";
import { ArrowRightIcon } from "./icons";

export function IndexDirectory() {
  const guides = listCostGuides();

  if (guides.length === 0) {
    return null;
  }

  return (
    <section style={{ ...ccFont, backgroundColor: cc.paper }} className="py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-[1120px] px-5 sm:px-10 md:px-12 lg:px-16">
        <h2 className={`font-medium tracking-[-0.01em] ${ccType.heading}`} style={{ color: cc.ink }}>
          Guide ai costi
        </h2>

        <p className="mt-4 max-w-md text-[17px] leading-[1.5]" style={{ color: cc.inkSecondary }}>
          Prezzi indicativi, fattori che incidono sul preventivo e cosa
          valutare prima di richiedere un intervento.
        </p>

        <ul className="mt-10 border-t" style={{ borderColor: cc.hairline }}>
          {guides.map((guide) => (
            <li key={guide.slug} className="border-b" style={{ borderColor: cc.hairline }}>
              <Link
                href={guide.canonicalPath}
                className="group flex items-center justify-between gap-4 py-5 text-[16px] transition-colors"
                style={{ color: cc.ink }}
              >
                <span>{guide.h1}</span>
                <span
                  className="shrink-0 transition-[color,transform] group-hover:translate-x-1 group-hover:[color:var(--cc-accent)]"
                  style={{ color: cc.inkSecondary, "--cc-accent": cc.accent } as CSSProperties}
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/costi"
          className="mt-8 inline-block text-[14px]"
          style={{ color: cc.inkSecondary }}
        >
          Vedi tutte le guide
        </Link>
      </div>
    </section>
  );
}
