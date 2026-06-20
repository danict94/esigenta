import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container, tokens } from "@esigenta/ui";

import { HomeImage } from "./home-image";

const professionalAreaHref = "/area-impresa";
const phoneMockupSrc = "/assets/images/area-professionista.webp";

export function ProfessionalCta() {
  return (
    <section className={tokens.home.professionalCta.root}>
      <Container size="lg" gutter="md">
        <div className={tokens.home.professionalCta.layout}>
          <div className={tokens.home.professionalCta.copy}>
            <h2 className={tokens.home.professionalCta.title}>
              La tua attività,
              <br />
              davanti ai clienti giusti
            </h2>

            <div
              className={tokens.home.professionalCta.accentLine}
              aria-hidden={true}
            />

            <p className={tokens.home.professionalCta.subtitle}>
              Un profilo chiaro, richieste locali e più controllo su come
              ricevere nuove opportunità.
            </p>

            <Link
              href={professionalAreaHref}
              className={`group ${tokens.home.professionalCta.cta}`}
            >
              <span>Scopri l'area professionisti</span>
              <span
                className={tokens.home.professionalCta.ctaIcon}
                aria-hidden={true}
              >
                <ArrowRight className={tokens.home.professionalCta.ctaArrow} />
              </span>
            </Link>
          </div>

          <div
            className={tokens.home.professionalCta.visual}
            aria-hidden={true}
          >
            <HomeImage
              src={phoneMockupSrc}
              decorative
              sizes="(min-width: 1024px) 26rem, (min-width: 768px) 24rem, 17rem"
              fallbackLabel="Anteprima area professionisti"
              className={tokens.home.professionalCta.phone}
              imageClassName={tokens.home.professionalCta.phoneImage}
              priority={false}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
