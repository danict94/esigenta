import assert from "node:assert/strict";
import test from "node:test";

import { idraulicaGroupLanding } from "./content";

test("la landing Idraulica mantiene l'ownership sul lavoro", () => {
  assert.equal(
    idraulicaGroupLanding.interventionsTitle,
    "Interventi di idraulica disponibili",
  );
  assert.equal(
    idraulicaGroupLanding.metaDescription,
    "Perdite d'acqua, scarichi otturati, sanitari e impianto idraulico bagno: trova il percorso giusto e richiedi preventivi per il lavoro di idraulica.",
  );
  assert.equal(
    idraulicaGroupLanding.h1,
    "Idraulica: scegli l'intervento giusto e confronta preventivi",
  );
  assert.equal(
    idraulicaGroupLanding.metaTitle,
    "Idraulica: interventi urgenti e preventivi",
  );
});
