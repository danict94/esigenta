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
