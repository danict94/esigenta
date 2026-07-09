import { toAbsoluteUrl } from "./site-url";

/**
 * Unico punto che emette JSON-LD (Fase 5). Solo schema derivati da dati
 * visibili in pagina: BreadcrumbList dal breadcrumb reale, FAQPage dalle FAQ
 * renderizzate. MAI rating, review, AggregateRating, offerte, disponibilità,
 * prezzi puntuali o LocalBusiness: se un futuro schema richiede dati che non
 * abbiamo, non si emette.
 */

export type BreadcrumbJsonLdItem = {
  name: string;
  /** Path relativo (es. "/servizi/ristrutturazioni"); l'URL assoluto è derivato qui. */
  path: string;
};

export function buildBreadcrumbJsonLd(
  items: readonly BreadcrumbJsonLdItem[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildFaqJsonLd(
  faq: readonly { question: string; answer: string }[],
): object | null {
  if (faq.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * Serializzazione per <script type="application/ld+json">: escape di "<"
 * come da guida Next (guides/json-ld) contro injection nel payload.
 */
export function serializeJsonLd(schema: object): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
