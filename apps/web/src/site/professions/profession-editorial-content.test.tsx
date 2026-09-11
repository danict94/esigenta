import assert from "node:assert/strict";
import test from "node:test";

import { getProfessionEditorialContent } from "./profession-editorial-content";

test("a known profession without editorial content resolves to null", () => {
  assert.equal(getProfessionEditorialContent("imbianchino"), null);
});

test("elettricista resolves the approved three-level hero copy and local asset", () => {
  const content = getProfessionEditorialContent("elettricista");

  assert.deepEqual(content?.intro, {
    lead:
      "Un elettricista si occupa dell’installazione, della manutenzione e della riparazione degli impianti elettrici negli edifici.",
    paragraphs: [
      "Può realizzare o modificare un impianto, individuare guasti e malfunzionamenti, installare punti luce e prese oppure integrare citofoni, sistemi di sicurezza e soluzioni per la smart home.",
    ],
    note:
      "Per i lavori sugli impianti elettrici è importante rivolgersi a un professionista qualificato e, quando previsto, a un’impresa abilitata. Su Esigenta puoi individuare l’intervento di cui hai bisogno, approfondirne caratteristiche e costi quando è disponibile una guida dedicata e richiedere preventivi per confrontare le soluzioni più adatte.",
  });
  assert.deepEqual(content?.hero, {
    src: "/assets/images/impianto-elettrico.webp",
    alt: "Intervento su impianto elettrico domestico",
  });
  assert.deepEqual(content?.seo, {
    title: "Trova un elettricista e confronta preventivi | Esigenta",
    description:
      "Trova un elettricista per i lavori di casa, consulta la tariffa oraria indicativa e richiedi preventivi per confrontare le soluzioni disponibili.",
  });
  assert.deepEqual(content?.closingSections, [
    {
      kind: "when-to-contact",
      heading: "Quando rivolgersi a un elettricista",
      paragraphs: [
        "Puoi rivolgerti a un elettricista quando devi realizzare o modificare un impianto, individuare un guasto, aggiungere prese o punti luce oppure installare citofoni, sistemi di sicurezza e soluzioni per la smart home.",
      ],
    },
    {
      kind: "how-to-choose",
      heading: "Come scegliere un elettricista",
      items: [
        "Verifica l’abilitazione quando è prevista per il tipo di intervento.",
        "Confronta cosa comprende il preventivo e quali lavorazioni restano escluse.",
        "Chiarisci materiali, tempi di esecuzione e documentazione prevista.",
      ],
    },
  ]);
});

test("only elettricista exposes the approved profession pricing", () => {
  const pricing = getProfessionEditorialContent("elettricista")?.pricing;

  assert.deepEqual(pricing, {
    heading: "Quanto costa un elettricista?",
    rows: [
      {
        label: "Tariffa oraria indicativa",
        value: "25–50 €",
        unit: "all’ora",
      },
    ],
    context: "Tariffa indicativa per interventi ordinari",
    factors: [
      "Zona",
      "Complessità",
      "Durata",
      "Materiali",
      "Eventuale uscita",
    ],
    disclaimer:
      "Valore orientativo di mercato. IVA e condizioni dipendono dal preventivo.",
    lastReviewed: "settembre 2026",
  });

  assert.equal(getProfessionEditorialContent("imbianchino")?.pricing, undefined);
});

test("idraulico resolves the approved SEO, hero copy and closing sections without pricing or image", () => {
  const content = getProfessionEditorialContent("idraulico");

  assert.deepEqual(content?.seo, {
    title: "Trova un idraulico e confronta preventivi | Esigenta",
    description:
      "Trova un idraulico per i lavori di casa, scegli tra interventi di idraulica e riscaldamento e richiedi preventivi per confrontare le soluzioni disponibili.",
  });
  assert.deepEqual(content?.intro, {
    lead:
      "Un idraulico si occupa dell’installazione, della manutenzione e della riparazione degli impianti idrici e sanitari negli edifici.",
    paragraphs: [
      "Interviene su tubazioni, perdite, scarichi, sanitari e punti acqua. In base alle competenze e alle abilitazioni richieste, può occuparsi anche di impianti di riscaldamento e produzione di acqua calda.",
    ],
    note:
      "Per i lavori per cui è richiesta un’abilitazione ai sensi del D.M. 37/2008, è importante verificare che l’impresa sia abilitata per la specifica tipologia di impianto. Su Esigenta puoi scegliere l’intervento di cui hai bisogno e richiedere preventivi da confrontare.",
  });
  assert.deepEqual(content?.closingSections, [
    {
      kind: "when-to-contact",
      heading: "Quando rivolgersi a un idraulico",
      paragraphs: [
        "Puoi rivolgerti a un idraulico quando devi realizzare o modificare un impianto idrico, risolvere perdite o scarichi ostruiti, sostituire sanitari e punti acqua. Per caldaie e altri impianti di riscaldamento, verifica che il professionista o l’impresa disponga delle abilitazioni richieste per il lavoro.",
      ],
    },
    {
      kind: "how-to-choose",
      heading: "Come scegliere un idraulico",
      items: [
        {
          title: "Verifica le abilitazioni",
          description:
            "Per i lavori regolamentati, controlla che l’impresa sia abilitata per la specifica tipologia di impianto.",
        },
        {
          title: "Confronta il preventivo",
          description:
            "Verifica che siano indicate le lavorazioni, i materiali e gli eventuali costi accessori.",
        },
        {
          title: "Chiarisci tempi e documentazione",
          description:
            "Prima dei lavori, chiedi i tempi previsti e quale documentazione verrà rilasciata quando richiesta.",
        },
      ],
    },
  ]);
  assert.equal(content?.pricing, undefined);
  assert.equal(content?.hero, undefined);
});

test("impresa edile resolves the approved editorial page without pricing or FAQ", () => {
  const content = getProfessionEditorialContent("impresa-edile");

  assert.deepEqual(content?.seo, {
    title: "Trova un'impresa edile e confronta preventivi | Esigenta",
    description:
      "Trova un'impresa edile per lavori e ristrutturazioni, scegli l'intervento che ti serve e richiedi preventivi per confrontare le proposte disponibili.",
  });
  assert.deepEqual(content?.hero, {
    src: "/assets/images/professionisti-hero.webp",
    alt: "Impresa edile al lavoro su un edificio",
  });
  assert.deepEqual(content?.intro, {
    lead:
      "Un’impresa edile si occupa di lavori di costruzione, manutenzione e ristrutturazione degli edifici.",
    paragraphs: [
      "Può eseguire opere murarie, ristrutturazioni, interventi su facciate e balconi, pavimentazioni, coperture e lavori di costruzione, direttamente o coordinando le diverse lavorazioni necessarie al cantiere.",
    ],
    note:
      "Le attività offerte possono variare da un’impresa all’altra. Su Esigenta puoi scegliere il lavoro che devi realizzare e richiedere preventivi per confrontare le proposte disponibili.",
  });
  assert.equal(
    content?.requestMicrocopy,
    "Confronta imprese per il lavoro che devi realizzare",
  );
  assert.deepEqual(
    content?.closingSections?.map((section) => section.heading),
    [
      "Quando rivolgersi a un’impresa edile",
      "Cosa incide sul preventivo",
      "Come scegliere un’impresa edile",
    ],
  );
  assert.equal(content?.closingSections?.[0]?.items?.length, 3);
  assert.deepEqual(content?.closingSections?.[1], {
    heading: "Cosa incide sul preventivo",
    paragraphs: [
      "Il costo di un lavoro edile dipende dal tipo di intervento e dalle condizioni specifiche del cantiere.",
    ],
    items: [
      "tipo di intervento",
      "dimensioni del lavoro",
      "condizioni dell’immobile",
      "materiali e finiture",
      "numero di lavorazioni coinvolte",
      "accessibilità del cantiere",
    ],
  });
  assert.equal(content?.closingSections?.[2]?.items?.length, 3);
  assert.equal(content?.pricing, undefined);
  assert.ok(!("faq" in (content ?? {})));
});
