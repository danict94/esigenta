import assert from "node:assert/strict"
import test from "node:test"

import {
  basePriceRangesByFamily,
  isAlternativeTo,
  validatePriceRowIntegrity,
} from "./base-price-ranges"

import type { BasePriceRange, PriceRow } from "./base-price-ranges"

import { ristrutturareBagnoGuide } from "../pages/costi/ristrutturare-bagno/content"

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
