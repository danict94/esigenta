import { config } from "dotenv"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "prisma/config"

const packageDir = dirname(fileURLToPath(import.meta.url))

config({
  path: resolve(packageDir, "../../.env"),
})

const databaseUrl =
  process.env.DATABASE_URL?.trim() ||
  "postgresql://prisma:prisma@localhost:5432/prisma_generate"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
})
