import type { TaxonomyService } from "../../shared/types";

export const impiantiServices: TaxonomyService[] = [
  // Idraulico
  {
    slug: "riparazione-perdite-acqua",
    name: "Riparazione perdite acqua",
  },

  {
    slug: "installazione-rubinetteria",
    name: "Installazione rubinetteria",
  },

  {
    slug: "sostituzione-tubi",
    name: "Sostituzione tubi",
  },

  {
    slug: "installazione-sanitari",
    name: "Installazione sanitari",
  },

  {
    slug: "impianto-idraulico",
    name: "Impianto idraulico",
  },

  // Elettricista

  {
    slug: "impianto-elettrico",
    name: "Impianto elettrico",
  },

  {
    slug: "riparazione-guasti-elettrici",
    name: "Riparazione guasti elettrici",
  },

  {
    slug: "prese-elettriche",
    name: "Prese elettriche",
  },

  {
    slug: "interruttori",
    name: "Interruttori",
  },

  {
    slug: "quadro-elettrico",
    name: "Quadro elettrico",
  },

  {
    slug: "illuminazione",
    name: "Illuminazione",
  },

  {
    slug: "lampadari",
    name: "Lampadari",
  },

  {
    slug: "citofoni",
    name: "Citofoni",
  },

  {
    slug: "videocitofoni",
    name: "Videocitofoni",
  },

  {
    slug: "salvavita",
    name: "Salvavita",
  },

  // Clima ed energia

  {
    slug: "impianti-fotovoltaici",
    name: "Impianti fotovoltaici",
    runtimePresetSlugs: ["QUICK_SERVICE"],
  },

  {
    slug: "climatizzatori",
    name: "Climatizzatori",
    runtimePresetSlugs: ["QUICK_SERVICE"],
  },

  // Sicurezza elettronica

  {
    slug: "installazione-antifurto",
    name: "Installazione antifurto",
  },

  {
    slug: "videosorveglianza",
    name: "Videosorveglianza",
  },

  {
    slug: "telecamere-sicurezza",
    name: "Telecamere di sicurezza",
  },

  {
    slug: "sensori-allarme",
    name: "Sensori allarme",
  },

  {
    slug: "controllo-accessi",
    name: "Controllo accessi",
  },

  {
    slug: "videoregistratori",
    name: "Videoregistratori",
  },
];
