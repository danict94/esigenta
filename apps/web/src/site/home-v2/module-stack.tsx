import Link from "next/link";

import { HomeImage } from "../home/home-image";

import { getHomeSystems } from "./systems";
import { cc, ccFont, ccPhotoGrade, ccType } from "./palette";
import { Reveal } from "./reveal";

const trustTags = [
  "Professionista verificato",
  "I tuoi dati restano tuoi",
  "Gratuito, senza impegno",
] as const;

function Tag({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-[6px] px-3 py-1.5 text-[13px]"
      style={{ backgroundColor: cc.accentTint, color: cc.accentHover }}
    >
      {label}
    </span>
  );
}

function Photo({ src, alt, aspect, sizes }: { src: string; alt: string; aspect: string; sizes: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[20px] ${aspect}`}>
      <HomeImage
        src={src}
        alt={alt}
        sizes={sizes}
        fallbackLabel={`Foto ${alt}`}
        className="absolute inset-0"
        imageClassName={ccPhotoGrade}
      />
    </div>
  );
}

export function ModuleStack() {
  const systems = getHomeSystems();

  if (systems.length === 0) {
    return null;
  }

  const [first, second, third, fourth, fifth] = systems;

  return (
    <section style={{ ...ccFont, backgroundColor: cc.paper }} className="py-20 md:py-28 lg:py-36">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-10 md:px-12 lg:px-16">
        <h2 className={`max-w-md font-medium tracking-[-0.01em] ${ccType.heading}`} style={{ color: cc.ink }}>
          Ogni mestiere, scomposto e affidato a chi sa farlo.
        </h2>

        {first ? (
          <Reveal>
            <div className="mt-16 grid items-center gap-8 md:grid-cols-12 md:gap-10">
              <div className="order-2 md:order-1 md:col-span-5">
                <Tag label={trustTags[0]} />

                <h3 className="mt-5 text-[22px] font-medium" style={{ color: cc.ink }}>
                  {first.title}
                </h3>

                <p className="mt-3 max-w-sm text-[16px] leading-[1.6]" style={{ color: cc.inkSecondary }}>
                  Controlliamo i dati dell&apos;attività prima che possa rispondere alla tua richiesta.
                </p>

                <Link href={first.href} className="mt-5 inline-block text-[14px] font-medium" style={{ color: cc.accent }}>
                  Vedi i professionisti →
                </Link>
              </div>

              <div className="order-1 md:order-2 md:col-span-7">
                <Photo
                  src={first.image}
                  alt={first.title}
                  aspect="aspect-[16/11]"
                  sizes="(min-width: 768px) 58vw, 100vw"
                />
              </div>
            </div>
          </Reveal>
        ) : null}

        {second ? (
          <Reveal>
            <div className="mt-20 grid items-center gap-8 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-7">
                <Photo
                  src={second.image}
                  alt={second.title}
                  aspect="aspect-[16/11]"
                  sizes="(min-width: 768px) 58vw, 100vw"
                />
              </div>

              <div className="md:col-span-5">
                <Tag label={trustTags[1]} />

                <h3 className="mt-5 text-[22px] font-medium" style={{ color: cc.ink }}>
                  {second.title}
                </h3>

                <p className="mt-3 max-w-sm text-[16px] leading-[1.6]" style={{ color: cc.inkSecondary }}>
                  Il tuo contatto viene condiviso solo con i professionisti a cui scegli di rispondere.
                </p>

                <Link href={second.href} className="mt-5 inline-block text-[14px] font-medium" style={{ color: cc.accent }}>
                  Vedi i professionisti →
                </Link>
              </div>
            </div>
          </Reveal>
        ) : null}

        {third ? (
          <Reveal>
            <div className="mt-20 grid gap-8 md:grid-cols-12 md:gap-10">
              <div className="order-2 md:order-1 md:col-span-8">
                <Tag label={trustTags[2]} />

                <h3
                  className={`mt-5 max-w-md font-medium leading-[1.2] ${ccType.heading}`}
                  style={{ color: cc.ink }}
                >
                  {third.title}
                </h3>

                <Link href={third.href} className="mt-5 inline-block text-[14px] font-medium" style={{ color: cc.accent }}>
                  Vedi i professionisti →
                </Link>
              </div>

              <div className="order-1 md:order-2 md:col-span-4">
                <Photo src={third.image} alt={third.title} aspect="aspect-square" sizes="(min-width: 768px) 28vw, 100vw" />
              </div>
            </div>
          </Reveal>
        ) : null}

        {fourth ? (
          <Reveal>
            <Link href={fourth.href} className="group mt-20 block">
              <div className="relative aspect-[21/9] overflow-hidden rounded-[20px]">
                <HomeImage
                  src={fourth.image}
                  alt={fourth.title}
                  sizes="100vw"
                  fallbackLabel={`Foto ${fourth.title}`}
                  className="absolute inset-0"
                  imageClassName={`transition-transform duration-500 group-hover:scale-[1.03] ${ccPhotoGrade}`}
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ backgroundImage: "linear-gradient(to right, rgba(23,21,17,0.55), rgba(23,21,17,0) 60%)" }}
                />

                <h3
                  className={`absolute bottom-6 left-6 max-w-sm font-medium ${ccType.heading}`}
                  style={{ color: cc.paper }}
                >
                  {fourth.title}
                </h3>
              </div>
            </Link>
          </Reveal>
        ) : null}

        {fifth ? (
          <Reveal>
            <div className="mt-12 flex items-center gap-6">
              <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-[14px] sm:w-32">
                <HomeImage
                  src={fifth.image}
                  alt={fifth.title}
                  sizes="128px"
                  fallbackLabel={`Foto ${fifth.title}`}
                  className="absolute inset-0"
                  imageClassName={ccPhotoGrade}
                />
              </div>

              <div>
                <h3 className="text-[17px] font-medium" style={{ color: cc.ink }}>
                  {fifth.title}
                </h3>

                <Link href={fifth.href} className="mt-1 inline-block text-[14px]" style={{ color: cc.inkSecondary }}>
                  Vedi i professionisti →
                </Link>
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
