import { ediliziaCategories } from "./categories/edilizia";
import { impiantiCategories } from "./categories/impianti";

import { idraulicaDomains } from "./domains/idraulica";
import { ristrutturazioneDomains } from "./domains/ristrutturazione";
import { costruzioneDomains } from "./domains/costruzione";
import { muraturaDomains } from "./domains/muratura";
import { pavimentiDomains } from "./domains/pavimenti";
import { impermeabilizzazioniDomains } from "./domains/impermeabilizzazioni";
import { facciateDomains } from "./domains/facciate";
import { tettiDomains } from "./domains/tetti";

import { elettricistaInterventions } from "./interventions/impianti/elettricista";
import { sicurezzaInterventions } from "./interventions/impianti/sicurezza";
import { bagnoInterventions } from "./interventions/edilizia/bagno";
import { cartongessoInterventions } from "./interventions/edilizia/cartongesso";
import { idraulicaInterventions } from "./interventions/impianti/idraulica";
import { ristrutturazioniInterventions } from "./interventions/edilizia/ristrutturazioni";
import { nuoveCostruzioniInterventions } from "./interventions/edilizia/nuove-costruzioni";
import { opereMurarieInterventions } from "./interventions/edilizia/opere-murarie";
import { pavimentiInterventions } from "./interventions/edilizia/pavimenti";
import { intonaciRasatureInterventions } from "./interventions/edilizia/intonaci-rasature";
import { impermeabilizzazioniInterventions } from "./interventions/edilizia/impermeabilizzazioni";
import { facciateInterventions } from "./interventions/edilizia/facciate";
import { tettiInterventions } from "./interventions/edilizia/tetti";
import { balconiTerrazziInterventions } from "./interventions/edilizia/balconi-terrazzi";
import { piscineInterventions } from "./interventions/edilizia/piscine";
import { tinteggiatureInterventions } from "./interventions/edilizia/tinteggiature";

import { ediliziaServices } from "./services/edilizia";
import { impiantiServices } from "./services/impianti";

import type { TaxonomySource } from "../shared/types";

const taxonomyRegistry = {
  sectors: [
    {
      slug: "edilizia",
      name: "Edilizia",
    },

    {
      slug: "impianti",
      name: "Impianti",
    },
  ],

  services: [ediliziaServices, impiantiServices],

  interventions: [
    bagnoInterventions,
    cartongessoInterventions,
    idraulicaInterventions,
    ristrutturazioniInterventions,
    nuoveCostruzioniInterventions,
    opereMurarieInterventions,
    pavimentiInterventions,
    intonaciRasatureInterventions,
    impermeabilizzazioniInterventions,
    facciateInterventions,
    tettiInterventions,
    balconiTerrazziInterventions,
    piscineInterventions,
    tinteggiatureInterventions,
    elettricistaInterventions,
    sicurezzaInterventions,
  ],

  categories: [ediliziaCategories, impiantiCategories],

  domains: [
    ristrutturazioneDomains,
    idraulicaDomains,
    costruzioneDomains,
    muraturaDomains,
    pavimentiDomains,
    impermeabilizzazioniDomains,
    facciateDomains,
    tettiDomains,
  ],
};

export const taxonomySource: TaxonomySource = {
  sectors: taxonomyRegistry.sectors,

  services: taxonomyRegistry.services.flat(),

  interventions: taxonomyRegistry.interventions.flat(),

  categories: taxonomyRegistry.categories.flat(),

  domains: taxonomyRegistry.domains.flat(),
};
