import Link from "next/link";

import { HomeImage } from "../home/home-image";

import { cc, ccFont, ccPhotoGrade, ccType } from "./palette";
import { ArrowRightIcon } from "./icons";

const professionalPhoto = {
  alt: "Professionista al lavoro su un cantiere",
  fallbackLabel: "Foto professionista al lavoro",
  src: "/assets/images/professionisti.webp",
};

// The one full-bleed beat on the page — no card, no container, no rounded
// corners. A deliberate pause between the busy module stack and the guides list.
export function Moment() {
  return (
    <section style={ccFont} className="relative">
      <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden md:h-[78vh]">
        <HomeImage
          src={professionalPhoto.src}
          alt={professionalPhoto.alt}
          sizes="100vw"
          fallbackLabel={professionalPhoto.fallbackLabel}
          className="absolute inset-0"
          imageClassName={`object-cover ${ccPhotoGrade}`}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(to top, rgba(23,21,17,0.78), rgba(23,21,17,0) 55%)" }}
        />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-12 sm:px-10 sm:pb-16 md:px-16 md:pb-20">
          <h2 className={`max-w-xl font-medium tracking-[-0.01em] ${ccType.heading}`} style={{ color: cc.paper }}>
            Richieste reali, nella tua zona
          </h2>

          <p className="mt-3 max-w-md text-[17px] leading-[1.5]" style={{ color: "rgba(250,248,244,0.8)" }}>
            Un profilo chiaro e categorie definite, per ricevere richieste che
            corrispondono davvero al tuo lavoro.
          </p>

          <Link
            href="/area-impresa"
            className="mt-7 inline-flex h-12 w-fit items-center justify-center gap-2 rounded-[8px] px-6 text-[15px] font-medium transition-colors"
            style={{ backgroundColor: cc.accent, color: cc.paper }}
          >
            Scopri l&apos;area professionisti
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
