"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { resolveFunnelQuery } from "./resolve-funnel-query";
import { RequestStepper } from "./request-stepper";

import type { JsonRuntimeFunnelPayload } from "../runtime-payload";

type RequestFlowShellProps = {
  interventionSlug: string;
  initialRuntime: JsonRuntimeFunnelPayload;
};

export function RequestFlowShell({
  interventionSlug,
  initialRuntime,
}: RequestFlowShellProps) {
  const router = useRouter();

  // originalQuery only ever exists in sessionStorage (home-hero.tsx never
  // puts it in the URL, on purpose — see resolve-funnel-query.ts), so the
  // server-built initialRuntime can't carry it. It doesn't affect steps or
  // branching (see build-request-draft.ts), so attaching it here is a plain
  // synchronous merge, not a rebuild of runtime state.
  const [runtimePayload] = useState<JsonRuntimeFunnelPayload>(() => {
    const resolvedQuery = resolveFunnelQuery(interventionSlug);

    return resolvedQuery
      ? { ...initialRuntime, originalQuery: resolvedQuery }
      : initialRuntime;
  });

  return (
    <RequestStepper
      payload={runtimePayload}
      onReset={() => {
        router.push("/");
      }}
    />
  );
}
