import { frozenTaxonomySource } from "../source"
import { validateFrozenTaxonomySource } from "../shared/validators"

async function buildFrozenTaxonomy() {
  validateFrozenTaxonomySource(frozenTaxonomySource)

  const interventionCount = frozenTaxonomySource.projectGroups.reduce(
    (total, projectGroup) => total + projectGroup.interventions.length,
    0,
  )

  console.log("Frozen taxonomy validation completed")
  console.log(`Categories: ${frozenTaxonomySource.categories.length}`)
  console.log(`Project groups: ${frozenTaxonomySource.projectGroups.length}`)
  console.log(`Interventions: ${interventionCount}`)
}

buildFrozenTaxonomy().catch((error) => {
  console.error("Frozen taxonomy build failed")
  console.error(error)

  process.exit(1)
})
