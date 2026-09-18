import { NextResponse } from "next/server";

import {
  normalizeGuideSlug,
  recordGuideHelpfulnessVote,
  updateGuideHelpfulnessVoteComment,
} from "@esigenta/domain";
import { getCostGuideBySlug } from "../../../../site/seo/pages/costi";

async function getEnabledPayload(request: Request): Promise<
  | { body: Record<string, unknown> }
  | { response: NextResponse }
> {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return {
      response: NextResponse.json(
        { error: "Invalid request payload", code: "invalid_json_payload" },
        { status: 400 },
      ),
    };
  }

  const guideSlug = normalizeGuideSlug(body.guideSlug);
  if (!guideSlug) {
    return {
      response: NextResponse.json(
        { error: "guideSlug is required and must be valid", code: "invalid_guide_slug" },
        { status: 400 },
      ),
    };
  }

  if (!getCostGuideBySlug(guideSlug)) {
    return {
      response: NextResponse.json(
        { error: "Cost guide not found", code: "guide_not_found" },
        { status: 404 },
      ),
    };
  }

  return { body };
}

export async function POST(request: Request) {
  const payload = await getEnabledPayload(request);
  if ("response" in payload) return payload.response;

  const result = await recordGuideHelpfulnessVote(payload.body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json({ outcome: result.outcome }, { status: 202 });
}

export async function PATCH(request: Request) {
  const payload = await getEnabledPayload(request);
  if ("response" in payload) return payload.response;

  const result = await updateGuideHelpfulnessVoteComment(payload.body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: result.status },
    );
  }

  if (result.outcome === "not_found") {
    return NextResponse.json(
      { error: "A vote is required before adding a comment", code: "vote_not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ outcome: result.outcome }, { status: 200 });
}
