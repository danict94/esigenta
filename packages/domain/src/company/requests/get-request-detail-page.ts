import type { CompanyActor } from "@esigenta/auth"

import {
  listAttachedRequestPhotos,
  type AttachedRequestPhoto,
} from "../../internal/request/request-photos"
import {
  buildSharedRequestDetailReadModel,
  type SharedRequestDetailReadModel,
} from "./request-detail-read-model"
import { resolveCompanyRequestDetailCore } from "./resolve-request-detail-core"

type PerfRecorder = (operation: string, durationMs: number) => void

async function measureAsync<T>(
  operation: string,
  recordPerf: PerfRecorder | undefined,
  task: () => Promise<T>,
): Promise<T> {
  if (!recordPerf) return task()
  const start = performance.now()
  try {
    return await task()
  } finally {
    recordPerf(operation, Math.round(performance.now() - start))
  }
}

export type FullRequestDetail = SharedRequestDetailReadModel & {
  photoCount: number
  photos: AttachedRequestPhoto[]
}

// The base request read (resolveCompanyRequestDetailCore) already carries
// photoCount from a Prisma _count projection, so this is a pure decision —
// no extra exists/count query is ever issued to learn it.
export function shouldLoadRequestPhotos(photoCount: number): boolean {
  return photoCount > 0
}

export type GetCompanyFullRequestDetailResult =
  | { ok: true; detail: FullRequestDetail }
  | { ok: false; code: "not_found"; message: string }

export async function getCompanyFullRequestDetail(
  actor: CompanyActor,
  requestId: string,
  creditBalance: number,
  recordPerf?: PerfRecorder,
): Promise<GetCompanyFullRequestDetailResult> {
  const startedAt = performance.now()
  const normalizedRequestId = requestId.trim()

  if (!normalizedRequestId) {
    return { ok: false, code: "not_found", message: "Richiesta non trovata." }
  }

  const coreResult = await resolveCompanyRequestDetailCore(
    actor,
    normalizedRequestId,
    recordPerf,
  )

  if (!coreResult.ok) return coreResult

  const photoCount = coreResult.request.photoCount
  const photos = shouldLoadRequestPhotos(photoCount)
    ? await measureAsync("detail-photos", recordPerf, () =>
        listAttachedRequestPhotos(normalizedRequestId),
      )
    : []

  recordPerf?.("detail-batch-total", Math.round(performance.now() - startedAt))

  return {
    ok: true,
    detail: {
      ...buildSharedRequestDetailReadModel({
        actor,
        request: coreResult.request,
        creditBalance,
      }),
      photoCount,
      photos,
    },
  }
}
