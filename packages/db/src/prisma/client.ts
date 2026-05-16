import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as typeof globalThis & {
  fixproPrisma?: PrismaClient
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to use @fixpro/db.")
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
  })
}

export const prisma =
  globalForPrisma.fixproPrisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.fixproPrisma = prisma
}
