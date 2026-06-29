import { impresaEdile } from "./categories/impresa-edile"
import { idraulico } from "./categories/idraulico"
import { elettricista } from "./categories/elettricista"
import { cartongessista } from "./categories/cartongessista"
import { imbianchino } from "./categories/imbianchino"
import { installatoreFotovoltaico } from "./categories/installatore-fotovoltaico"
import { tecnicoClimatizzazione } from "./categories/tecnico-climatizzazione"

import { ristrutturazioni } from "./project-groups/ristrutturazioni"
import { tetti } from "./project-groups/tetti"
import { fotovoltaico } from "./project-groups/fotovoltaico"
import { facciateEBalconi } from "./project-groups/facciate-e-balconi"
import { pavimentazioni } from "./project-groups/pavimentazioni"
import { finiture } from "./project-groups/finiture"
import { cartongesso } from "./project-groups/cartongesso"
import { impiantiEManutenzioniElettriche } from "./project-groups/impianti-e-manutenzioni-elettriche"
import { idraulica } from "./project-groups/idraulica"
import { climatizzazione } from "./project-groups/climatizzazione"

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
