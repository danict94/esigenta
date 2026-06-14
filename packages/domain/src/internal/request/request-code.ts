import { randomInt } from "node:crypto"
import { prisma } from "@esigenta/database"

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const CODE_LENGTH = 6
const MAX_ATTEMPTS = 10

type RequestCodeClient = Pick<typeof prisma, "request">

export function createRequestCode(): string {
  let code = ""
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += ALPHABET[randomInt(ALPHABET.length)]
  }
  return `REQ-${code}`
}

export async function generateUniqueRequestCode(
  client: RequestCodeClient = prisma,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const requestCode = createRequestCode()
    const existingRequest = await client.request.findFirst({
      where: { requestCode },
      select: { id: true },
    })
    if (!existingRequest) return requestCode
  }
  throw new Error(
    `Could not generate a unique request code after ${MAX_ATTEMPTS} attempts.`,
  )
}
