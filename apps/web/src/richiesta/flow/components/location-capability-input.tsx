"use client";

import { useEffect, useRef, useState } from "react";

import type { GeoPlace } from "@esigenta/shared";
import {
  isManualLocationAnswer,
  type RuntimeManualLocationAnswer,
} from "@esigenta/funnel";

import { CityAutocomplete } from "../../../ui/location/city-autocomplete";

/**
 * FASE 8D — hybrid manual geo fallback.
 *
 * Google Places (CityAutocomplete) remains the primary, unchanged path:
 * this component renders it exactly as before whenever the current
 * answer isn't a confirmed manual preview. The fallback only surfaces
 * once the user has typed something without selecting a Google
 * suggestion — it never competes visually with the primary autocomplete.
 *
 * "Usa questa località" calls POST /api/geo/resolve (preview/validation
 * only — see that route's module comment) and, on success, stores a
 * RuntimeManualLocationAnswer as the capability's answer: {kind, query,
 * preview}. `preview` is display-only — nothing here is trusted at
 * submit time. draft.geo stays null for this answer shape
 * (readRuntimeLocationAnswer); only draft.geoManualQuery (the raw query
 * alone) is carried to the server, which re-resolves it itself inside
 * createRequestFromDraft (FASE 8B.2's trust boundary, unchanged) to
 * produce the real, trusted MANUAL_RESOLVED location.
 */

const MIN_MANUAL_QUERY_LENGTH = 3;

type GeoResolveSuccess = {
  ok: true;
  location: RuntimeManualLocationAnswer["preview"];
};

type GeoResolveFailure = {
  ok: false;
  code: string;
  error: string;
};

type GeoResolveResponse = GeoResolveSuccess | GeoResolveFailure;

const GENERIC_RESOLVE_ERROR =
  "Non riusciamo a verificare questa località ora. Riprova più tardi.";

function formatManualLocationSummary(
  preview: RuntimeManualLocationAnswer["preview"],
): string {
  const parts = [preview.city];

  if (preview.province) {
    parts.push(`(${preview.province})`);
  }

  const cityLabel = parts.join(" ");

  return preview.postalCode
    ? `${cityLabel} · ${preview.postalCode}`
    : cityLabel;
}

type LocationCapabilityInputProps = {
  value: unknown;
  onChange: (value: unknown) => void;
};

export function LocationCapabilityInput({
  value,
  onChange,
}: LocationCapabilityInputProps) {
  const [query, setQuery] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const manualAnswer = isManualLocationAnswer(value) ? value : null;
  const geoPlaceValue = manualAnswer ? null : (value as GeoPlace | null);

  if (manualAnswer) {
    return (
      <div className="grid gap-2">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-0 border-b border-eg-border py-3">
          <span className="text-lg text-eg-ink">
            {formatManualLocationSummary(manualAnswer.preview)}
          </span>

          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
              setResolveError(null);
            }}
            className="eg-form-help shrink-0 underline"
          >
            Cambia
          </button>
        </div>
      </div>
    );
  }

  const trimmedQuery = query.trim();
  const showManualFallback =
    trimmedQuery.length >= MIN_MANUAL_QUERY_LENGTH && !geoPlaceValue;

  async function resolveManually() {
    setIsResolving(true);
    setResolveError(null);

    try {
      const response = await fetch("/api/geo/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery }),
      });

      const body = (await response
        .json()
        .catch(() => null)) as GeoResolveResponse | null;

      if (!isMountedRef.current) {
        return;
      }

      if (!body || !body.ok) {
        setResolveError(body?.error ?? GENERIC_RESOLVE_ERROR);
        return;
      }

      const manualLocationAnswer: RuntimeManualLocationAnswer = {
        kind: "manual_location_preview",
        query: trimmedQuery,
        preview: body.location,
      };

      onChange(manualLocationAnswer);
    } catch {
      if (isMountedRef.current) {
        setResolveError(GENERIC_RESOLVE_ERROR);
      }
    } finally {
      if (isMountedRef.current) {
        setIsResolving(false);
      }
    }
  }

  return (
    <div className="grid gap-2">
      <CityAutocomplete
        value={geoPlaceValue}
        onChange={onChange}
        query={query}
        onQueryChange={(nextQuery) => {
          setQuery(nextQuery);
          setResolveError(null);
        }}
        placeholder='Es. 95022 o Aci Bonaccorsi'
      />

      {showManualFallback ? (
        <button
          type="button"
          onClick={() => {
            void resolveManually();
          }}
          disabled={isResolving}
          className="eg-form-help w-fit underline disabled:opacity-60"
        >
          {isResolving
            ? "Verifica in corso..."
            : `Non trovi la tua località nei suggerimenti? Usa "${trimmedQuery}"`}
        </button>
      ) : null}

      {resolveError ? <p className="eg-form-help">{resolveError}</p> : null}
    </div>
  );
}
