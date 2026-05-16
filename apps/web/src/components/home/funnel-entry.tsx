'use client'

import {
  useRouter,
} from 'next/navigation'

import {
  SearchBar,
} from './search-bar'

import type {
  SearchBarSelection,
} from './search-bar'

export function FunnelEntry() {
  const router = useRouter()

  function openFunnel({
    result,
    query,
  }: SearchBarSelection) {
    if (result.type !== 'INTERVENTION') {
      return
    }

    const searchParams =
      new URLSearchParams()

    if (query.trim()) {
      searchParams.set(
        'q',
        query.trim(),
      )
    }

    const queryString =
      searchParams.toString()

    router.push(
      `/richiesta/${encodeURIComponent(
        result.slug,
      )}${
        queryString
          ? `?${queryString}`
          : ''
      }`,
    )
  }

  return (
    <SearchBar
      onInterventionSelect={(
        selection,
      ) => {
        openFunnel(selection)
      }}
    />
  )
}
