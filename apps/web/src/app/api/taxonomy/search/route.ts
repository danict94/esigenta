import { NextResponse } from 'next/server'

import { searchTaxonomy } from '@esigenta/taxonomy'

const MIN_SEARCH_QUERY_LENGTH = 3

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const query = (searchParams.get('q') ?? '').trim()

  if (query.length < MIN_SEARCH_QUERY_LENGTH) {
    return NextResponse.json([])
  }

  try {
    const results = await searchTaxonomy({
      query,
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('[taxonomy-search] Failed to search taxonomy', error)

    return NextResponse.json(
      { error: 'taxonomy_search_failed' },
      { status: 500 },
    )
  }
}
