import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

/**
 * Load env before importing Prisma/Auth.
 *
 * Priority:
 * 1. repo root .env
 * 2. packages/db/.env
 */
const rootEnvPath = resolve(process.cwd(), "../../.env");
const packageEnvPath = resolve(process.cwd(), ".env");

if (existsSync(rootEnvPath)) {
  config({
    path: rootEnvPath,
  });
}

if (existsSync(packageEnvPath)) {
  config({
    path: packageEnvPath,
    override: false,
  });
}

/**
 * Super admin bootstrap.
 *
 * Required env:
 * - FIXPRO_SUPER_ADMIN_EMAIL
 * - FIXPRO_SUPER_ADMIN_PASSWORD
 *
 * Optional env:
 * - FIXPRO_SUPER_ADMIN_NAME
 *
 * Command:
 * pnpm --filter @esigenta/db seed:auth
 */
const DEFAULT_SUPER_ADMIN_NAME =
  "Esigenta Super Admin";

function requireEnvValue(
  name: string,
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function ensureSuperAdmin() {
  const [{ auth }, { prisma }] =
    await Promise.all([
      import("../src/auth/core"),
      import("../src/prisma/client"),
    ]);

  const email = requireEnvValue(
    "FIXPRO_SUPER_ADMIN_EMAIL",
  ).toLowerCase();

  const password = requireEnvValue(
    "FIXPRO_SUPER_ADMIN_PASSWORD",
  );

  const name =
    process.env.FIXPRO_SUPER_ADMIN_NAME?.trim() ||
    DEFAULT_SUPER_ADMIN_NAME;

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    });

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;

    console.log("Auth user already exists.");
  } else {
    const result =
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });

    const createdUserId =
      result?.user?.id;

    if (!createdUserId) {
      throw new Error(
        "Better Auth signUpEmail did not return a user id.",
      );
    }

    userId = createdUserId;

    console.log("Created auth user.");
  }

  const adminProfile =
    await prisma.adminProfile.upsert({
      where: {
        userId,
      },
      update: {
        role: "SUPER_ADMIN",
      },
      create: {
        user: {
          connect: {
            id: userId,
          },
        },
        role: "SUPER_ADMIN",
      },
      select: {
        id: true,
        userId: true,
        role: true,
      },
    });

  console.log(
    `SUPER_ADMIN ready (${adminProfile.role}).`,
  );

  await prisma.$disconnect();
}

ensureSuperAdmin().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
