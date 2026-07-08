import type { FrozenCategory } from "../types/category"

// Specialized pool trade (sector edilizia): construction, renovation, coverings,
// filtration and maintenance. Distinct from impresa-edile (too generic for the
// specialized pool services) and from giardiniere (garden ≠ pool). "piscinista"
// itself is the name, so it is not repeated as an alias.
export const piscinista: FrozenCategory = {
  id: "piscinista",
  slug: "piscinista",
  name: "Piscinista",
  aliases: [
    "piscinisti",
    "costruttore piscine",
    "installatore piscine",
    "manutentore piscine",
    "impresa piscine",
    "azienda piscine",
  ],
  projectGroups: ["piscine"],
}
