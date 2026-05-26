export const REQUEST_PHOTO_MAX_FILES = 5

export const REQUEST_PHOTO_MAX_SIZE_BYTES =
  5 * 1024 * 1024

export const REQUEST_PHOTO_MAX_SIZE_LABEL =
  "5 MB"

export const REQUEST_PHOTO_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export const REQUEST_PHOTO_ACCEPT =
  REQUEST_PHOTO_ALLOWED_MIME_TYPES.join(",")

const REQUEST_PHOTO_MAX_FILE_NAME_LENGTH =
  255

export type RequestPhotoMimeType =
  (typeof REQUEST_PHOTO_ALLOWED_MIME_TYPES)[number]

export type RequestPhotoMetadata = {
  uploadId: string
  fileKey: string
  fileName: string
  mimeType: RequestPhotoMimeType
  sizeBytes: number
}

export type RequestPhotoFileValidationError =
  | "empty_file"
  | "invalid_file_name"
  | "too_large"
  | "unsupported_type"

export type RequestPhotoAnswerValidationError =
  | "duplicate_photo"
  | "invalid_shape"
  | "too_many_photos"

export type RequestPhotoAnswerValidationResult =
  | {
      ok: true
      photos: RequestPhotoMetadata[]
    }
  | {
      ok: false
      error: RequestPhotoAnswerValidationError
    }

type RequestPhotoFileCandidate = {
  fileName: string
  mimeType: string
  sizeBytes: number
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value),
  )
}

function readNonEmptyString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()

  return normalized || null
}

export function isRequestPhotoMimeType(
  value: unknown,
): value is RequestPhotoMimeType {
  return (
    typeof value === "string" &&
    REQUEST_PHOTO_ALLOWED_MIME_TYPES.some(
      (mimeType) =>
        mimeType === value,
    )
  )
}

export function validateRequestPhotoFile({
  fileName,
  mimeType,
  sizeBytes,
}: RequestPhotoFileCandidate): RequestPhotoFileValidationError | null {
  const normalizedFileName =
    fileName.trim()

  if (
    !normalizedFileName ||
    normalizedFileName.length >
      REQUEST_PHOTO_MAX_FILE_NAME_LENGTH
  ) {
    return "invalid_file_name"
  }

  if (!isRequestPhotoMimeType(mimeType)) {
    return "unsupported_type"
  }

  if (
    !Number.isInteger(sizeBytes) ||
    sizeBytes <= 0
  ) {
    return "empty_file"
  }

  if (
    sizeBytes >
    REQUEST_PHOTO_MAX_SIZE_BYTES
  ) {
    return "too_large"
  }

  return null
}

export function readRequestPhotoMetadata(
  value: unknown,
): RequestPhotoMetadata | null {
  if (!isRecord(value)) {
    return null
  }

  const uploadId =
    readNonEmptyString(value.uploadId)

  const fileKey =
    readNonEmptyString(value.fileKey)

  const fileName =
    readNonEmptyString(value.fileName)

  const sizeBytes =
    value.sizeBytes

  if (
    !uploadId ||
    !fileKey ||
    !fileName ||
    !isRequestPhotoMimeType(
      value.mimeType,
    ) ||
    typeof sizeBytes !== "number" ||
    validateRequestPhotoFile({
      fileName,
      mimeType: value.mimeType,
      sizeBytes,
    })
  ) {
    return null
  }

  return {
    uploadId,
    fileKey,
    fileName,
    mimeType: value.mimeType,
    sizeBytes,
  }
}

export function validateRequestPhotoAnswer(
  value: unknown,
): RequestPhotoAnswerValidationResult {
  if (
    value === undefined ||
    value === null
  ) {
    return {
      ok: true,
      photos: [],
    }
  }

  if (!Array.isArray(value)) {
    return {
      ok: false,
      error: "invalid_shape",
    }
  }

  if (
    value.length >
    REQUEST_PHOTO_MAX_FILES
  ) {
    return {
      ok: false,
      error: "too_many_photos",
    }
  }

  const uploadIds = new Set<string>()
  const fileKeys = new Set<string>()
  const photos: RequestPhotoMetadata[] = []

  for (const item of value) {
    const photo =
      readRequestPhotoMetadata(item)

    if (!photo) {
      return {
        ok: false,
        error: "invalid_shape",
      }
    }

    if (
      uploadIds.has(photo.uploadId) ||
      fileKeys.has(photo.fileKey)
    ) {
      return {
        ok: false,
        error: "duplicate_photo",
      }
    }

    uploadIds.add(photo.uploadId)
    fileKeys.add(photo.fileKey)
    photos.push(photo)
  }

  return {
    ok: true,
    photos,
  }
}

export function hasValidRequestPhotos(
  value: unknown,
): boolean {
  const result =
    validateRequestPhotoAnswer(value)

  return (
    result.ok &&
    result.photos.length > 0
  )
}
