import { prisma } from "../client";

export type GuideHelpfulnessAggregates = {
  yes: number;
  no: number;
  total: number;
  helpfulRate: number;
};

/** Returns safe, unrounded aggregates for one guide; no votes yield zeroes. */
export async function getGuideHelpfulnessAggregates(
  guideSlug: string,
): Promise<GuideHelpfulnessAggregates> {
  const groups = await prisma.guideHelpfulnessVote.groupBy({
    by: ["response"],
    where: { guideSlug },
    _count: { _all: true },
  });

  const yes = groups.find((group) => group.response === "yes")?._count._all ?? 0;
  const no = groups.find((group) => group.response === "no")?._count._all ?? 0;
  const total = yes + no;

  return {
    yes,
    no,
    total,
    helpfulRate: total === 0 ? 0 : (yes / total) * 100,
  };
}
