// Server-only: this module talks to Cloudflare R2 via the AWS S3-compatible
// SDK and reads server env vars. Never import this file from a "use client"
// component — mirrors the existing server.ts (UTApi) boundary in this
// package, just for a second, unrelated storage provider.

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const COMPANY_DOCUMENT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type CompanyDocumentMimeType =
  (typeof COMPANY_DOCUMENT_ALLOWED_MIME_TYPES)[number]

export function isCompanyDocumentMimeType(
  value: unknown,
): value is CompanyDocumentMimeType {
  return (
    typeof value === "string" &&
    COMPANY_DOCUMENT_ALLOWED_MIME_TYPES.some(
      (mimeType) => mimeType === value,
    )
  )
}

/**
 * 15 MB, not 5 MB like request photos: a scanned multi-page visura
 * camerale or DURC PDF routinely exceeds a single-photo limit. Still a
 * hard cap to keep uploads/storage predictable.
 */
export const COMPANY_DOCUMENT_MAX_SIZE_BYTES = 15 * 1024 * 1024

export const COMPANY_DOCUMENT_MAX_SIZE_LABEL = "15 MB"

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    // Never interpolate the value itself — only the env var name is safe
    // to surface in an error message.
    throw new Error(
      `${name} is required to use Cloudflare R2 storage.`,
    )
  }

  return value
}

let r2Client: S3Client | null = null

/**
 * Lazy singleton, same shape as getResendClient()/prisma's global client —
 * configured once from R2_* env vars, reused across calls in the same
 * process.
 */
export function getR2Client(): S3Client {
  r2Client ??= new S3Client({
    region: getRequiredEnv("R2_REGION"),
    endpoint: getRequiredEnv("R2_ENDPOINT"),
    credentials: {
      accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  })

  return r2Client
}

export type PutR2ObjectInput = {
  objectKey: string
  body: Uint8Array | Buffer | ReadableStream
  contentType: string
  sizeBytes?: number
  metadata?: Record<string, string>
}

export async function putR2Object({
  objectKey,
  body,
  contentType,
  sizeBytes,
  metadata,
}: PutR2ObjectInput): Promise<void> {
  const client = getR2Client()

  await client.send(
    new PutObjectCommand({
      Bucket: getRequiredEnv("R2_BUCKET_NAME"),
      Key: objectKey,
      Body: body,
      ContentType: contentType,
      ContentLength: sizeBytes,
      Metadata: metadata,
    }),
  )
}

export async function deleteR2Object(
  objectKey: string,
): Promise<void> {
  const client = getR2Client()

  await client.send(
    new DeleteObjectCommand({
      Bucket: getRequiredEnv("R2_BUCKET_NAME"),
      Key: objectKey,
    }),
  )
}

const R2_SIGNED_URL_DEFAULT_EXPIRES_SECONDS = 5 * 60

/**
 * Never persist the returned URL anywhere — generate it fresh on every
 * render/request that actually needs to display or download the document,
 * same discipline already used for request-photo signed URLs
 * (packages/uploads/src/server.ts).
 */
export async function createR2SignedDownloadUrl(
  objectKey: string,
  expiresInSeconds: number = R2_SIGNED_URL_DEFAULT_EXPIRES_SECONDS,
): Promise<string> {
  const client = getR2Client()

  const command = new GetObjectCommand({
    Bucket: getRequiredEnv("R2_BUCKET_NAME"),
    Key: objectKey,
  })

  return getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  })
}
