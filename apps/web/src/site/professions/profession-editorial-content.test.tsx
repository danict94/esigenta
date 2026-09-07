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
