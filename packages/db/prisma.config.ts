import { config } from "dotenv"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, env } from "prisma/config"

const packageDir = dirname(fileURLToPath(import.meta.url))

config({
  path: resolve(packageDir, "../../.env"),
})

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
})
