import {
  UTApi,
} from "uploadthing/server"

import {
  REQUEST_PHOTO_MAX_FILES,
} from "./index"

const REQUEST_PHOTO_URL_TTL =
  "5 minutes"

const uploadthing =
  new UTApi({
    defaultKeyType: "fileKey",
  })

export type StoredRequestPhotoMetadata = {
  fileKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export type RequestPhotoDisplayItem = {
  src: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

/**
 * FASE 7 FINAL (§C) — the one provider-delete call used by the orphan
 * RequestPhoto cleanup (packages/domain/.../cleanup-orphan-request-photos.ts).
 * Reuses the same UTApi instance already constructed above for signed
 * URLs — no second client, no new dependency.
 *
 * Idempotent by the provider's own contract: deleting an already-deleted
 * or never-existed fileKey does not throw, it resolves with
 * `deletedCount: 0` — verified against uploadthing's own type
 * (`{ success: boolean; deletedCount: number }`). A thrown exception here
 * means a real failure (network, auth, provider outage) — the caller
 * treats `success !== true` the same way, as a real failure, and keeps
 * the DB record for the next run rather than deleting it out from under
 * a file that might still exist.
 */
export async function deleteRequestPhotoFiles(
  fileKeys: readonly string[],
): Promise<{ success: boolean; deletedCount: number }> {
  if (fileKeys.length === 0) {
    return { success: true, deletedCount: 0 }
  }

  return uploadthing.deleteFiles([...fileKeys])
}

export async function createRequestPhotoDisplayItems(
  photos: readonly StoredRequestPhotoMetadata[],
): Promise<RequestPhotoDisplayItem[]> {
  return Promise.all(
    photos
      .slice(
        0,
        REQUEST_PHOTO_MAX_FILES,
      )
      .map(async ({
        fileKey,
        ...photo
      }) => {
        const {
          ufsUrl,
        } =
          await uploadthing.generateSignedURL(
            fileKey,
            {
              expiresIn:
                REQUEST_PHOTO_URL_TTL,
            },
          )

        return {
          ...photo,
          src: ufsUrl,
        }
      }),
  )
}
