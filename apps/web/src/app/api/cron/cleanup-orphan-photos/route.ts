import { NextResponse } from "next/server"

import { cleanupOrphanRequestPhotos } from "@esigenta/domain"

/**
 * FASE 7 FINAL (§C) — Vercel Cron target for orphan RequestPhoto cleanup
 * (see ../../../../../vercel.json for the schedule, and
 * packages/domain/src/public/requests/cleanup-orphan-request-photos.ts
 * for the actual cleanup logic — this route does nothing but
 * authenticate the trigger and call it).
 *
 * Auth: Vercel's own built-in cron authentication — when the CRON_SECRET
 * environment variable is set on this Vercel project, Vercel
 * automatically sends `Authorization: Bearer ${CRON_SECRET}` to the
 * configured path on every scheduled invocation. This route only checks
 * that header; no custom secret scheme, no new auth mechanism. Without
 * CRON_SECRET configured on the Vercel project, this route refuses every
 * request rather than silently allowing an unauthenticated trigger.
 *
 * GET, not POST: Vercel Cron always triggers with GET.
 */
export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    )
  }

  const authorization = request.headers.get("authorization")

  if (authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // No PII in the response, on principle — RequestPhoto never had any to
  // begin with, only counts.
  const result = await cleanupOrphanRequestPhotos()

  return NextResponse.json(result)
}
