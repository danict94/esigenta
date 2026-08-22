/**
 * Esigenta — Orphan RequestPhoto cleanup (FASE 7 FINAL §C)
 *
 * FOUNDATION
 *
 * Problem: every successful photo upload creates a RequestPhoto row with
 * status TEMPORARY, requestId null (see
 * apps/web/src/app/api/uploadthing/core.ts, storeUploadedRequestPhoto)
 * BEFORE the funnel is ever submitted. If the user abandons the funnel,
 * removes the photo client-side (request-photo-upload.tsx's removeItem
 * only touches React state, never the server/provider — FASE 7A audit),
 * or the submit fails, that row — and its file on the UploadThing
 * provider — has nothing that will ever clean it up on its own.
 *
 * This module is the cleanup: find TEMPORARY, unattached RequestPhoto
 * rows older than a conservative cutoff, delete the provider file, then
 * the DB row — never the other way around (see cleanupOrphanRequestPhotos
 * below for why). Never touches ATTACHED rows or rows with a requestId,
 * no matter how old.
 *
 * Triggered by a scheduled route (see
 * apps/web/src/app/api/cron/cleanup-orphan-photos/route.ts), which is the
 * only caller — this module itself knows nothing about HTTP, Vercel Cron,
 * or auth, exactly like every other packages/domain module.
 */

import { prisma } from "@esigenta/database"
import { deleteRequestPhotoFiles } from "@esigenta/uploads/server"

/** Conservative: comfortably longer than any realistic funnel session (FASE 6B's own funnelSessionId has no expiry, but a real user finishing a form in under 48h is the overwhelmingly common case). No existing SSOT for this value — chosen here, matching the FASE 7 FINAL default. */
const ORPHAN_PHOTO_CUTOFF_HOURS = 48

/** Bounded per run — the job is designed to be re-run (by its own schedule) rather than clear an unbounded backlog in one call. */
const CLEANUP_BATCH_SIZE = 50

export type CleanupOrphanRequestPhotosResult = {
  scanned: number
  deleted: number
  failed: number
}

/** Exported for unit testing (pure time math, no DB) — see cleanup-orphan-request-photos.test.ts. */
export function resolveCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - ORPHAN_PHOTO_CUTOFF_HOURS * 60 * 60 * 1000)
}

/**
 * One candidate at a time, deliberately not a single batched provider
 * call for the whole page: a failure on one file (network blip, one bad
 * key) must not block cleanup of the others in the same run, and must
 * leave ONLY that file's own DB row intact for a future retry — see the
 * module comment and FASE 7 FINAL report §4 ("Ordine di cleanup").
 *
 * Order within one candidate: provider delete FIRST, DB row delete ONLY
 * after the provider confirms success (deletedCount reflects reality,
 * or the file was already gone — both are `success: true`, see
 * deleteRequestPhotoFiles). Never the reverse: deleting the DB row first
 * would permanently lose the one piece of information (fileKey) needed
 * to ever clean up that file, if the provider call then failed.
 */
async function cleanupOneOrphanPhoto(candidate: {
  id: string
  fileKey: string
}): Promise<"deleted" | "failed"> {
  try {
    const result = await deleteRequestPhotoFiles([candidate.fileKey])

    if (!result.success) {
      return "failed"
    }

    await prisma.requestPhoto.delete({ where: { id: candidate.id } })

    return "deleted"
  } catch (error) {
    console.error("[cleanupOrphanRequestPhotos] failed to clean up one orphan photo", {
      requestPhotoId: candidate.id,
      errorName: error instanceof Error ? error.name : "UnknownError",
    })

    return "failed"
  }
}

/**
 * Idempotent and safe to re-run at any frequency: each run only ever
 * looks at rows that are STILL TEMPORARY, STILL unattached, and STILL
 * older than the cutoff at call time — a row cleaned up by a previous run
 * simply no longer matches the query, and a row that failed last time is
 * picked up again automatically (its createdAt never changes, so it
 * stays a candidate). No PII in the query, the result, or any log line
 * here — only cuids/fileKeys.
 */
export async function cleanupOrphanRequestPhotos(
  now: Date = new Date(),
): Promise<CleanupOrphanRequestPhotosResult> {
  const candidates = await prisma.requestPhoto.findMany({
    where: {
      status: "TEMPORARY",
      requestId: null,
      createdAt: { lt: resolveCutoff(now) },
    },
    select: { id: true, fileKey: true },
    orderBy: { createdAt: "asc" },
    take: CLEANUP_BATCH_SIZE,
  })

  let deleted = 0
  let failed = 0

  for (const candidate of candidates) {
    const outcome = await cleanupOneOrphanPhoto(candidate)

    if (outcome === "deleted") {
      deleted += 1
    } else {
      failed += 1
    }
  }

  return { scanned: candidates.length, deleted, failed }
}
