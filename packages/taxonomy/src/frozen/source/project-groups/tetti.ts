import type { FrozenProjectGroup } from "../types/project-group"

export const tetti: FrozenProjectGroup = {
  id: "tetti",
  slug: "tetti",
  name: "Tetti",
  interventions: [
    {
      id: "rifare-tetto",
      slug: "rifare-tetto",
      name: "Rifare tetto",
      aliases: [
        "rifacimento tetto",
        "sostituire il tetto",
        "ristrutturazione tetto",
        "nuovo tetto",
        "rifare copertura",
        "rifare copertura tetto",
        "rifacimento copertura",
        "sostituire copertura",
      ],
    },
    {
      id: "riparare-tetto",
      slug: "riparare-tetto",
      name: "Riparare tetto",
      // "ripasso tegole/tetto" NON è intervento separato: sta qui. Anche le
      // infiltrazioni vicino a comignolo/canna fumaria stanno qui (è acqua dal
      // tetto: faldali/scossaline/sigillature), NON un intervento canna-fumaria.
      aliases: [
        "infiltrazioni tetto",
        "perdita dal tetto",
        "riparazione tetto",
        "tetto che perde",
        "infiltrazioni acqua dal tetto",
        "tegole rotte",
        "coppi rotti",
        "tegole spostate",
        "sistemare tegole",
        "riparare tegole",
        "sostituire tegole rotte",
        "ripasso tetto",
        "ripasso tegole",
        "ripassare tetto",
        "infiltrazione da comignolo",
        "comignolo che perde",
        "scossalina camino",
        "infiltrazione canna fumaria",
      ],
    },
    {
      id: "sistemare-grondaie",
      slug: "sistemare-grondaie",
      name: "Sistemare grondaie",
      aliases: [
        "grondaie rotte",
        "lattoniere",
        "riparare grondaie",
        "grondaie",
        "lattoneria",
        "sostituire grondaie",
        "pulire grondaie",
        "pulizia grondaie",
        "grondaie che perdono",
        "pluviali",
        "riparare pluviali",
        "sostituire pluviali",
        "scossaline",
      ],
    },
    {
      id: "impermeabilizzare-tetto",
      slug: "impermeabilizzare-tetto",
      name: "Impermeabilizzare tetto",
      // Impermeabilizzazione/guaina/manto: distinto da rifare (strutturale) e
      // riparare (puntuale). Niente alias larghi (rifare/riparare/infiltrazioni
      // tetto restano ai loro interventi); niente terrazzo/balcone.
      aliases: [
        "impermeabilizzazione tetto",
        "impermeabilizzare il tetto",
        "rifare guaina tetto",
        "guaina tetto",
        "guaina bituminosa tetto",
        "tetto da impermeabilizzare",
        "impermeabilizzare copertura",
        "manto di copertura",
        "rifare manto di copertura",
      ],
    },
    {
      id: "isolare-o-coibentare-tetto",
      slug: "isolare-o-coibentare-tetto",
      name: "Isolare o coibentare tetto",
      // Isolamento/coibentazione/tetto ventilato/sottotetto. Distinto da rifare
      // e da impermeabilizzare; niente cappotto facciata/fotovoltaico.
      aliases: [
        "isolamento tetto",
        "coibentazione tetto",
        "coibentare tetto",
        "isolare tetto",
        "isolamento termico tetto",
        "tetto ventilato",
        "isolamento sottotetto",
        "coibentare sottotetto",
        "isolamento copertura",
        "coibentazione copertura",
      ],
    },
    {
      id: "bonificare-amianto-eternit-tetto",
      slug: "bonificare-amianto-eternit-tetto",
      name: "Bonificare tetto in amianto o eternit",
      // Intervento dedicato ma delicato: la bonifica dell'amianto va eseguita
      // solo da imprese abilitate (Albo Gestori Ambientali cat. 10, D.Lgs.
      // 81/2008). Il funnel raccoglie e instrada, non spiega né promette esiti.
      aliases: [
        "rimozione amianto tetto",
        "rimozione eternit tetto",
        "bonifica amianto tetto",
        "bonifica eternit",
        "smaltimento amianto tetto",
        "smaltimento eternit",
        "tetto in amianto",
        "tetto in eternit",
        "togliere eternit dal tetto",
        "incapsulamento amianto tetto",
        "sovracopertura amianto",
        "rifacimento tetto in amianto",
      ],
    },
    {
      id: "installare-o-sostituire-lucernario",
      slug: "installare-o-sostituire-lucernario",
      name: "Installare o sostituire lucernario",
      // Lucernario / finestra da tetto / Velux: installazione, sostituzione,
      // riparazione della finestra da tetto. "velux" (brand molto cercato) tenuto
      // come alias. Distinto da riparare-tetto (perdita dal tetto, non dal serramento).
      aliases: [
        "lucernario",
        "installare lucernario",
        "sostituire lucernario",
        "finestra da tetto",
        "installare finestra da tetto",
        "sostituire finestra da tetto",
        "velux",
        "installare velux",
        "sostituire velux",
        "cambiare lucernario",
        "nuovo lucernario",
        "lucernario tetto",
      ],
    },
    {
      id: "installare-linea-vita",
      slug: "installare-linea-vita",
      name: "Installare linea vita sul tetto",
      // Sistema anticaduta/ancoraggi per lavori in quota. Tecnico ma legato al
      // tetto. Prudenza: gli obblighi variano per edificio/intervento/territorio.
      // "installare linea vita" NON è alias (normalizzato == slug, già coperto).
      aliases: [
        "linea vita",
        "linea vita tetto",
        "linea vita obbligatoria",
        "sistema anticaduta tetto",
        "ancoraggi tetto",
        "dispositivo anticaduta tetto",
        "certificazione linea vita",
        "manutenzione linea vita",
        "revisione linea vita",
      ],
    },
  ],
}
