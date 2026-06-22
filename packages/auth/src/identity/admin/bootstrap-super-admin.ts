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
  resolve(currentDir, "../../..")

const repoRoot =
  resolve(packageDir, "../..")

config({
  path: resolve(repoRoot, ".env"),
})

const DEFAULT_SUPER_ADMIN_NAME =
  "Esigenta Super Admin"

function requireEnvValue(name: string): string {
  const value =
    process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required.`)
  }

  return value
}

export async function bootstrapSuperAdmin() {
  const email =
    requireEnvValue(
      "ESIGENTA_SUPER_ADMIN_EMAIL",
    ).toLowerCase()

  const password =
    requireEnvValue(
      "ESIGENTA_SUPER_ADMIN_PASSWORD",
    )

  const name =
    process.env.ESIGENTA_SUPER_ADMIN_NAME?.trim() ||
    DEFAULT_SUPER_ADMIN_NAME

  const {
    prisma,
  } = await import("@esigenta/database")
  const {
    auth,
  } = await import("../../auth/core")

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    })

  let userId =
    existingUser?.id

  let userEmail =
    existingUser?.email

  let userCreated =
    false

  if (!userId) {
    try {
      const result =
        await auth.api.signUpEmail({
          body: {
            email,
            password,
            name,
          },
        })

      userId =
        result?.user?.id
      userEmail =
        result?.user?.email ?? email

      if (!userId) {
        throw new Error(
          "Better Auth signUpEmail did not return a user id.",
        )
      }

      userCreated = true
    } catch (error) {
      const userAfterCreateRace =
        await prisma.user.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
            email: true,
          },
        })

      if (!userAfterCreateRace) {
        throw error
      }

      userId =
        userAfterCreateRace.id
      userEmail =
        userAfterCreateRace.email
    }
  }

  const profileBefore =
    await prisma.adminProfile.findUnique({
      where: {
        userId,
      },
      select: {
        role: true,
      },
    })

  const adminProfile =
    await prisma.adminProfile.upsert({
      where: {
        userId,
      },
      update: {
        role: "SUPER_ADMIN",
      },
      create: {
        userId,
        role: "SUPER_ADMIN",
      },
      select: {
        role: true,
      },
    })

  return {
    email: userEmail ?? email,
    role: adminProfile.role,
    userCreated,
    changed:
      userCreated ||
      profileBefore?.role !== "SUPER_ADMIN",
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
