import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as typeof globalThis & {
  esigentaPrisma?: PrismaClient
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to use @esigenta/db.")
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
  })
}

function getPrismaClient() {
  if (!globalForPrisma.esigentaPrisma) {
    globalForPrisma.esigentaPrisma =
      createPrismaClient()
  }

  return globalForPrisma.esigentaPrisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient()
    const value = Reflect.get(client, property)

    return typeof value === "function"
      ? value.bind(client)
      : value
  },
})
