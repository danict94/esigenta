import { caminiStufeCanneFumarieGroupLanding } from "./camini-stufe-e-canne-fumarie/content";
import { cartongessoGroupLanding } from "./cartongesso/content";
import { citofoniSicurezzaSmartHomeGroupLanding } from "./citofoni-sicurezza-e-smart-home/content";
import { climatizzazioneGroupLanding } from "./climatizzazione/content";
import { costruzioniAmpliamentiGroupLanding } from "./costruzioni-e-ampliamenti/content";
import { esterniGiardinoGroupLanding } from "./esterni-e-giardino/content";
import { fabbroSerrandeCancelliGroupLanding } from "./fabbro-serrande-e-cancelli/content";
import { facciateBalconiGroupLanding } from "./facciate-e-balconi/content";
import { finitureGroupLanding } from "./finiture/content";
import { fotovoltaicoGroupLanding } from "./fotovoltaico/content";
import { idraulicaGroupLanding } from "./idraulica/content";
import { impiantiManutenzioniElettricheGroupLanding } from "./impianti-e-manutenzioni-elettriche/content";
import { opereMurarieDemolizioniGroupLanding } from "./opere-murarie-e-demolizioni/content";
import { pavimentazioniGroupLanding } from "./pavimentazioni/content";
import { piscineGroupLanding } from "./piscine/content";
import { riscaldamentoGroupLanding } from "./riscaldamento/content";
import { ristrutturazioniGroupLanding } from "./ristrutturazioni/content";
import { serramentiInfissiGroupLanding } from "./serramenti-e-infissi/content";
import { tecniciPraticheEdilizieGroupLanding } from "./tecnici-e-pratiche-edilizie/content";
import { tettiGroupLanding } from "./tetti/content";
import type { SeoGroupLanding } from "./types";

export type { SeoGroupLanding } from "./types";

// Registry only: un gruppo entra qui solo quando la sua landing è pronta
// editorialmente. Tutto il resto (route, sitemap, hub /servizi) deriva da
// questo array — mai abilitare gruppi altrove. Fase 6: tutti i 20 gruppi
// della frozen taxonomy sono registrati.
const all: readonly SeoGroupLanding[] = [
  caminiStufeCanneFumarieGroupLanding,
  cartongessoGroupLanding,
  citofoniSicurezzaSmartHomeGroupLanding,
  climatizzazioneGroupLanding,
  costruzioniAmpliamentiGroupLanding,
  esterniGiardinoGroupLanding,
  fabbroSerrandeCancelliGroupLanding,
  facciateBalconiGroupLanding,
  finitureGroupLanding,
  fotovoltaicoGroupLanding,
  idraulicaGroupLanding,
  impiantiManutenzioniElettricheGroupLanding,
  opereMurarieDemolizioniGroupLanding,
  pavimentazioniGroupLanding,
  piscineGroupLanding,
  riscaldamentoGroupLanding,
  ristrutturazioniGroupLanding,
  serramentiInfissiGroupLanding,
  tecniciPraticheEdilizieGroupLanding,
  tettiGroupLanding,
];

const bySlug: ReadonlyMap<string, SeoGroupLanding> = new Map(
  all.map((landing) => [landing.slug, landing]),
);

export function listSeoGroupLandings(): readonly SeoGroupLanding[] {
  return all;
}

export function getSeoGroupLandingBySlug(
  slug: string,
): SeoGroupLanding | null {
  return bySlug.get(slug) ?? null;
}
