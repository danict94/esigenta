import { randomInt } from "node:crypto"
import { prisma } from "@esigenta/database"

const MAX_ATTEMPTS = 10
const MAX_BASE_LENGTH = 60
const FALLBACK_BASE = "impresa"
const DIACRITICS_PATTERN = /[̀-ͯ]/g

type CompanySlugClient = Pick<typeof prisma, "company">

function slugifyBase(value: string): string {
  const base = value
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_BASE_LENGTH)
    .replace(/-+$/g, "")

  return base || FALLBACK_BASE
}

/**
 * Generates a unique publicSlug from a company's publicName. Only ever
 * called when a company has no publicSlug yet (see update-public-profile.ts)
 * — once assigned, a slug is permanent even if publicName changes later, so
 * any future public link built from it never breaks.
 */
export async function generateUniqueCompanyPublicSlug(
  publicName: string,
  client: CompanySlugClient = prisma,
): Promise<string> {
  const base = slugifyBase(publicName)

  const existing = await client.company.findUnique({
    where: { publicSlug: base },
    select: { id: true },
  })

  if (!existing) return base

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const candidate = `${base}-${randomInt(1000, 9999)}`

    const existingCandidate = await client.company.findUnique({
      where: { publicSlug: candidate },
      select: { id: true },
    })

    if (!existingCandidate) return candidate
  }

  throw new Error(
    `Could not generate a unique company public slug after ${MAX_ATTEMPTS} attempts.`,
  )
}
