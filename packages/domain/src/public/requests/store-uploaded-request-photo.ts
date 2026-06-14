import type {
  RequestPhotoMetadata,
} from "@esigenta/uploads"

import {
  prisma,
} from "@esigenta/database"

export type StoredUploadedRequestPhoto = {
  uploadId: string
  fileKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export async function storeUploadedRequestPhoto(
  uploadedPhoto: RequestPhotoMetadata,
): Promise<StoredUploadedRequestPhoto> {
  return prisma.requestPhoto.upsert({
    where: {
      uploadId:
        uploadedPhoto.uploadId,
    },
    update: {},
    create: uploadedPhoto,
    select: {
      uploadId: true,
      fileKey: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
    },
  })
}
