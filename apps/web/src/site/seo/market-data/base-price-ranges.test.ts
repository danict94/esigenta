import assert from "node:assert/strict"
import test from "node:test"

import {
  basePriceRangesByFamily,
  isAlternativeTo,
  validatePriceRowIntegrity,
} from "./base-price-ranges"

import type { BasePriceRange, PriceRow } from "./base-price-ranges"

import { ristrutturareBagnoGuide } from "../pages/costi/ristrutturare-bagno/content"
import { rifareTettoGuide } from "../pages/costi/rifare-tetto/content"
import { impermeabilizzareTettoGuide } from "../pages/costi/impermeabilizzare-tetto/content"
import { classifyPriceRows, describeCostTypeBadge } from "../templates/cost-guide-price-model"

// Scope 1C — infrastruttura del nuovo contratto PriceRow (id, costType, role,
// priceStatus, relations). Fixture minime e sintetiche: mai i dati reali
// dell'SSOT, per non far dipendere questi test dal contenuto editoriale
// delle Cost Guide (vedi anche il test di non-regressione in fondo, che
// invece usa apposta i dati reali).

function row(overrides: Partial<PriceRow> & Pick<PriceRow, "id">): PriceRow {
  return {
    label: overrides.id,
    category: "Categoria di test",
    range: "da 100 € a 200 €",
    note: "nota di test",
    ...overrides,
  }
}

function family(priceRows: PriceRow[]): BasePriceRange {
  return {
    nationalRange: "da 100 € a 200 €",
    pricePerSquareMeter: "da 10 € a 20 € al mq",
    sourceType: "mixed",
    priceRows,
    sizeExamples: [],
  }
}

test("validatePriceRowIntegrity: id duplicato nella stessa famiglia -> errore", () => {
  const byFamily = {
    "test:famiglia-a": family([row({ id: "voce-a" }), row({ id: "voce-a" })]),
  }

  assert.throws(() => validatePriceRowIntegrity(byFamily), /Duplicate PriceRow id/)
})

test("validatePriceRowIntegrity: id duplicato tra famiglie diverse -> errore (unicità globale)", () => {
  const byFamily = {
    "test:famiglia-a": family([row({ id: "voce-condivisa" })]),
    "test:famiglia-b": family([row({ id: "voce-condivisa" })]),
  }

  assert.throws(() => validatePriceRowIntegrity(byFamily), /globally unique/)
})

test("validatePriceRowIntegrity: relation verso id inesistente -> errore", () => {
  const byFamily = {
    "test:famiglia-a": family([
      row({
        id: "voce-a",
        relations: [{ type: "addsTo", target: "voce-fantasma" }],
      }),
    ]),
  }

  assert.throws(() => validatePriceRowIntegrity(byFamily), /unknown id "voce-fantasma"/)
})

test("validatePriceRowIntegrity: relation verso se stessa -> errore", () => {
  const byFamily = {
    "test:famiglia-a": family([
      row({
        id: "voce-a",
        relations: [{ type: "includedIn", target: "voce-a" }],
      }),
    ]),
  }

  assert.throws(() => validatePriceRowIntegrity(byFamily), /targeting itself/)
})

test("validatePriceRowIntegrity: relation cross-family -> errore", () => {
  const byFamily = {
    "test:famiglia-a": family([
      row({
        id: "voce-a",
        relations: [{ type: "alternativeTo", target: "voce-b" }],
      }),
    ]),
    "test:famiglia-b": family([row({ id: "voce-b" })]),
  }

  assert.throws(() => validatePriceRowIntegrity(byFamily), /must belong to the same family/)
})

test("validatePriceRowIntegrity: relation duplicata identica sulla stessa riga -> errore", () => {
  const byFamily = {
    "test:famiglia-a": family([
      row({
        id: "voce-a",
        relations: [
          { type: "addsTo", target: "voce-b" },
          { type: "addsTo", target: "voce-b" },
        ],
      }),
      row({ id: "voce-b" }),
    ]),
  }

  assert.throws(() => validatePriceRowIntegrity(byFamily), /more than once/)
})

test("validatePriceRowIntegrity: più relation distinte sulla stessa riga sono supportate", () => {
  const byFamily = {
    "test:famiglia-a": family([
      row({
        id: "voce-a",
        role: "extra",
        relations: [
          { type: "addsTo", target: "voce-b" },
          { type: "addsTo", target: "voce-c" },
          { type: "includedIn", target: "voce-b" },
        ],
      }),
      row({ id: "voce-b" }),
      row({ id: "voce-c" }),
    ]),
  }

  assert.doesNotThrow(() => validatePriceRowIntegrity(byFamily))
})

test("validatePriceRowIntegrity: role \"extra\" con relations ma senza alcuna addsTo -> errore", () => {
  const byFamily = {
    "test:famiglia-a": family([
      row({
        id: "voce-a",
        role: "extra",
        relations: [{ type: "alternativeTo", target: "voce-b" }],
      }),
      row({ id: "voce-b" }),
    ]),
  }

  assert.throws(() => validatePriceRowIntegrity(byFamily), /none is "addsTo"/)
})

test("validatePriceRowIntegrity: role \"extra\" senza alcuna relation dichiarata NON deve fallire (migrazione progressiva)", () => {
  const byFamily = {
    "test:famiglia-a": family([row({ id: "voce-a", role: "extra" })]),
  }

  assert.doesNotThrow(() => validatePriceRowIntegrity(byFamily))
})

test("validatePriceRowIntegrity: PriceRow legacy senza costType/role/priceStatus/relations continua a funzionare", () => {
  const byFamily = {
    "test:famiglia-a": family([
      row({ id: "voce-legacy", priceType: "corpo" }),
    ]),
  }

  assert.doesNotThrow(() => validatePriceRowIntegrity(byFamily))
})

test("isAlternativeTo: simmetrica senza duplicare la relation nell'SSOT", () => {
  const rows = [
    row({
      id: "impianto-a-corpo",
      relations: [{ type: "alternativeTo", target: "punto-a-punto" }],
    }),
    row({ id: "punto-a-punto" }),
  ]

  assert.equal(isAlternativeTo(rows, "impianto-a-corpo", "punto-a-punto"), true)
  // Nessuna relation dichiarata su "punto-a-punto" verso "impianto-a-corpo":
  // deve comunque risultare true nella direzione inversa.
  assert.equal(isAlternativeTo(rows, "punto-a-punto", "impianto-a-corpo"), true)
})

test("isAlternativeTo: false quando non esiste alcuna relation alternativeTo tra le due righe", () => {
  const rows = [row({ id: "voce-a" }), row({ id: "voce-b" })]

  assert.equal(isAlternativeTo(rows, "voce-a", "voce-b"), false)
})

test("SSOT reale (basePriceRangesByFamily): passa validatePriceRowIntegrity senza modifiche", () => {
  assert.doesNotThrow(() => validatePriceRowIntegrity(basePriceRangesByFamily))
})

test("nessuna regressione: ristrutturareBagnoGuide (CostGuide reale, composta) ha 18 priceRows, ognuna con id univoco", () => {
  // 17 dello Scope 1C + "bagno-montaggio-box-doccia" aggiunta nello Scope 2B.1.
  const { priceRows } = ristrutturareBagnoGuide

  assert.equal(priceRows.length, 18)

  const ids = priceRows.map((r) => r.id)
  assert.equal(new Set(ids).size, ids.length, "gli id devono essere tutti univoci")
  for (const id of ids) {
    assert.match(id, /^bagno-[a-z0-9-]+$/)
  }

  // Contenuto editoriale invariato dallo Scope 1C: stessa label/range/category
  // di prima, l'unica aggiunta è `id`.
  const impiantoIdraulico = priceRows.find((r) => r.id === "bagno-impianto-idraulico")
  assert.ok(impiantoIdraulico)
  assert.equal(impiantoIdraulico?.label, "Impianto idraulico bagno")
  assert.equal(impiantoIdraulico?.range, "da 1.000 € a 2.500 €")
  assert.equal(impiantoIdraulico?.priceType, "corpo")
})

// Scope 2B.1 — cluster "Trasformazione vasca in doccia": trasformazione
// (sola lavorazione), fornitura box, montaggio box, spostamento scarichi.

test("Scope 2B.1: bagno-trasformazione-vasca-doccia è sola lavorazione, fascia 500-1.000 €", () => {
  const row = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-trasformazione-vasca-doccia",
  )

  assert.ok(row)
  assert.equal(row?.range, "da 500 € a 1.000 €")
  assert.equal(row?.costType, "work")
  assert.equal(row?.role, "primary")
  assert.equal(row?.priceType, "manodopera")
  // La fornitura non deve mai risultare compresa nel testo indicizzabile.
  assert.match(row?.excludes ?? "", /fornitura del piatto doccia/)
  assert.match(row?.excludes ?? "", /del box doccia/)
  assert.doesNotMatch(row?.includes ?? "", /piatto doccia standard/)
})

test("Scope 2B.1: bagno-box-doccia-fornitura resta sola fornitura, range invariato", () => {
  const row = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-box-doccia-fornitura",
  )

  assert.ok(row)
  assert.equal(row?.range, "da 250 € a 1.500 €")
  assert.equal(row?.costType, "supply")
  assert.equal(row?.role, "primary")
  assert.equal(row?.excludes, "montaggio")
})

test("Scope 2B.1: nuova bagno-montaggio-box-doccia è sola lavorazione, fascia 150-500 €, esclude la fornitura", () => {
  const row = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-montaggio-box-doccia",
  )

  assert.ok(row)
  assert.equal(row?.label, "Montaggio box doccia")
  assert.equal(row?.unit, "a elemento")
  assert.equal(row?.range, "da 150 € a 500 €")
  assert.equal(row?.costType, "work")
  assert.equal(row?.role, "primary")
  assert.equal(row?.priceType, "manodopera")
  assert.match(row?.excludes ?? "", /fornitura del box doccia/)
})

test("Scope 2B.1: bagno-spostamento-scarichi è extra con addsTo verso trasformazione vasca-doccia e ristrutturazione completa, prezzo invariato", () => {
  const row = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-spostamento-scarichi",
  )

  assert.ok(row)
  assert.equal(row?.range, "da 200 € a 800 €")
  assert.equal(row?.costType, "complete")
  assert.equal(row?.role, "extra")

  const targets = (row?.relations ?? []).map((r) => `${r.type}:${r.target}`)
  assert.deepEqual(
    new Set(targets),
    new Set([
      "addsTo:bagno-trasformazione-vasca-doccia",
      "addsTo:bagno-ristrutturazione-completa",
    ]),
  )
})

test("nessuna regressione di prezzo: label e range delle 18 PriceRow bagno sono quelli attesi", () => {
  // Guardia trasversale a tutti gli Scope 2B.*/3.*: qualunque Scope aggiunga o
  // corregga costType/role/priceStatus/relations, label e range devono
  // restare bit-per-bit identici a quanto approvato nell'ultima revisione
  // economica (chiusura Scope 3: demolizione, smaltimento e la label di
  // "Spostamento di uno scarico" sono le sole eccezioni, corrette qui sotto).
  const expected: [string, string, string][] = [
    ["bagno-rinnovo-leggero", "Rinnovo leggero bagno", "da 1.500 € a 4.000 €"],
    ["bagno-ristrutturazione-completa", "Ristrutturazione completa", "da 4.500 € a 8.000 €"],
    ["bagno-ristrutturazione-complessa", "Bagno più grande o più complesso", "da 8.000 € a 12.000 €"],
    ["bagno-forniture-pregiate-imprevisti", "Forniture pregiate, modifiche importanti o imprevisti", "oltre 12.000 €, senza un massimo definito"],
    ["bagno-costo-al-mq", "Costo indicativo al mq", "da 800 € a 1.200 € al mq"],
    ["bagno-demolizione-pavimenti-rivestimenti", "Demolizione pavimenti e rivestimenti", "da 20 € a 40 € al mq"],
    ["bagno-smaltimento-macerie", "Smaltimento macerie", "da 300 € a 600 €"],
    ["bagno-impianto-idraulico", "Impianto idraulico bagno", "da 1.000 € a 2.500 €"],
    ["bagno-punto-acqua-semplice", "Punto acqua semplice", "da 75 € a 150 €"],
    ["bagno-punto-acqua-completo", "Punto acqua completo", "da 150 € a 280 €"],
    ["bagno-spostamento-scarichi", "Spostamento di uno scarico", "da 200 € a 800 €"],
    ["bagno-posa-piastrelle-rivestimenti", "Posa piastrelle e rivestimenti", "da 25 € a 80 € al mq"],
    ["bagno-montaggio-sanitari", "Montaggio sanitari", "da 40 € a 150 €"],
    ["bagno-trasformazione-vasca-doccia", "Trasformazione vasca in doccia", "da 500 € a 1.000 €"],
    ["bagno-box-doccia-fornitura", "Box doccia (fornitura)", "da 250 € a 1.500 €"],
    ["bagno-montaggio-box-doccia", "Montaggio box doccia", "da 150 € a 500 €"],
    ["bagno-rubinetteria", "Rubinetteria", "variabile per marca e finitura"],
    ["bagno-adeguamento-elettrico", "Adeguamento elettrico del bagno", "da valutare con sopralluogo"],
  ]

  const { priceRows } = ristrutturareBagnoGuide
  assert.equal(priceRows.length, expected.length)

  for (const [id, label, range] of expected) {
    const row = priceRows.find((r) => r.id === id)
    assert.ok(row, `riga ${id} deve esistere`)
    assert.equal(row?.label, label, `${id}: label`)
    assert.equal(row?.range, range, `${id}: range`)
  }
})

// Scope 2B.2 — perimetro di "Ristrutturazione completa bagno": demolizione,
// smaltimento, impianto idraulico/punto acqua, posa piastrelle, montaggio
// sanitari includedIn; rubinetteria e adeguamento elettrico restano blocker.

test("Scope 2B.2: bagno-ristrutturazione-completa ha perimetro chiarito, prezzo invariato", () => {
  const row = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-ristrutturazione-completa",
  )

  assert.ok(row)
  assert.equal(row?.range, "da 4.500 € a 8.000 €")
  assert.equal(row?.costType, "complete")
  assert.equal(row?.role, "primary")
  // La clausola condizionale ambigua non deve più comparire.
  assert.doesNotMatch(row?.includes ?? "", /quando previsti/)
  assert.match(row?.includes ?? "", /trasporto e smaltimento ordinari delle macerie/)
  assert.match(row?.includes ?? "", /impianto idraulico interno ordinario/)
  assert.match(row?.includes ?? "", /sanitari standard forniti e installati/)
  assert.match(row?.includes ?? "", /collegamenti elettrici essenziali/)
})

test("Scope 2B.2: demolizione, smaltimento, posa piastrelle, montaggio sanitari sono includedIn la ristrutturazione completa", () => {
  const ids = [
    "bagno-demolizione-pavimenti-rivestimenti",
    "bagno-smaltimento-macerie",
    "bagno-posa-piastrelle-rivestimenti",
    "bagno-montaggio-sanitari",
  ]

  for (const id of ids) {
    const row = ristrutturareBagnoGuide.priceRows.find((r) => r.id === id)
    assert.ok(row, `riga ${id} deve esistere`)
    assert.equal(row?.costType, "work", `${id}: costType`)
    assert.equal(row?.role, "primary", `${id}: role`)
    assert.deepEqual(
      row?.relations,
      [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
      `${id}: relations`,
    )
  }
})

test("Scope 2B.2: bagno-impianto-idraulico è includedIn la ristrutturazione completa", () => {
  const row = ristrutturareBagnoGuide.priceRows.find((r) => r.id === "bagno-impianto-idraulico")

  assert.ok(row)
  assert.equal(row?.costType, "complete")
  assert.equal(row?.role, "primary")
  assert.deepEqual(row?.relations, [
    { type: "includedIn", target: "bagno-ristrutturazione-completa" },
  ])
})

test("Scope 2B.2/2B.3: punto acqua semplice/completo sono alternativeTo impianto idraulico (role \"alternative\"), nessun includedIn ridondante", () => {
  const semplice = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-punto-acqua-semplice",
  )
  const completo = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-punto-acqua-completo",
  )

  for (const row of [semplice, completo]) {
    assert.ok(row)
    assert.equal(row?.role, "alternative", `${row?.id}: role (Scope 2B.3, era assente)`)
    assert.deepEqual(row?.relations, [
      { type: "alternativeTo", target: "bagno-impianto-idraulico" },
    ])
    assert.equal(row?.costType, undefined, `${row?.id}: nessun costType, non richiesto dalla decisione 4`)
  }

  // Simmetria reale: nessuna relation dichiarata su bagno-impianto-idraulico
  // verso i punti acqua, eppure isAlternativeTo la riconosce in entrambe le
  // direzioni.
  assert.equal(
    isAlternativeTo(ristrutturareBagnoGuide.priceRows, "bagno-impianto-idraulico", "bagno-punto-acqua-semplice"),
    true,
  )
  assert.equal(
    isAlternativeTo(ristrutturareBagnoGuide.priceRows, "bagno-impianto-idraulico", "bagno-punto-acqua-completo"),
    true,
  )
})

// Scope 2B.3 — chiude i due blocker lasciati aperti dallo Scope 2B.2
// (rubinetteria, adeguamento elettrico) e i ruoli delle macro-fasce.

test("Scope 2B.3: bagno-rubinetteria è supply/primary/quoteRequired, semanticamente separata dalla ristrutturazione completa", () => {
  const rubinetteria = ristrutturareBagnoGuide.priceRows.find((r) => r.id === "bagno-rubinetteria")

  assert.ok(rubinetteria)
  assert.equal(rubinetteria?.range, "variabile per marca e finitura")
  assert.equal(rubinetteria?.costType, "supply")
  assert.equal(rubinetteria?.role, "primary")
  assert.equal(rubinetteria?.priceStatus, "quoteRequired")
  assert.equal(rubinetteria?.relations, undefined)

  const completa = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-ristrutturazione-completa",
  )
  // La fornitura resta esclusa qualunque sia la fascia, non solo quella alta.
  assert.match(completa?.excludes ?? "", /fornitura della rubinetteria \(qualunque fascia\)/)
  assert.doesNotMatch(completa?.excludes ?? "", /rubinetteria di fascia alta/)
  // La posa/collegamento ordinario resta invece compresa nel pacchetto.
  assert.match(completa?.includes ?? "", /posa ordinaria della rubinetteria/)
})

test("Scope 2B.3: bagno-adeguamento-elettrico è extra/quoteRequired con addsTo, costType volutamente non compilato", () => {
  const row = ristrutturareBagnoGuide.priceRows.find((r) => r.id === "bagno-adeguamento-elettrico")

  assert.ok(row)
  assert.equal(row?.range, "da valutare con sopralluogo")
  assert.equal(row?.role, "extra")
  assert.equal(row?.priceStatus, "quoteRequired")
  assert.equal(row?.costType, undefined, "costType non decidibile dal contenuto attuale (work vs complete)")
  assert.deepEqual(row?.relations, [
    { type: "addsTo", target: "bagno-ristrutturazione-completa" },
  ])

  const completa = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-ristrutturazione-completa",
  )
  assert.match(completa?.excludes ?? "", /adeguamento elettrico con nuovi punti/)
})

test("Scope 2B.3: macro-fasce hanno un ruolo non ambiguo", () => {
  const fornitureImprevisti = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-forniture-pregiate-imprevisti",
  )
  assert.equal(fornitureImprevisti?.role, "reference")
  assert.equal(fornitureImprevisti?.relations, undefined, "nessuna relation ridondante con la fascia complessa")

  const costoAlMq = ristrutturareBagnoGuide.priceRows.find((r) => r.id === "bagno-costo-al-mq")
  assert.equal(costoAlMq?.role, "reference")
  assert.equal(costoAlMq?.relations, undefined, "nessuna alternativeTo che contraddica il ruolo di riferimento")

  // Nessuna riga "alternative"/"reference" sembra sommabile: tutte alla fine
  // sono verificate come coerenti con validatePriceRowIntegrity più sotto.
})

// Scope 2B.4 — "scenario" separato da "alternative": rinnovo leggero e bagno
// più grande/complesso sono scenari di ampiezza diversa (stesso genere di
// intervento), NON lo stesso lavoro calcolato con un metodo di prezzo
// diverso — quello resta "alternative", riservato a impianto ↔ punto acqua.

test("Scope 2B.4: bagno-rinnovo-leggero è role \"scenario\", nessuna alternativeTo", () => {
  const row = ristrutturareBagnoGuide.priceRows.find((r) => r.id === "bagno-rinnovo-leggero")

  assert.ok(row)
  assert.equal(row?.costType, "complete")
  assert.equal(row?.role, "scenario")
  assert.equal(row?.relations, undefined, "non è una vera alternativa economica: nessuna relation")
})

test("Scope 2B.4: bagno-ristrutturazione-complessa è role \"scenario\" con perimetro proprio, stesso nucleo della ristrutturazione completa", () => {
  const row = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-ristrutturazione-complessa",
  )

  assert.ok(row)
  assert.equal(row?.range, "da 8.000 € a 12.000 €")
  assert.equal(row?.costType, "complete")
  assert.equal(row?.role, "scenario")
  assert.equal(row?.relations, undefined, "non è una vera alternativa economica: nessuna relation")

  // Stesso nucleo della ristrutturazione completa standard.
  for (const term of [
    "demolizione ordinaria",
    "smaltimento ordinari",
    "impianto idraulico interno ordinario",
    "impermeabilizzazione",
    "sanitari standard forniti e installati",
    "finiture finali",
  ]) {
    assert.match(row?.includes ?? "", new RegExp(term), `includes deve menzionare: ${term}`)
  }

  // Gli stessi extra separati altrove restano fuori dal perimetro.
  for (const term of [
    "spostamento importante degli scarichi",
    "fornitura della rubinetteria",
    "box doccia",
    "fascia premium",
    "adeguamento elettrico",
    "opere strutturali",
    "imprevisti",
  ]) {
    assert.match(row?.excludes ?? "", new RegExp(term), `excludes deve menzionare: ${term}`)
  }
})

// Chiusura Scope 3 — correzioni economiche approvate: demolizione (20-40
// €/mq, sanitari rimossi dal perimetro), smaltimento (300-600 €), nota
// impianto idraulico (nessuna implicazione di somma matematica coi punti
// acqua), spostamento di UN solo scarico (label rinominata, prezzo
// invariato). Impianto idraulico e punti acqua confermati invariati nel
// prezzo/ruolo/relation.

test("Chiusura Scope 3: bagno-demolizione-pavimenti-rivestimenti è 20-40 €/mq e non include più i sanitari", () => {
  const row = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-demolizione-pavimenti-rivestimenti",
  )

  assert.ok(row)
  assert.equal(row?.range, "da 20 € a 40 € al mq")
  assert.equal(row?.costType, "work")
  assert.equal(row?.role, "primary")
  assert.deepEqual(row?.relations, [
    { type: "includedIn", target: "bagno-ristrutturazione-completa" },
  ])
  assert.doesNotMatch(row?.includes ?? "", /sanitari/, "i sanitari non devono più far parte del perimetro di questa riga")
  assert.match(row?.excludes ?? "", /rimozione dei sanitari/, "l'esclusione dei sanitari deve essere esplicita")
  assert.match(row?.excludes ?? "", /massetto/, "la demolizione del massetto deve restare esclusa")

  // La rimozione sanitari resta nel perimetro della ristrutturazione
  // completa, non è stata spostata in una nuova PriceRow.
  const completa = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-ristrutturazione-completa",
  )
  assert.match(completa?.includes ?? "", /rimozione dei sanitari esistenti/)
})

test("Chiusura Scope 3: bagno-smaltimento-macerie è 300-600 €, perimetro e relation invariati", () => {
  const row = ristrutturareBagnoGuide.priceRows.find((r) => r.id === "bagno-smaltimento-macerie")

  assert.ok(row)
  assert.equal(row?.range, "da 300 € a 600 €")
  assert.equal(row?.costType, "work")
  assert.equal(row?.role, "primary")
  assert.deepEqual(row?.relations, [
    { type: "includedIn", target: "bagno-ristrutturazione-completa" },
  ])
  assert.match(row?.note ?? "", /situazione ordinaria/)
})

test("Chiusura Scope 3: bagno-impianto-idraulico e i punti acqua sono invariati nel prezzo", () => {
  const impianto = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-impianto-idraulico",
  )
  assert.ok(impianto)
  assert.equal(impianto?.range, "da 1.000 € a 2.500 €")
  assert.equal(impianto?.costType, "complete")
  assert.equal(impianto?.role, "primary")
  assert.deepEqual(impianto?.relations, [
    { type: "includedIn", target: "bagno-ristrutturazione-completa" },
  ])
  // La nota non deve più suggerire un'equivalenza di somma tra il prezzo a
  // corpo e i prezzi a punto.
  assert.doesNotMatch(impianto?.note ?? "", /due modi di leggere lo stesso lavoro/)
  assert.match(impianto?.note ?? "", /distribuzione complessiva interna/)

  const semplice = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-punto-acqua-semplice",
  )
  const completo = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-punto-acqua-completo",
  )
  assert.equal(semplice?.range, "da 75 € a 150 €")
  assert.equal(semplice?.role, "alternative")
  assert.deepEqual(semplice?.relations, [
    { type: "alternativeTo", target: "bagno-impianto-idraulico" },
  ])
  assert.equal(completo?.range, "da 150 € a 280 €")
  assert.equal(completo?.role, "alternative")
  assert.deepEqual(completo?.relations, [
    { type: "alternativeTo", target: "bagno-impianto-idraulico" },
  ])
})

test("Chiusura Scope 3: bagno-spostamento-scarichi è \"Spostamento di uno scarico\", prezzo/ruolo/relations invariati", () => {
  const row = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-spostamento-scarichi",
  )

  assert.ok(row)
  assert.equal(row?.label, "Spostamento di uno scarico")
  assert.equal(row?.range, "da 200 € a 800 €")
  assert.equal(row?.costType, "complete")
  assert.equal(row?.role, "extra")
  assert.match(row?.plainExplanation ?? "", /singolo scarico/)

  const targets = (row?.relations ?? []).map((r) => `${r.type}:${r.target}`)
  assert.deepEqual(
    new Set(targets),
    new Set([
      "addsTo:bagno-trasformazione-vasca-doccia",
      "addsTo:bagno-ristrutturazione-completa",
    ]),
  )

  // Cluster vasca-doccia: solo il testo che cita la label deve essere
  // aggiornato, il resto del cluster resta invariato.
  const trasformazione = ristrutturareBagnoGuide.priceRows.find(
    (r) => r.id === "bagno-trasformazione-vasca-doccia",
  )
  assert.equal(trasformazione?.range, "da 500 € a 1.000 €")
  assert.match(trasformazione?.note ?? "", /Spostamento di uno scarico/)
  assert.doesNotMatch(trasformazione?.note ?? "", /"Spostamento scarichi"/)
})

// Revisione 2026-08 di rifare-tetto — dati REALI (rifareTettoGuide composta),
// non fixture sintetiche: la guida passa da una riga quotata + sei voci "da
// valutare" a 4 scenari di rifacimento + 4 lavorazioni specifiche, tutte con
// una fascia reale.

test("rifare-tetto: esattamente 8 PriceRow, tutte con un id univoco reale", () => {
  assert.equal(rifareTettoGuide.priceRows.length, 8)
  assert.equal(new Set(rifareTettoGuide.priceRows.map((r) => r.id)).size, 8)
})

test("rifare-tetto: scenario standard 120-180 €/mq, è la riga primary con costType complete", () => {
  const standard = rifareTettoGuide.priceRows.find((r) => r.id === "tetto-rifacimento-copertura")

  assert.equal(standard?.range, "da 120 € a 180 € al mq")
  assert.equal(standard?.unit, "al mq")
  assert.equal(standard?.costType, "complete")
  assert.equal(standard?.role, "primary")
})

test("rifare-tetto: nationalRange/pricePerSquareMeter/sizeExamples sono coerenti con lo scenario standard (120-180 €/mq), non più 120-300", () => {
  assert.equal(rifareTettoGuide.nationalRange, "120–180 € al mq")
  assert.equal(rifareTettoGuide.pricePerSquareMeter, "da 120 € a 180 € al mq")

  assert.doesNotMatch(rifareTettoGuide.nationalRangeNote ?? "", /120–300/)
  assert.doesNotMatch(rifareTettoGuide.sizeExamplesIntro ?? "", /120–300/)

  const bySize = new Map(rifareTettoGuide.sizeExamples.map((example) => [example.sizeRange, example]))
  assert.equal(bySize.get("70 mq")?.range, "da 8.400 € a 12.600 €") // 70 × 120 / 70 × 180
  assert.equal(bySize.get("100 mq")?.range, "da 12.000 € a 18.000 €")
  assert.equal(bySize.get("150 mq")?.range, "da 18.000 € a 27.000 €")
  assert.equal(bySize.get("200 mq")?.range, "da 24.000 € a 36.000 €")

  for (const example of rifareTettoGuide.sizeExamples) {
    assert.match(
      example.note,
      /rifacimento standard/,
      `sizeExample "${example.label}" deve specificare che rappresenta il rifacimento standard`,
    )
  }
})

test("rifare-tetto: i 4 scenari di rifacimento hanno le fasce e la classificazione (role/costType) approvate", () => {
  const rows = rifareTettoGuide.priceRows
  const byId = (id: string) => rows.find((r) => r.id === id)

  const soloManto = byId("tetto-sostituzione-manto")
  assert.equal(soloManto?.range, "da 60 € a 120 € al mq")
  assert.equal(soloManto?.costType, "complete")
  assert.equal(soloManto?.role, "scenario")

  const conIsolamento = byId("tetto-rifacimento-isolamento-ventilazione")
  assert.equal(conIsolamento?.range, "da 180 € a 300 € al mq")
  assert.equal(conIsolamento?.costType, "complete")
  assert.equal(conIsolamento?.role, "scenario")

  const strutturale = byId("tetto-rifacimento-struttura")
  assert.equal(strutturale?.range, "da 280 € a 500 € al mq")
  assert.equal(strutturale?.costType, "complete")
  assert.equal(strutturale?.role, "scenario")

  // Formulazione vaga "oltre 300 €/mq senza massimo" non deve più essere
  // l'informazione principale di questo scenario (può restare come nota
  // sui casi eccezionali, non come range).
  assert.doesNotMatch(strutturale?.range ?? "", /senza un massimo/)
})

test("rifare-tetto: BLOCKER noto — classifyPriceRows non riconosce oggi gli scenari al mq (isGuideScenarioRow richiede unit \"a corpo\")", () => {
  // Questo test documenta lo stato REALE, non quello desiderato: la
  // classificazione (role/costType) dei dati è corretta (verificato nei test
  // sopra), ma isGuideScenarioRow — logica condivisa in
  // templates/cost-guide-price-model.ts, esplicitamente FUORI perimetro in
  // questa revisione (solo dati/contenuti di rifare-tetto) — riconosce uno
  // scenario/primary solo con `unit === "a corpo"`. rifare-tetto usa "al mq"
  // (l'unico corretto per un tetto: il prezzo scala sempre con la
  // superficie). Risultato: le sezioni "Scenari"/"Cosa comprende" del
  // template NON si attivano oggi, tutte le righe restano nel breakdown. Se
  // in futuro isGuideScenarioRow viene generalizzato per accettare anche
  // "al mq", questo assert andrà aggiornato di conseguenza — è il segnale
  // voluto per accorgersene.
  const classification = classifyPriceRows(rifareTettoGuide.priceRows)

  assert.equal(classification.primary, null)
  assert.equal(classification.scenarios.length, 0)
  assert.equal(classification.scenarioCards.length, 0)
  assert.equal(classification.breakdown.length, 8)
})

test("rifare-tetto: isolamento termico 50-120 €/mq, lavorazione autonoma (non scenario)", () => {
  const isolamento = rifareTettoGuide.priceRows.find((r) => r.id === "tetto-isolamento-coibentazione")

  assert.equal(isolamento?.label, "Isolamento termico del tetto")
  assert.equal(isolamento?.range, "da 50 € a 120 € al mq")
  assert.equal(isolamento?.costType, "complete")
  assert.notEqual(isolamento?.role, "scenario")
  assert.match(isolamento?.plainExplanation ?? "", /coibentazione/i) // termine tecnico mantenuto come sinonimo
})

test("rifare-tetto: rimozione e smaltimento 15-30 €/mq, includedIn il rifacimento standard, amianto/eternit escluso ed esplicitamente non prezzato", () => {
  const rows = rifareTettoGuide.priceRows
  const smaltimento = rows.find((r) => r.id === "tetto-smaltimento-copertura")

  assert.equal(smaltimento?.label, "Rimozione e smaltimento del vecchio manto")
  assert.equal(smaltimento?.range, "da 15 € a 30 € al mq")
  assert.equal(smaltimento?.costType, "work")
  assert.deepEqual(smaltimento?.relations, [
    { type: "includedIn", target: "tetto-rifacimento-copertura" },
  ])
  // L'id target esiste davvero nella stessa famiglia (oltre alla verifica
  // globale già fatta da validatePriceRowIntegrity al caricamento del modulo).
  assert.ok(rows.some((r) => r.id === smaltimento?.relations?.[0]?.target))

  // Amianto/eternit citato come ESCLUSO, mai con un prezzo o un range.
  assert.match(smaltimento?.excludes ?? "", /amianto/i)
  assert.match(smaltimento?.note ?? "", /amianto/i)
})

test("rifare-tetto: nessuna riga della guida assegna un prezzo/range ad amianto, eternit o danni strutturali eccezionali", () => {
  for (const row of rifareTettoGuide.priceRows) {
    assert.doesNotMatch(
      row.label,
      /amianto|eternit/i,
      `"${row.id}" non deve essere una PriceRow dedicata ad amianto/eternit`,
    )
  }
})

test("rifare-tetto: grondaie 40-120 €/ml, fornitura e posa", () => {
  const grondaie = rifareTettoGuide.priceRows.find((r) => r.id === "tetto-grondaie-lattoneria")

  assert.equal(grondaie?.label, "Grondaie — fornitura e posa")
  assert.equal(grondaie?.unit, "al metro lineare")
  assert.equal(grondaie?.range, "da 40 € a 120 € al metro lineare")
  assert.equal(grondaie?.costType, "complete")
})

test("rifare-tetto: ponteggio 15-30 €/mq DI FACCIATA (non dei mq del tetto), accessibilità resta un fattore e non una PriceRow", () => {
  const ponteggio = rifareTettoGuide.priceRows.find((r) => r.id === "tetto-ponteggi-accessibilita")

  assert.equal(ponteggio?.label, "Ponteggio standard")
  assert.equal(ponteggio?.unit, "al mq di facciata")
  assert.equal(ponteggio?.range, "da 15 € a 30 € al mq di facciata")
  assert.equal(ponteggio?.costType, "work")

  // Nessuna riga a sé per "accessibilità": resta un fattore qualitativo.
  assert.ok(!rifareTettoGuide.priceRows.some((r) => /^accessibilit/i.test(r.label)))
  assert.ok(rifareTettoGuide.factors.some((f) => /accessibilit/i.test(f)))
})

test("rifare-tetto: nessuna relation rotta — ogni target esiste nella stessa famiglia (ridondante rispetto a validatePriceRowIntegrity, verificato di nuovo qui sui dati composti reali)", () => {
  const rows = rifareTettoGuide.priceRows
  const ids = new Set(rows.map((r) => r.id))

  for (const row of rows) {
    for (const relation of row.relations ?? []) {
      assert.ok(
        ids.has(relation.target),
        `"${row.id}" -> relation "${relation.type}" punta a un id inesistente "${relation.target}"`,
      )
    }
  }
})

test("altre Cost Guide: nessuna modifica — ristrutturareBagnoGuide resta a 18 priceRows con gli stessi id/range già verificati sopra", () => {
  assert.equal(ristrutturareBagnoGuide.priceRows.length, 18)
  assert.equal(
    ristrutturareBagnoGuide.priceRows.find((r) => r.id === "bagno-ristrutturazione-completa")?.range,
    "da 4.500 € a 8.000 €",
  )
})

// Revisione 2026-08 di impermeabilizzare-tetto — dati REALI (guida composta),
// non fixture sintetiche: la guida passa da 10 righe "official" puntuali
// (nationalRange "nessun totale complessivo") a 8 righe cliente con fasce
// editoriali "mixed" e una risposta Hero reale (25-60 €/mq).

test("impermeabilizzare-tetto: esattamente 8 PriceRow (da 10), tutte con un id univoco reale", () => {
  assert.equal(impermeabilizzareTettoGuide.priceRows.length, 8)
  assert.equal(new Set(impermeabilizzareTettoGuide.priceRows.map((r) => r.id)).size, 8)
})

test("impermeabilizzare-tetto: Hero 25-60 €/mq, non più \"nessun totale complessivo\"", () => {
  assert.equal(impermeabilizzareTettoGuide.nationalRange, "25–60 € al mq")
  assert.equal(impermeabilizzareTettoGuide.pricePerSquareMeter, "da 25 € a 60 € al mq")
  assert.doesNotMatch(impermeabilizzareTettoGuide.nationalRange ?? "", /nessun totale/i)
  assert.doesNotMatch(impermeabilizzareTettoGuide.nationalRangeNote ?? "", /consulta la tabella/i)
})

test("impermeabilizzare-tetto: le 5 nuove impermeabilizzazioni sono tutte materiale + posa (costType complete), fasce approvate", () => {
  const rows = impermeabilizzareTettoGuide.priceRows
  const byId = (id: string) => rows.find((r) => r.id === id)

  const liscia = byId("impermeabilizzare-tetto-guaina-liscia")
  assert.equal(liscia?.label, "Guaina bituminosa standard (liscia)")
  assert.equal(liscia?.range, "da 25 € a 40 € al mq")
  assert.equal(liscia?.costType, "complete")
  assert.match(liscia?.includes ?? "", /posa/i)

  const ardesiata = byId("impermeabilizzare-tetto-guaina-ardesiata")
  assert.equal(ardesiata?.label, "Guaina ardesiata per copertura a vista")
  assert.equal(ardesiata?.range, "da 30 € a 50 € al mq")
  assert.equal(ardesiata?.costType, "complete")

  const doppioStrato = byId("impermeabilizzare-tetto-membrana-standard")
  assert.equal(doppioStrato?.label, "Impermeabilizzazione bituminosa a doppio strato")
  assert.equal(doppioStrato?.range, "da 35 € a 55 € al mq")
  assert.equal(doppioStrato?.costType, "complete")

  const alluminio = byId("impermeabilizzare-tetto-doppia-membrana-alluminio")
  assert.equal(alluminio?.label, "Doppia guaina con protezione in alluminio")
  assert.equal(alluminio?.range, "da 45 € a 60 € al mq")
  assert.equal(alluminio?.costType, "complete")

  const rame = byId("impermeabilizzare-tetto-doppia-membrana-rame")
  assert.equal(rame?.label, "Doppia guaina con protezione in rame")
  assert.equal(rame?.range, "da 75 € a 90 € al mq")
  assert.equal(rame?.costType, "complete")

  // Le 5 righe sopra hanno tutte unit "al mq" e costType "complete": nessuna
  // riga soddisfa isGuideScenarioRow (richiede unit "a corpo"), ma qui non è
  // un problema — nessuna di queste è pensata come scenario/primary.
  for (const id of [
    "impermeabilizzare-tetto-guaina-liscia",
    "impermeabilizzare-tetto-guaina-ardesiata",
    "impermeabilizzare-tetto-membrana-standard",
    "impermeabilizzare-tetto-doppia-membrana-alluminio",
    "impermeabilizzare-tetto-doppia-membrana-rame",
  ]) {
    const row = byId(id)
    assert.equal(row?.unit, "al mq")
    assert.equal(row?.role, undefined, `${id}: role deve restare assente (default primary)`)
  }
})

test("impermeabilizzare-tetto: unificazione rame — un solo id cliente sopravvive, l'altro è rimosso senza reference rotte", () => {
  const rows = impermeabilizzareTettoGuide.priceRows

  // Micro-fix: l'id NON deve più portare la specificità "-4kg" — la riga
  // rappresenta ora l'intera fascia rame unificata, non solo quella
  // grammatura (altrimenti l'id ristretto avrebbe silenziosamente mentito
  // sul perimetro reale della riga).
  assert.ok(rows.some((r) => r.id === "impermeabilizzare-tetto-doppia-membrana-rame"))
  assert.ok(!rows.some((r) => r.id === "impermeabilizzare-tetto-doppia-membrana-rame-4kg"))
  assert.ok(!rows.some((r) => r.id === "impermeabilizzare-tetto-doppia-membrana-rame-4-5kg"))

  // Entrambe le grammature restano citate come riferimento tecnico in nota,
  // nessuna delle due sparisce dai dati, solo dalla UI come voci separate.
  const rame = rows.find((r) => r.id === "impermeabilizzare-tetto-doppia-membrana-rame")
  assert.match(rame?.note ?? "", /4 kg\/m²/)
  assert.match(rame?.note ?? "", /4,5 kg\/m²/)
})

test("impermeabilizzare-tetto: preparazione 10-20 €/mq è una lavorazione autonoma (role assente), non \"extra\"", () => {
  const preparazione = impermeabilizzareTettoGuide.priceRows.find(
    (r) => r.id === "impermeabilizzare-tetto-lisciatura-piano-posa",
  )

  assert.equal(preparazione?.label, "Preparazione e livellamento della superficie")
  assert.equal(preparazione?.range, "da 10 € a 20 € al mq")
  // Micro-fix: role "extra" rimosso — non è un incremento legato a UN
  // pacchetto specifico (a differenza di es. bagno-adeguamento-elettrico,
  // addsTo verso un unico target reale), è una lavorazione autonoma con
  // perimetro proprio, condizionale nell'uso ma non nel modello — stesso
  // trattamento di "Rimozione e smaltimento" qui sotto. Nessuna relation
  // addsTo inventata verso le 5 guaine per "riempire" il ruolo extra.
  assert.equal(preparazione?.role, undefined)
  assert.equal(preparazione?.relations, undefined)
  assert.equal(preparazione?.costType, "work")
  assert.match(preparazione?.plainExplanation ?? "", /non è automaticamente necessaria/i)
})

test("impermeabilizzare-tetto: rimozione e smaltimento 10-20 €/mq, id rinominato, sostituisce l'informazione principale del vecchio prezzo a peso", () => {
  const rows = impermeabilizzareTettoGuide.priceRows

  // Micro-fix: id rinominato — "-conferimento-guaina" descriveva solo il
  // conferimento a peso, non il nuovo perimetro cliente più ampio
  // (rimozione+movimentazione+trasporto+smaltimento).
  assert.ok(!rows.some((r) => r.id === "impermeabilizzare-tetto-conferimento-guaina"))
  const rimozione = rows.find((r) => r.id === "impermeabilizzare-tetto-rimozione-smaltimento-guaina")

  assert.equal(rimozione?.label, "Rimozione e smaltimento della vecchia guaina")
  assert.equal(rimozione?.range, "da 10 € a 20 € al mq")
  assert.equal(rimozione?.unit, "al mq")
  assert.equal(rimozione?.costType, "work")
  // Il vecchio prezzo a peso resta come riferimento tecnico in nota, non più
  // come range/unit principale della riga.
  assert.match(rimozione?.note ?? "", /19,53/)
  assert.doesNotMatch(rimozione?.unit ?? "", /100 kg/)

  // Micro-fix: provenance esplicita — il prezzario ufficiale copre SOLO il
  // conferimento a peso, non la manodopera di rimozione: la fascia al mq è
  // dichiarata come stima editoriale, non spacciata per un secondo valore
  // ufficiale, con un confronto di plausibilità verso la fascia analoga di
  // rifare-tetto.
  assert.match(rimozione?.note ?? "", /stima editoriale/i)
  assert.match(rimozione?.note ?? "", /non è direttamente quotata da nessun prezzario/i)
  assert.match(rimozione?.note ?? "", /15–30 €\/mq/)

  // Regressione trovata in QA visiva: "materiali" dentro excludes fa
  // scattare per costruzione il badge "Materiali esclusi" su costType
  // "work" (describeCostTypeBadge) — fuorviante qui, dove il perimetro
  // escluso è amianto/eternit come RIFIUTO speciale, non fornitura. La
  // parola scelta in excludes deve restare "rifiuti", non "materiali".
  assert.doesNotMatch(rimozione?.excludes ?? "", /materiali/i)
  assert.equal(describeCostTypeBadge(rimozione), null)
})

test("impermeabilizzare-tetto: perdita localizzata è quoteRequired, unifica le due vecchie voci puntuali senza promettere 56,56/82,63 come prezzo di mercato", () => {
  const rows = impermeabilizzareTettoGuide.priceRows
  const perdita = rows.find((r) => r.id === "impermeabilizzare-tetto-ricerca-infiltrazione")

  assert.equal(perdita?.label, "Ricerca e riparazione di una perdita localizzata")
  assert.equal(perdita?.unit, "a intervento")
  assert.equal(perdita?.priceStatus, "quoteRequired")
  assert.doesNotMatch(perdita?.range ?? "", /€/) // range qualitativo, nessun numero promesso come prezzo cliente

  // id della voce unificata/rimossa non deve più esistere.
  assert.ok(!rows.some((r) => r.id === "impermeabilizzare-tetto-riparazione-manto-fessurato"))

  // I due valori puntuali del prezzario restano citati come riferimento
  // tecnico in nota, non persi.
  assert.match(perdita?.note ?? "", /56,56/)
  assert.match(perdita?.note ?? "", /82,63/)
})

test("impermeabilizzare-tetto: nessuna relation rotta, sourceType è ora \"mixed\" (fasce editoriali, non più prezzi puntuali \"official\")", () => {
  const rows = impermeabilizzareTettoGuide.priceRows
  const ids = new Set(rows.map((r) => r.id))

  for (const row of rows) {
    for (const relation of row.relations ?? []) {
      assert.ok(ids.has(relation.target), `"${row.id}" -> relation punta a un id inesistente "${relation.target}"`)
    }
  }

  assert.equal(impermeabilizzareTettoGuide.sourceType, "mixed")
})

test("altre Cost Guide: nessuna modifica — rifareTettoGuide resta a 8 priceRows con lo scenario standard 120-180 €/mq già verificato", () => {
  assert.equal(rifareTettoGuide.priceRows.length, 8)
  assert.equal(
    rifareTettoGuide.priceRows.find((r) => r.id === "tetto-rifacimento-copertura")?.range,
    "da 120 € a 180 € al mq",
  )
})
