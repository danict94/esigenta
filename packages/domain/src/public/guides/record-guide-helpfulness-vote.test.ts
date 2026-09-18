import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeAnonymousSessionId,
  normalizeGuideHelpfulnessComment,
  normalizeGuideHelpfulnessResponse,
  normalizeGuideSlug,
  recordGuideHelpfulnessVote,
  updateGuideHelpfulnessVoteComment,
} from "./record-guide-helpfulness-vote";

const VALID_SESSION_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

test("guide helpfulness: normalizza solo slug validi", () => {
  assert.equal(normalizeGuideSlug(" rifare-impianto-elettrico "), "rifare-impianto-elettrico");
  assert.equal(normalizeGuideSlug("Rifare-Impianto"), undefined);
  assert.equal(normalizeGuideSlug("rifare_impianto"), undefined);
});

test("guide helpfulness: accetta solo yes/no", () => {
  assert.equal(normalizeGuideHelpfulnessResponse("yes"), "yes");
  assert.equal(normalizeGuideHelpfulnessResponse("no"), "no");
  assert.equal(normalizeGuideHelpfulnessResponse("maybe"), undefined);
});

test("guide helpfulness: sessione anonima deve essere UUID", () => {
  assert.equal(normalizeAnonymousSessionId(VALID_SESSION_ID), VALID_SESSION_ID);
  assert.equal(normalizeAnonymousSessionId("not-a-uuid"), undefined);
});

test("guide helpfulness: commento opzionale è normalizzato e limitato", () => {
  assert.equal(normalizeGuideHelpfulnessComment("  Chiaro e utile.  "), "Chiaro e utile.");
  assert.equal(normalizeGuideHelpfulnessComment(""), undefined);
  assert.equal(normalizeGuideHelpfulnessComment("a".repeat(1001)), undefined);
});

test("guide helpfulness: payload non valido è rifiutato prima del DB", async () => {
  const result = await recordGuideHelpfulnessVote({
    guideSlug: "rifare-impianto-elettrico",
    anonymousSessionId: VALID_SESSION_ID,
    response: "maybe",
  });

  assert.equal(result.ok, false);
  assert.equal((result as { code: string }).code, "invalid_response");
});

test("guide helpfulness: commento non valido è rifiutato prima del DB", async () => {
  const result = await updateGuideHelpfulnessVoteComment({
    guideSlug: "rifare-impianto-elettrico",
    anonymousSessionId: VALID_SESSION_ID,
    comment: " ",
  });

  assert.equal(result.ok, false);
  assert.equal((result as { code: string }).code, "invalid_comment");
});
