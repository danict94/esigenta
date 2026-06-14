import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import type { PrismaClient } from "@prisma/client";

import { validateTaxonomySource } from "../shared/validators";

import type {
  TaxonomyCategory,
  TaxonomyDomain,
  TaxonomyIntervention,
  TaxonomySector,
  TaxonomyService,
  TaxonomySource,
} from "../shared/types";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const packageDir = path.resolve(currentDir, "../..");

const generatedDir = path.resolve(packageDir, "generated");

config({
  path: path.resolve(packageDir, "../../.env"),
});

async function readArtifact<T>(
  fileName: string,
): Promise<T> {
  const fileContent = await fs.readFile(
    path.join(generatedDir, fileName),
    "utf8",
  );

  return JSON.parse(fileContent) as T;
}

async function readGeneratedTaxonomy(): Promise<TaxonomySource> {
  const [
    sectors,
    services,
    interventions,
    categories,
    domains,
  ] = await Promise.all([
    readArtifact<TaxonomySector[]>(
      "sectors.generated.json",
    ),

    readArtifact<TaxonomyService[]>(
      "services.generated.json",
    ),

    readArtifact<TaxonomyIntervention[]>(
      "interventions.generated.json",
    ),

    readArtifact<TaxonomyCategory[]>(
      "categories.generated.json",
    ),

    readArtifact<TaxonomyDomain[]>(
      "domains.generated.json",
    ),
  ]);

  return {
    sectors,
    services,
    interventions,
    categories,
    domains,
  };
}

async function replaceServiceAliases(
  prisma: PrismaClient,
  serviceId: string,
  aliases: string[],
) {
  await prisma.serviceAlias.deleteMany({
    where: {
      serviceId,
    },
  });

  if (aliases.length === 0) {
    return;
  }

  await prisma.serviceAlias.createMany({
    data: aliases.map((value) => ({
      value,
      serviceId,
    })),

    skipDuplicates: true,
  });
}

async function replaceCategoryAliases(
  prisma: PrismaClient,
  categoryId: string,
  aliases: string[],
) {
  await prisma.categoryAlias.deleteMany({
    where: {
      categoryId,
    },
  });

  if (aliases.length === 0) {
    return;
  }

  await prisma.categoryAlias.createMany({
    data: aliases.map((value) => ({
      value,
      categoryId,
    })),

    skipDuplicates: true,
  });
}

async function replaceInterventionAliases(
  prisma: PrismaClient,
  interventionId: string,
  aliases: string[],
) {
  await prisma.interventionAlias.deleteMany({
    where: {
      interventionId,
    },
  });

  if (aliases.length === 0) {
    return;
  }

  await prisma.interventionAlias.createMany({
    data: aliases.map((value) => ({
      value,
      interventionId,
    })),

    skipDuplicates: true,
  });
}

async function replaceDomainAliases(
  prisma: PrismaClient,
  domainId: string,
  aliases: string[],
) {
  await prisma.domainAlias.deleteMany({
    where: {
      domainId,
    },
  });

  if (aliases.length === 0) {
    return;
  }

  await prisma.domainAlias.createMany({
    data: aliases.map((value) => ({
      value,
      domainId,
    })),

    skipDuplicates: true,
  });
}

async function seedTaxonomy(
  prisma: PrismaClient,
) {
  const source = await readGeneratedTaxonomy();

  validateTaxonomySource(source);

  console.log("Seeding taxonomy...");

  const sectorIds = new Map<string, string>();

  const serviceIds = new Map<string, string>();

  const categoryIds = new Map<string, string>();

  const interventionIds = new Map<string, string>();

  const domainIds = new Map<string, string>();

  //
  // SECTORS
  //

  for (const sector of source.sectors) {
    const record = await prisma.sector.upsert({
      where: {
        slug: sector.slug,
      },

      create: {
        slug: sector.slug,
        name: sector.name,
        description: sector.description ?? null,
      },

      update: {
        name: sector.name,
        description: sector.description ?? null,
      },
    });

    sectorIds.set(sector.slug, record.id);
  }

  //
  // SERVICES
  //

  for (const service of source.services) {
    const record = await prisma.service.upsert({
      where: {
        slug: service.slug,
      },

      create: {
        slug: service.slug,
        name: service.name,
        description: service.description ?? null,
      },

      update: {
        name: service.name,
        description: service.description ?? null,
      },
    });

    serviceIds.set(service.slug, record.id);

    await replaceServiceAliases(
      prisma,
      record.id,
      service.aliases ?? [],
    );
  }

  //
  // CATEGORIES
  //

  for (const category of source.categories) {
    const sectorId = sectorIds.get(
      category.sectorSlug,
    );

    if (!sectorId) {
      throw new Error(
        `Missing sector for category ${category.slug}`,
      );
    }

    const record = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },

      create: {
        slug: category.slug,
        name: category.name,
        description: category.description ?? null,
        sectorId,
      },

      update: {
        name: category.name,
        description: category.description ?? null,
        sectorId,
      },
    });

    categoryIds.set(category.slug, record.id);

    await replaceCategoryAliases(
      prisma,
      record.id,
      category.aliases ?? [],
    );
  }

  //
  // INTERVENTIONS
  //

  for (const intervention of source.interventions) {
    const record = await prisma.intervention.upsert({
      where: {
        slug: intervention.slug,
      },

      create: {
        slug: intervention.slug,
        name: intervention.name,
        description:
          intervention.description ?? null,
      },

      update: {
        name: intervention.name,
        description:
          intervention.description ?? null,
      },
    });

    interventionIds.set(
      intervention.slug,
      record.id,
    );

    await replaceInterventionAliases(
      prisma,
      record.id,
      intervention.aliases ?? [],
    );
  }

  //
  // DOMAINS
  //

  for (const domain of source.domains) {
    const record = await prisma.domain.upsert({
      where: {
        slug: domain.slug,
      },

      create: {
        slug: domain.slug,
        name: domain.name,
        description: domain.description ?? null,
      },

      update: {
        name: domain.name,
        description: domain.description ?? null,
      },
    });

    domainIds.set(domain.slug, record.id);

    await replaceDomainAliases(
      prisma,
      record.id,
      domain.aliases ?? [],
    );
  }

  //
  // CATEGORY <-> SERVICE
  //

  for (const category of source.categories) {
    const categoryId = categoryIds.get(
      category.slug,
    );

    if (!categoryId) {
      throw new Error(
        `Category not seeded: ${category.slug}`,
      );
    }

    await prisma.categoryService.deleteMany({
      where: {
        categoryId,
      },
    });

    const relationRows = category.services.map(
      (serviceSlug) => {
        const serviceId =
          serviceIds.get(serviceSlug);

        if (!serviceId) {
          throw new Error(
            `Service not seeded: ${serviceSlug}`,
          );
        }

        return {
          categoryId,
          serviceId,
        };
      },
    );

    if (relationRows.length > 0) {
      await prisma.categoryService.createMany({
        data: relationRows,
        skipDuplicates: true,
      });
    }
  }

  //
  // INTERVENTION <-> SERVICE
  //

  for (const intervention of source.interventions) {
    const interventionId = interventionIds.get(
      intervention.slug,
    );

    if (!interventionId) {
      throw new Error(
        `Intervention not seeded: ${intervention.slug}`,
      );
    }

    await prisma.interventionService.deleteMany({
      where: {
        interventionId,
      },
    });

    const relationRows =
      intervention.services.map(
        (serviceSlug) => {
          const serviceId =
            serviceIds.get(serviceSlug);

          if (!serviceId) {
            throw new Error(
              `Service not seeded: ${serviceSlug}`,
            );
          }

          return {
            interventionId,
            serviceId,
          };
        },
      );

    if (relationRows.length > 0) {
      await prisma.interventionService.createMany({
        data: relationRows,
        skipDuplicates: true,
      });
    }
  }

  //
  // DOMAIN <-> INTERVENTION
  //

  for (const domain of source.domains) {
    const domainId = domainIds.get(domain.slug);

    if (!domainId) {
      throw new Error(
        `Domain not seeded: ${domain.slug}`,
      );
    }

    await prisma.domainIntervention.deleteMany({
      where: {
        domainId,
      },
    });

    const relationRows =
      domain.interventions.map(
        (interventionSlug) => {
          const interventionId =
            interventionIds.get(
              interventionSlug,
            );

          if (!interventionId) {
            throw new Error(
              `Intervention not seeded: ${interventionSlug}`,
            );
          }

          return {
            domainId,
            interventionId,
          };
        },
      );

    if (relationRows.length > 0) {
      await prisma.domainIntervention.createMany({
        data: relationRows,
        skipDuplicates: true,
      });
    }
  }

  console.log("Taxonomy seed completed");
}

const { prisma } = await import("@esigenta/database");

seedTaxonomy(prisma)
  .catch((error) => {
    console.error("Taxonomy seed failed");

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
