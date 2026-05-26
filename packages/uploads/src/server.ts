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
