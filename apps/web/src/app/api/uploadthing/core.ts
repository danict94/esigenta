import {
  randomUUID,
} from "node:crypto"

import {
  storeUploadedRequestPhoto,
} from "@esigenta/domain"

import {
  REQUEST_PHOTO_MAX_FILES,
  REQUEST_PHOTO_MAX_SIZE_LABEL,
  readRequestPhotoMetadata,
  validateRequestPhotoFile,
} from "@esigenta/uploads"

import {
  createUploadthing,
  UTFiles,
} from "uploadthing/next"

import type {
  FileRouter,
} from "uploadthing/next"

import {
  UploadThingError,
} from "uploadthing/server"

import type {
  RequestPhotoFileValidationError,
  RequestPhotoMetadata,
} from "@esigenta/uploads"

const uploadthing =
  createUploadthing()

// UploadThing v7 config uses size buckets; middleware enforces the exact 5 MB limit.
const UPLOADTHING_IMAGE_SIZE_BUCKET =
  "8MB"

type UploadThingPhotoTypeConfig = {
  maxFileCount: number
  maxFileSize: typeof UPLOADTHING_IMAGE_SIZE_BUCKET
  acl: "public-read"
}

function createPhotoTypeConfig(): UploadThingPhotoTypeConfig {
  return {
    maxFileCount:
      REQUEST_PHOTO_MAX_FILES,
    maxFileSize:
      UPLOADTHING_IMAGE_SIZE_BUCKET,
    // Private ACLs require a paid UploadThing app; URLs are not persisted in request data.
    acl: "public-read",
  }
}

function getFileValidationMessage(
  error: RequestPhotoFileValidationError,
): string {
  switch (error) {
    case "too_large":
      return `Ogni foto deve pesare al massimo ${REQUEST_PHOTO_MAX_SIZE_LABEL}.`

    case "unsupported_type":
      return "Sono consentite solo immagini JPEG, PNG o WebP."

    case "empty_file":
      return "La foto selezionata e vuota."

    case "invalid_file_name":
      return "Il nome del file selezionato non e valido."
  }
}

function assertStoredMetadata(
  stored: RequestPhotoMetadata,
  uploaded: RequestPhotoMetadata,
) {
  if (
    stored.fileKey !== uploaded.fileKey ||
    stored.fileName !== uploaded.fileName ||
    stored.mimeType !== uploaded.mimeType ||
    stored.sizeBytes !== uploaded.sizeBytes
  ) {
    throw new UploadThingError(
      "Non siamo riusciti a registrare la foto caricata.",
    )
  }
}

export const requestPhotoFileRouter = {
  requestPhotoUploader: uploadthing(
    {
      "image/jpeg":
        createPhotoTypeConfig(),
      "image/png":
        createPhotoTypeConfig(),
      "image/webp":
        createPhotoTypeConfig(),
    },
    {
      awaitServerData: true,
    },
  )
    .middleware(({ files }) => {
      if (
        files.length >
        REQUEST_PHOTO_MAX_FILES
      ) {
        throw new UploadThingError(
          `Puoi caricare al massimo ${REQUEST_PHOTO_MAX_FILES} foto.`,
        )
      }

      for (const file of files) {
        const validationError =
          validateRequestPhotoFile({
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          })

        if (validationError) {
          throw new UploadThingError(
            getFileValidationMessage(
              validationError,
            ),
          )
        }
      }

      return {
        [UTFiles]: files.map(
          (file) => ({
            ...file,
            customId: randomUUID(),
          }),
        ),
      }
    })
    .onUploadComplete(async ({ file }) => {
      const uploadedPhoto =
        readRequestPhotoMetadata({
          uploadId: file.customId,
          fileKey: file.key,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        })

      if (!uploadedPhoto) {
        throw new UploadThingError(
          "Non siamo riusciti a verificare la foto caricata.",
        )
      }

      const storedPhoto =
        await storeUploadedRequestPhoto(
          uploadedPhoto,
        )

      const storedMetadata =
        readRequestPhotoMetadata(
          storedPhoto,
        )

      if (!storedMetadata) {
        throw new UploadThingError(
          "Non siamo riusciti a registrare la foto caricata.",
        )
      }

      assertStoredMetadata(
        storedMetadata,
        uploadedPhoto,
      )

      return uploadedPhoto
    }),
} satisfies FileRouter

export type RequestPhotoFileRouter =
  typeof requestPhotoFileRouter
