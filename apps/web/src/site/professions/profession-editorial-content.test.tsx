import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { getProfessionEditorialContent } from "./profession-editorial-content";
import { ProfessionEditorialIntro } from "./profession-editorial-intro";

test("a known profession without editorial content resolves to null and renders no wrapper", () => {
  assert.equal(getProfessionEditorialContent("imbianchino"), null);
  assert.equal(
    renderToStaticMarkup(<ProfessionEditorialIntro intro={null} />),
    "",
  );
});

test("elettricista resolves exactly the two approved editorial paragraphs", () => {
  assert.deepEqual(
    getProfessionEditorialContent("elettricista")?.intro?.paragraphs,
    [
      "Un elettricista si occupa dell’installazione, della manutenzione e della riparazione degli impianti elettrici negli edifici. Può intervenire per realizzare o modificare un impianto, individuare guasti e malfunzionamenti, installare punti luce e prese oppure integrare sistemi come citofoni, videocitofoni, dispositivi di sicurezza e soluzioni per la smart home.",
      "Per i lavori sugli impianti elettrici è importante rivolgersi a un professionista qualificato e, quando previsto dalla normativa, a un’impresa abilitata per la tipologia di intervento da eseguire. Su Esigenta puoi individuare il lavoro di cui hai bisogno, approfondirne caratteristiche e costi quando è disponibile una guida dedicata e richiedere preventivi per confrontare le soluzioni più adatte.",
    ],
  );
});

test("only elettricista exposes the approved profession pricing", () => {
  const pricing = getProfessionEditorialContent("elettricista")?.pricing;

  assert.deepEqual(pricing, {
    heading: "Quanto costa un elettricista?",
    intro:
      "La tariffa di un elettricista può variare in base alla zona, alla complessità dell’intervento, alla durata del lavoro e alle condizioni in cui viene richiesto il servizio. Per gli interventi ordinari, i riferimenti di mercato analizzati indicano generalmente una tariffa oraria compresa nella seguente fascia.",
    rows: [
      {
        label: "Tariffa oraria indicativa",
        value: "25–50 €",
        unit: "all’ora",
        note:
          "Riferimento orientativo per interventi ordinari. Materiali, eventuale uscita e condizioni particolari possono incidere sul prezzo finale.",
      },
    ],
    context: "Interventi ordinari",
    factors: [
      "Zona",
      "Complessità",
      "Durata",
      "Eventuale uscita",
      "Materiali",
    ],
    disclaimer:
      "Le tariffe indicate sono riferimenti orientativi di mercato e non costituiscono un tariffario professionale vincolante. Il costo effettivo dipende dal lavoro richiesto e dalle condizioni definite dal professionista.",
    lastReviewed: "settembre 2026",
  });

  assert.equal(getProfessionEditorialContent("imbianchino")?.pricing, undefined);
});

test("an editorial intro fixture renders its paragraphs in source order", () => {
  const html = renderToStaticMarkup(
    <ProfessionEditorialIntro
      intro={{
        paragraphs: ["Primo paragrafo fixture.", "Secondo paragrafo fixture."],
      }}
    />,
  );

  assert.match(html, /data-profession-editorial-intro=""/);
  assert.ok(
    html.indexOf("Primo paragrafo fixture.") <
      html.indexOf("Secondo paragrafo fixture."),
  );
});
