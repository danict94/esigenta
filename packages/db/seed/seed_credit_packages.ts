import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

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

const creditPackages = [
  {
    name: "Base",
    description:
      "Pacchetto iniziale per provare FixPro e sbloccare le prime richieste.",
    credits: 60,
    priceCents: 6000,
    currency: "EUR",
    validityDays: 30,
    status: "ACTIVE",
    sortOrder: 10,
  },
  {
    name: "Crescita",
    description:
      "Più crediti e più tempo per seguire opportunità con maggiore convenienza.",
    credits: 180,
    priceCents: 15000,
    currency: "EUR",
    validityDays: 120,
    status: "ACTIVE",
    sortOrder: 20,
  },
  {
    name: "Pro Annuale",
    description:
      "Miglior valore per imprese attive che vogliono continuità nello sblocco richieste.",
    credits: 450,
    priceCents: 36000,
    currency: "EUR",
    validityDays: 365,
    status: "ACTIVE",
    sortOrder: 30,
  },
] as const;

async function seedCreditPackages() {
  const { prisma } =
    await import("../src/prisma/client");

  try {
    for (const creditPackage of creditPackages) {
      const existing =
        await prisma.creditPackage.findFirst({
          where: {
            name: creditPackage.name,
          },
          select: {
            id: true,
          },
        });

      if (existing) {
        await prisma.creditPackage.update({
          where: {
            id: existing.id,
          },
          data: {
            description:
              creditPackage.description,
            credits:
              creditPackage.credits,
            priceCents:
              creditPackage.priceCents,
            currency:
              creditPackage.currency,
            validityDays:
              creditPackage.validityDays,
            status:
              creditPackage.status,
            sortOrder:
              creditPackage.sortOrder,
          },
        });

        console.log(`Updated ${creditPackage.name}`);
        continue;
      }

      await prisma.creditPackage.create({
        data: creditPackage,
      });

      console.log(`Created ${creditPackage.name}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

seedCreditPackages().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
