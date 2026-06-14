import { taxonomySource } from "../source"
import { validateTaxonomySource } from "../shared/validators"

async function buildTaxonomy() {
  validateTaxonomySource(taxonomySource)

  console.log("Taxonomy validation completed")
  console.log(`Sectors: ${taxonomySource.sectors.length}`)
  console.log(`Services: ${taxonomySource.services.length}`)
  console.log(`Interventions: ${taxonomySource.interventions.length}`)
  console.log(`Categories: ${taxonomySource.categories.length}`)
  console.log(`Domains: ${taxonomySource.domains.length}`)
}

buildTaxonomy().catch((error) => {
  console.error("Taxonomy build failed")
  console.error(error)

  process.exit(1)
})
