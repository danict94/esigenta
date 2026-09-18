import {
  recordGuideHelpfulnessVote as writeGuideHelpfulnessVote,
  updateGuideHelpfulnessVoteComment as writeGuideHelpfulnessVoteComment,
} from "@esigenta/database";

const GUIDE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ANONYMOUS_SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GUIDE_HELPFULNESS_COMMENT_MAX_LENGTH = 1_000;

export const GUIDE_HELPFULNESS_RESPONSES = ["yes", "no"] as const;
export type GuideHelpfulnessResponse = (typeof GUIDE_HELPFULNESS_RESPONSES)[number];

export type RecordGuideHelpfulnessVoteInput = Record<string, unknown>;
export type UpdateGuideHelpfulnessVoteCommentInput = Record<string, unknown>;

export type RecordGuideHelpfulnessVoteResult =
  | { ok: true; outcome: "created" | "duplicate" }
  | { ok: false; status: 400; error: string; code: "invalid_guide_slug" | "invalid_anonymous_session_id" | "invalid_response" };

export type UpdateGuideHelpfulnessVoteCommentResult =
  | { ok: true; outcome: "updated" | "not_found" }
  | {
      ok: false;
      status: 400;
      error: string;
      code: "invalid_guide_slug" | "invalid_anonymous_session_id" | "invalid_comment";
    };

export function normalizeGuideSlug(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized.length <= 128 && GUIDE_SLUG_PATTERN.test(normalized)
    ? normalized
    : undefined;
}

export function normalizeAnonymousSessionId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return ANONYMOUS_SESSION_ID_PATTERN.test(normalized) ? normalized : undefined;
}

export function normalizeGuideHelpfulnessResponse(
  value: unknown,
): GuideHelpfulnessResponse | undefined {
  return typeof value === "string" &&
    (GUIDE_HELPFULNESS_RESPONSES as readonly string[]).includes(value)
    ? (value as GuideHelpfulnessResponse)
    : undefined;
}

export function normalizeGuideHelpfulnessComment(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= GUIDE_HELPFULNESS_COMMENT_MAX_LENGTH
    ? normalized
    : undefined;
}

/** Validates one first-party guide-helpfulness vote before its DB write. */
export async function recordGuideHelpfulnessVote(
  body: RecordGuideHelpfulnessVoteInput,
): Promise<RecordGuideHelpfulnessVoteResult> {
  const guideSlug = normalizeGuideSlug(body.guideSlug);
  if (!guideSlug) {
    return { ok: false, status: 400, error: "guideSlug is required and must be valid", code: "invalid_guide_slug" };
  }

  const anonymousSessionId = normalizeAnonymousSessionId(body.anonymousSessionId);
  if (!anonymousSessionId) {
    return { ok: false, status: 400, error: "anonymousSessionId is required and must be valid", code: "invalid_anonymous_session_id" };
  }

  const response = normalizeGuideHelpfulnessResponse(body.response);
  if (!response) {
    return { ok: false, status: 400, error: "response must be yes or no", code: "invalid_response" };
  }

  const outcome = await writeGuideHelpfulnessVote({
    guideSlug,
    anonymousSessionId,
    response,
  });

  return { ok: true, outcome };
}

/** Validates and appends an optional comment to the existing vote only. */
export async function updateGuideHelpfulnessVoteComment(
  body: UpdateGuideHelpfulnessVoteCommentInput,
): Promise<UpdateGuideHelpfulnessVoteCommentResult> {
  const guideSlug = normalizeGuideSlug(body.guideSlug);
  if (!guideSlug) {
    return {
      ok: false,
      status: 400,
      error: "guideSlug is required and must be valid",
      code: "invalid_guide_slug",
    };
  }

  const anonymousSessionId = normalizeAnonymousSessionId(body.anonymousSessionId);
  if (!anonymousSessionId) {
    return {
      ok: false,
      status: 400,
      error: "anonymousSessionId is required and must be valid",
      code: "invalid_anonymous_session_id",
    };
  }

  const comment = normalizeGuideHelpfulnessComment(body.comment);
  if (!comment) {
    return {
      ok: false,
      status: 400,
      error: `comment is required and must be at most ${GUIDE_HELPFULNESS_COMMENT_MAX_LENGTH} characters`,
      code: "invalid_comment",
    };
  }

  const outcome = await writeGuideHelpfulnessVoteComment({
    guideSlug,
    anonymousSessionId,
    comment,
  });

  return { ok: true, outcome };
}
