import type {
  CityPageQualityStatus,
  CityPageUniquenessLevel,
} from "../pages/costi/types";

export type CitySupportRecord = {
  citySlug: string;
  seoEnabled: boolean;
  contentStatus: CityPageQualityStatus;
  uniquenessLevel: CityPageUniquenessLevel;
};

const supportedCitiesByFamily: Record<string, readonly CitySupportRecord[]> =
  {
    "costGuide:ristrutturare-bagno": [
      {
        citySlug: "milano",
        seoEnabled: true,
        contentStatus: "ready",
        uniquenessLevel: "strong",
      },
      {
        citySlug: "roma",
        seoEnabled: true,
        contentStatus: "ready",
        uniquenessLevel: "strong",
      },
      {
        citySlug: "torino",
        seoEnabled: true,
        contentStatus: "ready",
        uniquenessLevel: "acceptable",
      },
      {
        citySlug: "napoli",
        seoEnabled: true,
        contentStatus: "ready",
        uniquenessLevel: "acceptable",
      },
      {
        citySlug: "bologna",
        seoEnabled: true,
        contentStatus: "ready",
        uniquenessLevel: "acceptable",
      },
      {
        citySlug: "firenze",
        seoEnabled: true,
        contentStatus: "ready",
        uniquenessLevel: "acceptable",
      },
      {
        citySlug: "palermo",
        seoEnabled: true,
        contentStatus: "ready",
        uniquenessLevel: "acceptable",
      },
      {
        citySlug: "catania",
        seoEnabled: true,
        contentStatus: "ready",
        uniquenessLevel: "acceptable",
      },
    ],
  };

export function listSupportedCities(
  familyKey: string,
): readonly CitySupportRecord[] {
  return supportedCitiesByFamily[familyKey] ?? [];
}

export function getCitySupport(
  familyKey: string,
  citySlug: string,
): CitySupportRecord | null {
  return (
    listSupportedCities(familyKey).find(
      (record) => record.citySlug === citySlug,
    ) ?? null
  );
}
