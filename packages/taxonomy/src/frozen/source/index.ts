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
import { opereMurarie } from "./project-groups/opere-murarie"
import { finiture } from "./project-groups/finiture"
import { cartongesso } from "./project-groups/cartongesso"
import { impiantiElettrici } from "./project-groups/impianti-elettrici"
import { impiantiIdraulici } from "./project-groups/impianti-idraulici"
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
    opereMurarie,
    finiture,
    cartongesso,
    impiantiElettrici,
    impiantiIdraulici,
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
