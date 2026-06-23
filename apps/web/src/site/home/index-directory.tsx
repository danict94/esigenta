import Link from "next/link";

import { listCostGuides } from "../seo/pages/costi";

import { cc, ccFont, ccType } from "../shell/palette";
import { ArrowRightIcon } from "../shell/icons";

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Pricing guides as a navigable index, not a magazine spread: a direct
// marketplace lead on the left, and a scannable list of guides with a
// functional preview snippet under each title on the right. White ground sits
// as a clean break between the two dark photographic sections that bracket it.
// No prices are shown here — the figure lives inside each guide, where it can
// be framed as indicative.
export function IndexDirectory() {
  const guides = listCostGuides();

  if (guides.length === 0) {
    return null;
  }

  return (
    <section style={{ ...ccFont, backgroundColor: "#FFFFFF" }} className="py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-[1120px] px-5 sm:px-10 md:px-12 lg:px-16">
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: cc.inkSecondary }}>
              Guide ai costi
            </p>

            <h2 className={`mt-4 font-medium tracking-[-0.01em] ${ccType.heading}`} style={{ color: cc.ink }}>
              Quanto costa, prima di chiederlo.
            </h2>

            <p className="mt-4 max-w-xs text-[16px] leading-[1.5]" style={{ color: cc.inkSecondary }}>
              Una stima realistica per orientarti, prima di richiedere un
              preventivo.
            </p>

            <Link
              href="/costi"
              prefetch={false}
              className="group mt-6 inline-flex items-center gap-2 text-[14px] font-medium"
              style={{ color: cc.accent }}
            >
              Vedi tutte le guide
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ul className="border-t md:col-span-7 md:col-start-6" style={{ borderColor: cc.hairline }}>
            {guides.map((guide) => (
              <li key={guide.slug} className="border-b" style={{ borderColor: cc.hairline }}>
                <Link
                  href={guide.canonicalPath}
                  prefetch={false}
                  className="group flex items-start justify-between gap-6 py-6"
                >
                  <div>
                    <h3 className="text-[16px] font-medium" style={{ color: cc.ink }}>
                      {capitalize(guide.topicLabel)}
                    </h3>

                    <p
                      className="mt-1 line-clamp-2 max-w-md text-[13px] leading-[1.5]"
                      style={{ color: cc.inkSecondary }}
                    >
                      {guide.summary}
                    </p>
                  </div>

                  <span className="mt-1 shrink-0" style={{ color: cc.accent }}>
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
