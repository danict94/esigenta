"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { resolveFunnelQuery } from "./resolve-funnel-query";
import { RequestStepper } from "./request-stepper";

import type { JsonRuntimeFunnelPayload } from "./request-stepper";

type RequestFlowShellProps = {
  interventionSlug: string;
};

export function RequestFlowShell({
  interventionSlug,
}: RequestFlowShellProps) {
  const router = useRouter();
  const [runtimePayload, setRuntimePayload] =
    useState<JsonRuntimeFunnelPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedQuery] = useState<string | undefined>(() =>
    resolveFunnelQuery(interventionSlug),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRuntimeFunnel() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/funnel/runtime", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interventionSlug,
            query: resolvedQuery,
          }),
        });

        if (!response.ok) {
          throw new Error();
        }

        const payload = (await response.json()) as JsonRuntimeFunnelPayload;

        if (!cancelled) {
          setRuntimePayload(payload);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Non siamo riusciti ad aprire il percorso guidato. Riprova tra poco.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRuntimeFunnel();

    return () => {
      cancelled = true;
    };
  }, [interventionSlug, resolvedQuery]);

  if (isLoading) {
    return (
      <div className="eg-panel mt-8 p-5 text-sm text-eg-ardesia md:p-6">
        Prepariamo il percorso guidato...
      </div>
    );
  }

  if (error || !runtimePayload) {
    return (
      <div className="eg-panel mt-8 p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-eg-cotto-dark">
            {error ?? "Percorso guidato non disponibile."}
          </p>

          <button
            type="button"
            className="eg-button-ghost w-full sm:w-fit"
            onClick={() => {
              router.push("/");
            }}
          >
            Torna alla ricerca
          </button>
        </div>
      </div>
    );
  }

  return (
    <RequestStepper
      payload={runtimePayload}
      onReset={() => {
        router.push("/");
      }}
    />
  );
}
