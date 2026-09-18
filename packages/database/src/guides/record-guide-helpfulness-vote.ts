import { Prisma } from "@prisma/client";

import { prisma } from "../client";

export type RecordGuideHelpfulnessVoteInput = {
  guideSlug: string;
  anonymousSessionId: string;
  response: "yes" | "no";
};

export type RecordGuideHelpfulnessVoteOutcome = "created" | "duplicate";

export type UpdateGuideHelpfulnessVoteCommentInput = {
  guideSlug: string;
  anonymousSessionId: string;
  comment: string;
};

export type UpdateGuideHelpfulnessVoteCommentOutcome = "updated" | "not_found";

/** The only write path for GuideHelpfulnessVote rows. */
export async function recordGuideHelpfulnessVote(
  input: RecordGuideHelpfulnessVoteInput,
): Promise<RecordGuideHelpfulnessVoteOutcome> {
  try {
    await prisma.guideHelpfulnessVote.create({ data: input });
    return "created";
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return "duplicate";
    }

    throw error;
  }
}

/**
 * Adds optional qualitative feedback to the existing anonymous vote. It never
 * creates a second vote and therefore preserves the unique vote constraint.
 */
export async function updateGuideHelpfulnessVoteComment(
  input: UpdateGuideHelpfulnessVoteCommentInput,
): Promise<UpdateGuideHelpfulnessVoteCommentOutcome> {
  const result = await prisma.guideHelpfulnessVote.updateMany({
    where: {
      guideSlug: input.guideSlug,
      anonymousSessionId: input.anonymousSessionId,
    },
    data: { comment: input.comment },
  });

  return result.count === 1 ? "updated" : "not_found";
}
