import type { RequestDraft, RuntimeFunnelPayload } from "@esigenta/funnel";

/**
 * RequestDraft crosses the Server -> Client Component boundary (built in
 * page.tsx, consumed by the funnel client tree), so createdAt must already
 * be a plain string — a Date would not survive that boundary unchanged.
 */
export type JsonRequestDraft = Omit<RequestDraft, "createdAt"> & {
  createdAt: string;
};

export type JsonRuntimeFunnelPayload = Omit<
  RuntimeFunnelPayload,
  "requestDraft"
> & {
  requestDraft: JsonRequestDraft;
};
