import { ProEyebrow } from "./pro-primitives";

export function ProHero() {
  return (
    <section
      className="relative z-[2] mx-auto max-w-[900px] px-12 pb-[70px] pt-[150px] text-center max-[860px]:px-[22px] max-[860px]:pb-[50px] max-[860px]:pt-[130px]"
      aria-labelledby="business-title"
    >
      <ProEyebrow>Per professionisti e imprese</ProEyebrow>
      <h1 id="business-title" className="eg-h1 mx-auto mt-[22px] max-w-[16ch]">
        Il lavoro giusto
        <br />
        arriva <strong className="text-eg-brand-strong">gia organizzato.</strong>
      </h1>
      <p className="mx-auto mt-[22px] max-w-[46ch] text-[17px] leading-[1.55] text-eg-text-muted">
        Niente piu preventivi a vuoto o clienti che non richiamano. Ricevi
        richieste reali, verificate e nella tua zona. Paghi il contatto solo
        quando e davvero valido.
      </p>
    </section>
  );
}
