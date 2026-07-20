import Link from "next/link";

import { isGeoPlace, type GeoPlace } from "@esigenta/shared";

import { ZoneGlyph } from "../marketing/marketing-glyphs";

import { AuthShell } from "./auth-shell";
import { ImpresaSignupForm } from "./components/impresa-signup-form";

export type AreaImpresaSignupPageProps = {
  searchParams: Promise<{
    categorySlug?: string;
    activity?: string;
    geoPlace?: string;
  }>;
};

function getValue(value: string | undefined) {
  return value?.trim() || null;
}

function parseGeoPlace(value: string | undefined): GeoPlace | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    return isGeoPlace(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function AreaImpresaSignupPage({
  searchParams,
}: AreaImpresaSignupPageProps) {
  const params = await searchParams;
  const categorySlug = getValue(params.categorySlug);
  const activity = getValue(params.activity);
  const geoPlace = parseGeoPlace(params.geoPlace);
  const hasValidLeadLocation = geoPlace !== null;
  const locationLabel = geoPlace
    ? [geoPlace.city, geoPlace.province].filter(Boolean).join(" / ")
    : null;

  return (
    <AuthShell size="md">
      <div className="flex flex-col gap-7">
        <div>
          <p className="eg-eyebrow">Crea accesso</p>
          <h1 className="eg-h2 mt-4">Raccontaci della tua azienda.</h1>
          <p className="eg-body-muted mt-4 max-w-[52ch]">
            Completa i dati essenziali: dopo la registrazione accederai all&apos;area
            impresa per configurare e gestire le richieste.
          </p>
        </div>

        {activity || locationLabel ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-eg-hairline py-4">
            <span className="eg-eyebrow text-[11px]">Ti iscrivi per</span>

            {activity ? (
              <span className="text-[14px] font-medium text-eg-terra">
                {activity}
              </span>
            ) : null}

            {locationLabel ? (
              <span className="inline-flex items-center gap-1.5 text-[14px] text-eg-ardesia">
                <ZoneGlyph className="size-4 text-eg-cotto-dark" />
                {locationLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        <ImpresaSignupForm
          categorySlug={categorySlug ?? undefined}
          geoPlace={geoPlace}
          hasValidLeadLocation={hasValidLeadLocation}
        />

        <Link
          href="/area-impresa"
          className="eg-action-link inline-flex w-fit items-center gap-2"
        >
          <span aria-hidden="true">&larr;</span> Torna alla pagina professionisti
        </Link>
      </div>
    </AuthShell>
  );
}
