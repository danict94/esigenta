export type SeoFamily = "costGuide" | "intervention" | "groupHub" | "profession";

export type CanonicalPageRef = {
  family: SeoFamily;
  slug: string;
  citySlug?: string;
};

const familyBasePath: Record<SeoFamily, string> = {
  costGuide: "/costi",
  intervention: "/interventi",
  groupHub: "/servizi",
  profession: "/professionisti",
};

export function buildCanonicalPath(ref: CanonicalPageRef): string {
  const base = `${familyBasePath[ref.family]}/${ref.slug}`;
  return ref.citySlug ? `${base}/${ref.citySlug}` : base;
}
