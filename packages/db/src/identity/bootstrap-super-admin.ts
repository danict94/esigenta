import {
  config,
} from "dotenv"

import {
  dirname,
  resolve,
} from "node:path"

import {
  fileURLToPath,
  pathToFileURL,
} from "node:url"

const currentDir =
  dirname(fileURLToPath(import.meta.url))

const packageDir =
  resolve(currentDir, "../..")

config({
  path: resolve(packageDir, "../../.env"),
})

export async function bootstrapSuperAdmin() {
  const email =
    process.env.ESIGENTA_SUPER_ADMIN_EMAIL?.trim()

  if (!email) {
    throw new Error(
      "ESIGENTA_SUPER_ADMIN_EMAIL is required.",
    )
  }

  const {
    prisma,
  } = await import("../prisma/client")

  const user =
    await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    })

  if (!user) {
    throw new Error(
      "Create/login the user first, then run bootstrap.",
    )
  }

  const existingProfile =
    await prisma.adminProfile.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        role: true,
      },
    })

  if (existingProfile) {
    if (existingProfile.role !== "SUPER_ADMIN") {
      await prisma.adminProfile.update({
        where: {
          id: existingProfile.id,
        },
        data: {
          role: "SUPER_ADMIN",
        },
      })
    }

    return {
      email: user.email,
      role: "SUPER_ADMIN" as const,
      changed:
        existingProfile.role !== "SUPER_ADMIN",
    }
  }

  await prisma.adminProfile.create({
    data: {
      userId: user.id,
      role: "SUPER_ADMIN",
    },
  })

  return {
    email: user.email,
    role: "SUPER_ADMIN" as const,
    changed: true,
  }
}

if (
  process.argv[1] &&
  import.meta.url ===
    pathToFileURL(process.argv[1]).href
) {
  bootstrapSuperAdmin()
    .then((result) => {
      console.log(
        `Super admin ready: ${result.email} (${result.role}).`,
      )
    })
    .catch((error: unknown) => {
      console.error(
        error instanceof Error
          ? error.message
          : String(error),
      )

      process.exitCode = 1
    })
}
