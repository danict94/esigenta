"use client"

import { useState, useTransition } from "react"

import type { RequestDashboardFilters } from "@esigenta/domain"

import { CompanyRequestList } from "./company-request-list"
import { loadMoreRequestsAction } from "../actions/load-more-requests-action"

type AvailableRequest = Parameters<
  typeof CompanyRequestList
>[0]["requests"][number]

export function AvailableRequestsList({
  initialRequests,
  initialHasNextPage,
  initialPage,
  filters,
  emptyMessage,
  savedAction,
}: {
  initialRequests: readonly AvailableRequest[]
  initialHasNextPage: boolean
  initialPage: number
  filters: RequestDashboardFilters
  emptyMessage: string
  savedAction: (formData: FormData) => Promise<void>
}) {
  const [requests, setRequests] = useState(initialRequests)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [page, setPage] = useState(initialPage)
  const [isPending, startTransition] = useTransition()

  function handleLoadMore() {
    startTransition(async () => {
      const result = await loadMoreRequestsAction({
        filters,
        page: page + 1,
      })

      if (!result.ok) {
        return
      }

      setRequests((current) => [...current, ...result.requests])
      setHasNextPage(result.hasNextPage)
      setPage(result.page)
    })
  }

  return (
    <>
      <CompanyRequestList
        requests={requests}
        mode="available"
        emptyMessage={emptyMessage}
        savedAction={savedAction}
      />

      {requests.length > 0 ? (
        <div className="px-7 py-5 text-center">
          {hasNextPage ? (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isPending}
              className="rounded-full border border-eg-hairline bg-eg-calce px-5 py-2 font-(family-name:--eg-font-ui) text-[11px] uppercase tracking-[0.06em] text-eg-terra transition-colors hover:border-eg-terra disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Caricamento..." : "Carica altre richieste"}
            </button>
          ) : (
            <p className="eg-metadata text-[11px]">
              Nessun&rsquo;altra richiesta
            </p>
          )}
        </div>
      ) : null}
    </>
  )
}
