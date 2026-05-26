import {
  prisma,
} from "../prisma/client"

export type AttachedRequestPhoto = {
  fileKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export async function listAttachedRequestPhotos(
  requestId: string,
): Promise<AttachedRequestPhoto[]> {
  return prisma.requestPhoto.findMany({
    where: {
      requestId,
      status: "ATTACHED",
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 5,
    select: {
      fileKey: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
    },
  })
}
