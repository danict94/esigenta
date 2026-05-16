import {
  existsSync,
  readFileSync,
} from "node:fs"
import { resolve } from "node:path"

function loadEnvFile(path: string) {
  const envPath = resolve(path)

  if (!existsSync(envPath)) {
    return
  }

  const contents = readFileSync(envPath, "utf8")

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const separatorIndex = trimmed.indexOf("=")

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

async function main() {
  loadEnvFile(".env")

  const { prisma, generateUniqueRequestCode } =
    await import("../packages/db/src/index")

  let updatedCount = 0

  while (true) {
    const requests =
      await prisma.request.findMany({
        where: {
          requestCode: null,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 100,
        select: {
          id: true,
        },
      })

    if (requests.length === 0) {
      break
    }

    for (const request of requests) {
      const requestCode =
        await generateUniqueRequestCode(prisma)

      await prisma.request.update({
        where: {
          id: request.id,
        },
        data: {
          requestCode,
        },
      })

      updatedCount += 1
    }
  }

  console.log(
    `Backfill request codes completed. Updated ${updatedCount} request(s).`,
  )

  await prisma.$disconnect()
}

main().catch(async (error: unknown) => {
  console.error(error)

  const { prisma } = await import("../packages/db/src/index")
  await prisma.$disconnect()

  process.exit(1)
})
