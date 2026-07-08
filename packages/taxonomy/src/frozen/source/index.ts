import { impresaEdile } from "./categories/impresa-edile"
import { idraulico } from "./categories/idraulico"
import { elettricista } from "./categories/elettricista"
import { cartongessista } from "./categories/cartongessista"
import { imbianchino } from "./categories/imbianchino"
import { installatoreFotovoltaico } from "./categories/installatore-fotovoltaico"
import { tecnicoClimatizzazione } from "./categories/tecnico-climatizzazione"
import { serramentista } from "./categories/serramentista"
import { fabbro } from "./categories/fabbro"
import { fumista } from "./categories/fumista"
import { giardiniere } from "./categories/giardiniere"
import { geometra } from "./categories/geometra"

import { ristrutturazioni } from "./project-groups/ristrutturazioni"
import { tetti } from "./project-groups/tetti"
import { citofoniSicurezzaESmartHome } from "./project-groups/citofoni-sicurezza-e-smart-home"
import { fotovoltaico } from "./project-groups/fotovoltaico"
import { facciateEBalconi } from "./project-groups/facciate-e-balconi"
import { pavimentazioni } from "./project-groups/pavimentazioni"
import { finiture } from "./project-groups/finiture"
import { cartongesso } from "./project-groups/cartongesso"
import { impiantiEManutenzioniElettriche } from "./project-groups/impianti-e-manutenzioni-elettriche"
import { idraulica } from "./project-groups/idraulica"
import { climatizzazione } from "./project-groups/climatizzazione"
import { opereMurarieEDemolizioni } from "./project-groups/opere-murarie-e-demolizioni"
import { serramentiEInfissi } from "./project-groups/serramenti-e-infissi"
import { riscaldamento } from "./project-groups/riscaldamento"
import { fabbroSerrandeECancelli } from "./project-groups/fabbro-serrande-e-cancelli"
import { caminiStufeECanneFumarie } from "./project-groups/camini-stufe-e-canne-fumarie"
import { esterniEGiardino } from "./project-groups/esterni-e-giardino"
import { tecniciEPraticheEdilizie } from "./project-groups/tecnici-e-pratiche-edilizie"
import { costruzioniEAmpliamenti } from "./project-groups/costruzioni-e-ampliamenti"

import type { FrozenTaxonomySource } from "./types/source"

export const frozenTaxonomySource: FrozenTaxonomySource = {
  categories: [
    impresaEdile,
    idraulico,
    elettricista,
    cartongessista,
    imbianchino,
    installatoreFotovoltaico,
    tecnicoClimatizzazione,
    serramentista,
    fabbro,
    fumista,
    giardiniere,
    geometra,
  ],

  projectGroups: [
    ristrutturazioni,
    tetti,
    fotovoltaico,
    facciateEBalconi,
    pavimentazioni,
    finiture,
    cartongesso,
    impiantiEManutenzioniElettriche,
    idraulica,
    climatizzazione,
    citofoniSicurezzaESmartHome,
    opereMurarieEDemolizioni,
    serramentiEInfissi,
    riscaldamento,
    fabbroSerrandeECancelli,
    caminiStufeECanneFumarie,
    esterniEGiardino,
    tecniciEPraticheEdilizie,
    costruzioniEAmpliamenti,
  ],
}

export type {
  FrozenCategory,
} from "./types/category"

export type {
  FrozenProjectGroup,
} from "./types/project-group"

export type {
  FrozenIntervention,
} from "./types/intervention"

export type {
  FrozenAlias,
} from "./types/alias"

export type {
  FrozenTaxonomySource,
} from "./types/source"
