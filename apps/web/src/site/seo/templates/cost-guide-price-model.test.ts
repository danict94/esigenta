import assert from "node:assert/strict"
import test from "node:test"

import {
  classifyPriceRows,
  describeAddsTo,
  describeAlternative,
  describeCostTypeBadge,
  describeIncludedIn,
  groupPriceRowsByCategory,
  hasNumericNationalRange,
  isQuoteRequired,
  shortSummary,
  sizeExamplesGridClassName,
  splitCommaList,
  splitVisibleAndRest,
} from "./cost-guide-price-model"

import type { PriceRow } from "../market-data/base-price-ranges"

import { ristrutturareBagnoGuide } from "../pages/costi/ristrutturare-bagno/content"
import { rifareImpiantoElettricoGuide } from "../pages/costi/rifare-impianto-elettrico/content"
import { impermeabilizzareTettoGuide } from "../pages/costi/impermeabilizzare-tetto/content"
import { impermeabilizzareTerrazzoGuide } from "../pages/costi/impermeabilizzare-terrazzo/content"
import { rifareFacciataGuide } from "../pages/costi/rifare-facciata/content"

// Scope 4B — logica di classificazione/traduzione condivisa dalle sezioni
// della Cost Guide. Fixture minime per i casi puntuali, dati REALI (bagno,
// elettrico, impermeabilizzare-tetto) per verificare la classificazione e i
// fallback su guide con/senza `role` compilato.

function row(overrides: Partial<PriceRow> & Pick<PriceRow, "id">): PriceRow {
  return {
    label: overrides.id,
    category: "Categoria di test",
    range: "da 100 € a 200 €",
    note: "nota di test",
    ...overrides,
  }
}

test("classifyPriceRows: bagno reale — esattamente 1 primary, 2 scenari (+1 nella scenarioCards), 2 extra, 2 reference, 11 breakdown", () => {
  const classification = classifyPriceRows(ristrutturareBagnoGuide.priceRows)

  assert.equal(classification.primary?.id, "bagno-ristrutturazione-completa")
  assert.deepEqual(
    classification.scenarios.map((r) => r.id),
    ["bagno-rinnovo-leggero", "bagno-ristrutturazione-complessa"],
  )
  assert.deepEqual(
    classification.scenarioCards.map((r) => r.id),
    ["bagno-rinnovo-leggero", "bagno-ristrutturazione-completa", "bagno-ristrutturazione-complessa"],
  )
  assert.deepEqual(
    classification.extras.map((r) => r.id),
    ["bagno-spostamento-scarichi", "bagno-adeguamento-elettrico"],
  )
  assert.deepEqual(
    classification.references.map((r) => r.id),
    ["bagno-forniture-pregiate-imprevisti", "bagno-costo-al-mq"],
  )
  assert.equal(classification.breakdown.length, 11)

  // Regressione esplicita: righe di dettaglio con role "primary" (impostato
  // esplicitamente negli Scope 2B.1-2B.3 su molte righe, non solo
  // sull'ancora della guida) NON devono finire tra le card scenario.
  const breakdownIds = classification.breakdown.map((r) => r.id)
  for (const detailId of [
    "bagno-demolizione-pavimenti-rivestimenti",
    "bagno-smaltimento-macerie",
    "bagno-impianto-idraulico",
    "bagno-posa-piastrelle-rivestimenti",
    "bagno-montaggio-sanitari",
    "bagno-trasformazione-vasca-doccia",
    "bagno-box-doccia-fornitura",
    "bagno-montaggio-box-doccia",
    "bagno-rubinetteria",
  ]) {
    assert.ok(breakdownIds.includes(detailId), `${detailId} deve restare nel breakdown, non negli scenari`)
    assert.ok(
      !classification.scenarioCards.some((r) => r.id === detailId),
      `${detailId} NON deve apparire come card scenario`,
    )
  }

  // I punti acqua (role "alternative") non sono né scenario né extra né
  // reference: restano nel breakdown, dove la relation alternativeTo li
  // collega a "Impianto idraulico bagno".
  assert.ok(breakdownIds.includes("bagno-punto-acqua-semplice"))
  assert.ok(breakdownIds.includes("bagno-punto-acqua-completo"))
})

test("isGuideScenarioRow (via classifyPriceRows): role \"primary\" NON implica scenario — distingue lo scenario/headline della guida dalle normali lavorazioni autonome primary (dati reali bagno)", () => {
  const rows = ristrutturareBagnoGuide.priceRows
  const classification = classifyPriceRows(rows)

  // 1) bagno-ristrutturazione-completa → scenario/headline valido: role
  // "primary", costType "complete", unit "a corpo", nessun includedIn uscente.
  const ristrutturazioneCompleta = rows.find((r) => r.id === "bagno-ristrutturazione-completa")!
  assert.equal(ristrutturazioneCompleta.role, "primary")
  assert.equal(classification.primary?.id, "bagno-ristrutturazione-completa")

  // 2) bagno-rinnovo-leggero → scenario.
  assert.ok(classification.scenarios.some((r) => r.id === "bagno-rinnovo-leggero"))

  // 3) bagno-ristrutturazione-complessa → scenario.
  assert.ok(classification.scenarios.some((r) => r.id === "bagno-ristrutturazione-complessa"))

  // 4) bagno-impianto-idraulico → role "primary", ED È costType "complete"/
  // unit "a corpo" come uno scenario — ma dichiara `includedIn` verso la
  // ristrutturazione completa, quindi NON è candidata a scenario. Non è un
  // dato errato: è una lavorazione autonoma primary a tutti gli effetti.
  const impiantoIdraulico = rows.find((r) => r.id === "bagno-impianto-idraulico")!
  assert.equal(impiantoIdraulico.role, "primary")
  assert.equal(impiantoIdraulico.costType, "complete")
  assert.equal(impiantoIdraulico.unit, "a corpo")
  assert.ok(
    impiantoIdraulico.relations?.some((rel) => rel.type === "includedIn"),
    "bagno-impianto-idraulico deve dichiarare includedIn verso la ristrutturazione completa",
  )
  assert.ok(!classification.scenarioCards.some((r) => r.id === "bagno-impianto-idraulico"))
  assert.ok(classification.breakdown.some((r) => r.id === "bagno-impianto-idraulico"))

  // 5) Una normale lavorazione "primary" resta nel breakdown — caso con un
  // motivo di esclusione diverso dal precedente (costType "work", non
  // "complete"), a riprova che la distinzione non dipende da un solo campo.
  const demolizione = rows.find((r) => r.id === "bagno-demolizione-pavimenti-rivestimenti")!
  assert.equal(demolizione.role, "primary")
  assert.equal(demolizione.costType, "work")
  assert.ok(!classification.scenarioCards.some((r) => r.id === "bagno-demolizione-pavimenti-rivestimenti"))
  assert.ok(classification.breakdown.some((r) => r.id === "bagno-demolizione-pavimenti-rivestimenti"))
})

test("classifyPriceRows: guida SENZA role compilato — nessuno scenario/extra/reference inventato, tutto nel breakdown (fallback Scope 4B)", () => {
  // Revisione 2026-08 (Scope 3 rifare-impianto-elettrico): rifare-impianto-
  // elettrico è stata rimossa da questo loop — non è più "senza role
  // compilato" (ora migrata: 1 primary + 2 scenario + 3 extra), verificata a
  // parte più sotto con la sua classificazione reale attesa. Sostituita con
  // impermeabilizzare-terrazzo, che oggi non ha ancora alcuna riga con role
  // compilato (per scelta editoriale: i suoi 8 sistemi sono paralleli per
  // materiale/tecnologia, non ampiezze diverse dello stesso intervento — vedi
  // il commento su "costGuide:impermeabilizzare-terrazzo" in
  // base-price-ranges.ts). impermeabilizzare-tetto è anch'essa oggi senza
  // alcun role compilato, ma resta fuori da questo loop perché ha già una
  // propria verifica dedicata più sotto, con le stesse identiche asserzioni.
  for (const guide of [impermeabilizzareTerrazzoGuide]) {
    const classification = classifyPriceRows(guide.priceRows)

    assert.equal(classification.primary, null, `${guide.slug}: nessuna riga ha role compilato`)
    assert.equal(classification.scenarios.length, 0, guide.slug)
    assert.equal(classification.scenarioCards.length, 0, guide.slug)
    assert.equal(classification.extras.length, 0, guide.slug)
    assert.equal(classification.references.length, 0, guide.slug)
    assert.equal(
      classification.breakdown.length,
      guide.priceRows.length,
      `${guide.slug}: il breakdown deve contenere TUTTE le righe, comportamento equivalente alla vecchia tabella`,
    )
  }
})

test("classifyPriceRows: rifare-impianto-elettrico (dati reali, Scope 3) — 1 primary, 2 scenari (+1 nella scenarioCards), 3 extra (quoteRequired), 0 reference, 12 breakdown", () => {
  const classification = classifyPriceRows(rifareImpiantoElettricoGuide.priceRows)

  assert.equal(classification.primary?.id, "elettrico-rifacimento-completo")
  assert.deepEqual(
    classification.scenarios.map((r) => r.id),
    ["elettrico-scenario-canalizzazioni-riutilizzabili", "elettrico-scenario-impianto-articolato"],
  )
  assert.equal(classification.scenarioCards.length, 3)
  assert.equal(classification.extras.length, 3)
  assert.ok(classification.extras.every((r) => r.priceStatus === "quoteRequired"))
  assert.equal(classification.references.length, 0)
  assert.equal(classification.breakdown.length, 12)
  assert.ok(classification.breakdown.some((r) => r.id === "elettrico-punto-luce-completo"))
  assert.ok(classification.breakdown.some((r) => r.id === "elettrico-collegamento-equipotenziale"))
})

test("classifyPriceRows: impermeabilizzare-tetto (dati reali) — nessuno scenario/primary/extra/reference inventato, tutte e 8 le righe nel breakdown", () => {
  const classification = classifyPriceRows(impermeabilizzareTettoGuide.priceRows)

  // Nessuna riga usa role "scenario"/"primary" esplicito: niente
  // primary/scenario per questa guida, per costruzione dei dati (nessuna
  // riga è pensata come "scenario complessivo"), indipendentemente da unit
  // o costType — invariato dal micro-fix 2026-08 su isGuideScenarioRow (vedi
  // sotto), che riguarda solo righe con role esplicito.
  assert.equal(classification.primary, null)
  assert.equal(classification.scenarios.length, 0)
  assert.equal(classification.scenarioCards.length, 0)
  assert.equal(classification.references.length, 0)

  // Micro-fix: "Preparazione e livellamento della superficie" non è più
  // role "extra" (era un contratto semantico non intenzionale, corretto —
  // vedi il commento su cost-guide-price-model.ts in base-price-ranges.ts).
  // Nessuna riga di questa guida ha role "extra": la sezione Extra non ha
  // nulla da mostrare, tutte le righe restano nel breakdown normale.
  assert.equal(classification.extras.length, 0)
  assert.equal(classification.breakdown.length, impermeabilizzareTettoGuide.priceRows.length)
  assert.ok(
    classification.breakdown.some((r) => r.id === "impermeabilizzare-tetto-lisciatura-piano-posa"),
  )
})

test("classifyPriceRows: rifare-facciata (dati reali) — micro-fix 2026-08: i 3 scenari al mq sono ora promossi a scenarioCards/primary, 1 extra (fissativo), 10 in breakdown", () => {
  const classification = classifyPriceRows(rifareFacciataGuide.priceRows)

  // Prima del micro-fix, isGuideScenarioRow richiedeva unit "a corpo": i 3
  // scenari di rifare-facciata sono "al mq" (corretto per una facciata, il
  // prezzo scala con la superficie) e restavano sempre esclusi. Il vincolo
  // sull'unità è stato rimosso (vedi isGuideScenarioRow qui sopra) — questo
  // test verifica il comportamento CORRETTO risultante.
  assert.equal(classification.primary?.id, "facciata-rifacimento-ordinario")
  assert.deepEqual(
    classification.scenarios.map((r) => r.id),
    ["facciata-rinnovo-finitura", "facciata-ripristino-parziale"],
  )
  assert.equal(classification.scenarioCards.length, 3)
  assert.equal(classification.references.length, 0)

  assert.equal(classification.extras.length, 1)
  assert.equal(classification.extras[0]?.id, "facciata-fissativo-primer")

  assert.equal(classification.breakdown.length, 10)
  assert.ok(!classification.breakdown.some((r) => r.id === "facciata-rifacimento-ordinario"))
  assert.ok(!classification.breakdown.some((r) => r.id === "facciata-fissativo-primer"))
})

test("isGuideScenarioRow (via classifyPriceRows) — micro-fix 2026-08: role \"scenario\" esplicito + unit \"al mq\" È classificato come scenario (unit non è più un gate)", () => {
  const rows: PriceRow[] = [
    row({ id: "scenario-al-mq", role: "scenario", costType: "complete", unit: "al mq" }),
  ]

  const classification = classifyPriceRows(rows)

  assert.deepEqual(classification.scenarios.map((r) => r.id), ["scenario-al-mq"])
  assert.deepEqual(classification.scenarioCards.map((r) => r.id), ["scenario-al-mq"])
  assert.equal(classification.breakdown.length, 0)
})

test("isGuideScenarioRow (via classifyPriceRows) — micro-fix 2026-08: una normale PriceRow \"al mq\" SENZA role esplicito NON diventa scenario automaticamente", () => {
  const rows: PriceRow[] = [
    row({ id: "riga-normale-al-mq", costType: "complete", unit: "al mq" }), // role assente
  ]

  const classification = classifyPriceRows(rows)

  assert.equal(classification.primary, null)
  assert.equal(classification.scenarios.length, 0)
  assert.equal(classification.scenarioCards.length, 0)
  assert.deepEqual(classification.breakdown.map((r) => r.id), ["riga-normale-al-mq"])
})

test("classifyPriceRows: fallback sintetico — riga role \"primary\"/\"scenario\" ma NON costType \"complete\", o già includedIn altrove, resta fuori dagli scenari (indipendentemente da unit)", () => {
  const rows: PriceRow[] = [
    row({ id: "voce-a", role: "primary", costType: "complete", unit: "a corpo" }),
    row({ id: "voce-b", role: "primary", costType: "work", unit: "al mq" }),
    row({
      id: "voce-c",
      role: "primary",
      costType: "complete",
      unit: "a corpo",
      relations: [{ type: "includedIn", target: "voce-a" }],
    }),
    // Micro-fix 2026-08: prima del fix, "voce-d" (costType "work", unit "al
    // mq") sarebbe stata esclusa (correttamente) anche solo per l'unità;
    // dopo il fix è il costType a doverla escludere da solo — verificato
    // esplicitamente qui, non solo per "voce-b" più sopra.
    row({ id: "voce-d", role: "scenario", costType: "work", unit: "al mq" }),
    // Una riga "scenario" già includedIn un'altra non deve diventare uno
    // scenario a sé: il gate su hasOutgoingIncludedIn resta attivo anche con
    // unit "al mq" (non solo con "a corpo", come prima del fix).
    row({
      id: "voce-e",
      role: "scenario",
      costType: "complete",
      unit: "al mq",
      relations: [{ type: "includedIn", target: "voce-a" }],
    }),
  ]

  const classification = classifyPriceRows(rows)

  assert.equal(classification.primary?.id, "voce-a")
  assert.equal(classification.scenarios.length, 0)
  assert.deepEqual(classification.breakdown.map((r) => r.id), ["voce-b", "voce-c", "voce-d", "voce-e"])
})

test("groupPriceRowsByCategory: preserva l'ordine di prima apparizione", () => {
  const rows: PriceRow[] = [
    row({ id: "a", category: "Uno" }),
    row({ id: "b", category: "Due" }),
    row({ id: "c", category: "Uno" }),
  ]

  const groups = groupPriceRowsByCategory(rows)

  assert.deepEqual(groups.map((g) => g.category), ["Uno", "Due"])
  assert.deepEqual(groups[0]!.rows.map((r) => r.id), ["a", "c"])
})

test("splitCommaList: non spezza una virgola dentro una parentesi", () => {
  const text =
    "collegamenti elettrici essenziali (collegamento dei punti luce e prese previsti, senza modifiche significative all'impianto esistente), finiture finali"

  assert.deepEqual(splitCommaList(text), [
    "collegamenti elettrici essenziali (collegamento dei punti luce e prese previsti, senza modifiche significative all'impianto esistente)",
    "finiture finali",
  ])
})

test("splitCommaList: stringa vuota o assente restituisce array vuoto", () => {
  assert.deepEqual(splitCommaList(undefined), [])
  assert.deepEqual(splitCommaList(""), [])
})

test("describeCostTypeBadge (fix UI review): work mostra un badge SOLO quando excludes segnala davvero materiali/fornitura esclusi, mai un default \"Solo posa\"", () => {
  // Nessun segnale nei dati (né fornitura né materiali negli excludes): NESSUN
  // badge — non più il vecchio default "Solo posa" (semanticamente sbagliato
  // per lavorazioni come demolizione o smaltimento, che non hanno materiali).
  assert.equal(describeCostTypeBadge(row({ id: "a", costType: "work" })), null)
  assert.equal(
    describeCostTypeBadge(row({ id: "b", costType: "work", excludes: "opere murarie estese" })),
    null,
  )

  assert.equal(
    describeCostTypeBadge(row({ id: "c", costType: "work", excludes: "fornitura delle piastrelle" })),
    "Materiali esclusi",
  )
  assert.equal(
    describeCostTypeBadge(row({ id: "d", costType: "work", excludes: "materiali di pregio" })),
    "Materiali esclusi",
  )
})

test("describeCostTypeBadge: dati reali del bagno — demolizione/smaltimento nessun badge, posa piastrelle/montaggio sanitari \"Materiali esclusi\"", () => {
  const rows = ristrutturareBagnoGuide.priceRows
  const demolizione = rows.find((r) => r.id === "bagno-demolizione-pavimenti-rivestimenti")!
  const smaltimento = rows.find((r) => r.id === "bagno-smaltimento-macerie")!
  const posaPiastrelle = rows.find((r) => r.id === "bagno-posa-piastrelle-rivestimenti")!
  const montaggioSanitari = rows.find((r) => r.id === "bagno-montaggio-sanitari")!

  // Esempi concettuali citati nella richiesta: demolizione e smaltimento non
  // hanno materiali da escludere (nessun excludes che li nomini) → nessun
  // badge fuorviante come "Solo posa".
  assert.equal(describeCostTypeBadge(demolizione), null)
  assert.equal(describeCostTypeBadge(smaltimento), null)

  // Posa piastrelle e montaggio sanitari dichiarano davvero la fornitura
  // esclusa negli excludes → badge utile e corretto.
  assert.equal(describeCostTypeBadge(posaPiastrelle), "Materiali esclusi")
  assert.equal(describeCostTypeBadge(montaggioSanitari), "Materiali esclusi")
})

test("describeCostTypeBadge: supply sceglie tra \"Solo fornitura\" e \"Montaggio escluso\" in base a excludes (default valido per costruzione: supply = sola fornitura)", () => {
  assert.equal(
    describeCostTypeBadge(row({ id: "a", costType: "supply" })),
    "Solo fornitura",
  )
  assert.equal(
    describeCostTypeBadge(row({ id: "b", costType: "supply", excludes: "montaggio" })),
    "Montaggio escluso",
  )

  // Dato reale: bagno-box-doccia-fornitura, excludes "montaggio".
  const boxDocciaFornitura = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-box-doccia-fornitura",
  )!
  assert.equal(describeCostTypeBadge(boxDocciaFornitura), "Montaggio escluso")
})

test("describeCostTypeBadge: complete non produce badge; fallback dal legacy priceType quando costType è assente", () => {
  assert.equal(describeCostTypeBadge(row({ id: "a", costType: "complete" })), null)
  assert.equal(describeCostTypeBadge(row({ id: "b" })), null)
  assert.equal(describeCostTypeBadge(row({ id: "c", priceType: "manodopera" })), null)
  assert.equal(
    describeCostTypeBadge(row({ id: "c2", priceType: "manodopera", excludes: "fornitura del materiale" })),
    "Materiali esclusi",
  )
  assert.equal(describeCostTypeBadge(row({ id: "d", priceType: "fornitura" })), "Solo fornitura")
  assert.equal(describeCostTypeBadge(row({ id: "e", priceType: "corpo" })), null)
})

test("describeIncludedIn / describeAddsTo / describeAlternative: dati reali del bagno", () => {
  const rows = ristrutturareBagnoGuide.priceRows
  const demolizione = rows.find((r) => r.id === "bagno-demolizione-pavimenti-rivestimenti")!
  const spostamento = rows.find((r) => r.id === "bagno-spostamento-scarichi")!
  const puntoSemplice = rows.find((r) => r.id === "bagno-punto-acqua-semplice")!
  const impianto = rows.find((r) => r.id === "bagno-impianto-idraulico")!

  assert.equal(describeIncludedIn(demolizione, rows), "Già compreso in “Ristrutturazione completa”")

  // Fix UI review: frase naturale ("Si aggiunge al prezzo di..."), non più il
  // formato "PUÒ AUMENTARE IL COSTO DI: X, Y" che leggeva come traduzione
  // diretta del metadato `addsTo`.
  assert.equal(
    describeAddsTo(spostamento, rows),
    "Si aggiunge al prezzo di “Trasformazione vasca in doccia” o “Ristrutturazione completa”.",
  )

  // Fix UI review: describeAlternative ora è un consiglio orientato al caso
  // reale (derivato da `unit`, campo già esistente), non più "un altro modo
  // di calcolare lo stesso lavoro". alternativeTo è dichiarata solo su
  // "Punto acqua semplice" verso "Impianto idraulico bagno", ma deve
  // leggersi come vera in ENTRAMBE le direzioni (simmetria del modello, vedi
  // isAlternativeTo) — con la frase corretta per ciascuna direzione.
  assert.equal(
    describeAlternative(puntoSemplice, rows),
    "Per un rifacimento completo, confronta anche il prezzo a corpo di “Impianto idraulico bagno”.",
  )
  assert.equal(
    describeAlternative(impianto, rows),
    "Per un intervento parziale, confronta anche il prezzo a punto di “Punto acqua semplice” o “Punto acqua completo”.",
  )

  assert.equal(describeIncludedIn(row({ id: "z" }), rows), null)
  assert.equal(describeAddsTo(row({ id: "z" }), rows), null)
  assert.equal(describeAlternative(row({ id: "z" }), rows), null)
})

test("describeAlternative: fallback neutro quando le unità non permettono di stabilire una direzione", () => {
  const rows: PriceRow[] = [
    row({ id: "a", unit: "al mq", relations: [{ type: "alternativeTo", target: "b" }] }),
    row({ id: "b", unit: "al mq" }),
  ]

  assert.equal(
    describeAlternative(rows[0]!, rows),
    "Confronta anche il prezzo di “b” per lo stesso lavoro.",
  )
})

test("isQuoteRequired: priceStatus esplicito o categoria qualitativa legacy", () => {
  assert.equal(isQuoteRequired(row({ id: "a", priceStatus: "quoteRequired" })), true)
  assert.equal(isQuoteRequired(row({ id: "b", category: "Da valutare con il professionista" })), true)
  assert.equal(isQuoteRequired(row({ id: "c" })), false)
})

test("shortSummary (fix UI review): dati reali delle 3 card Scenario del bagno — sempre un confine di frase reale, mai un taglio a metà parola/elenco", () => {
  const rows = ristrutturareBagnoGuide.priceRows

  const rinnovoLeggero = rows.find((r) => r.id === "bagno-rinnovo-leggero")!
  assert.equal(
    shortSummary(rinnovoLeggero.plainExplanation ?? rinnovoLeggero.note),
    "È un intervento senza demolire e rifare tutto il bagno.",
  )

  // Prima del fix, line-clamp-3 su questo testo tagliava a metà elenco
  // (es. "...del mobile o del box...") — ora si ferma al primo punto reale.
  const ristrutturazioneCompleta = rows.find((r) => r.id === "bagno-ristrutturazione-completa")!
  assert.equal(
    shortSummary(ristrutturazioneCompleta.plainExplanation ?? ristrutturazioneCompleta.note),
    "Perimetro tipico di una ristrutturazione completa su un bagno di circa 5–6 mq: le voci scelte nel preventivo possono spostare il totale verso l'alto o verso il basso.",
  )

  // Questo `note` è UN'unica frase molto lunga (nessun punto prima della
  // fine): niente confine [.!?] entro SUMMARY_HARD_CAP, fallback al primo
  // ":" chiuso con un punto — non più un taglio arbitrario tipo "...o una...".
  const ristrutturazioneComplessa = rows.find((r) => r.id === "bagno-ristrutturazione-complessa")!
  assert.equal(
    shortSummary(ristrutturazioneComplessa.plainExplanation ?? ristrutturazioneComplessa.note),
    "Stesso perimetro di lavorazioni della ristrutturazione completa standard qui sopra, applicato a un bagno oltre i 5–6 mq o con una disposizione più articolata (più sanitari, più punti acqua, superficie maggiore).",
  )
})

test("shortSummary: testo già breve non viene toccato; nessun confine disponibile accorcia all'ultima parola intera con \"…\"", () => {
  const short = "Un testo già breve, sotto la soglia."
  assert.equal(shortSummary(short), short)

  assert.equal(shortSummary(undefined), undefined)
  assert.equal(shortSummary(""), undefined)

  // 200 caratteri, nessuna punteggiatura di frase/clausola: deve tagliare
  // all'ultimo spazio prima del limite, mai a metà di una parola.
  const noPunctuation = Array.from({ length: 40 }, (_, i) => `parola${i}`).join(" ")
  const result = shortSummary(noPunctuation)
  assert.ok(result!.endsWith("…"))
  assert.ok(!result!.slice(0, -1).endsWith(" "))
  const withoutEllipsis = result!.slice(0, -1)
  assert.ok(
    noPunctuation.startsWith(withoutEllipsis) &&
      (noPunctuation[withoutEllipsis.length] === " " || noPunctuation.length === withoutEllipsis.length),
    "il taglio deve cadere esattamente su un confine di parola del testo originale",
  )
})

test("splitVisibleAndRest: divide senza perdere voci, entrambe le parti insieme ricostruiscono l'elenco originale", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g"]

  assert.deepEqual(splitVisibleAndRest(items, 5), { visible: ["a", "b", "c", "d", "e"], rest: ["f", "g"] })
  assert.deepEqual(splitVisibleAndRest(items, 10), { visible: items, rest: [] })
  assert.deepEqual(splitVisibleAndRest([], 5), { visible: [], rest: [] })
})

test("sizeExamplesGridClassName (fix UI review): sceglie le colonne in base al conteggio reale, mai un 3+1 sbilanciato per 4 esempi", () => {
  assert.equal(sizeExamplesGridClassName(0), "grid grid-cols-1 gap-4")
  assert.equal(sizeExamplesGridClassName(1), "grid grid-cols-1 gap-4")
  assert.equal(sizeExamplesGridClassName(2), "grid grid-cols-1 gap-4 sm:grid-cols-2")
  assert.equal(sizeExamplesGridClassName(3), "grid grid-cols-1 gap-4 sm:grid-cols-3")
  // Caso reale più comune (bagno, tetto, elettrico: 4 esempi) — 2×2 su
  // tablet, 4 in riga su desktop, mai 3 in una riga + 1 da solo sotto.
  assert.equal(sizeExamplesGridClassName(4), "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4")
  assert.equal(sizeExamplesGridClassName(5), "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4")
})

test("hasNumericNationalRange: distingue un prezzo reale da un disclaimer testuale", () => {
  assert.equal(hasNumericNationalRange("da 4.500 € a 8.000 €"), true)
  assert.equal(
    hasNumericNationalRange(
      "Nessun totale complessivo: le voci sono prezzi ufficiali puntuali, non cumulabili automaticamente",
    ),
    false,
  )
  assert.equal(hasNumericNationalRange(undefined), false)
})
