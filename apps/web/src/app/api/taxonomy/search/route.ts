import { NextResponse } from 'next/server'

import { searchTaxonomy } from '@fixpro/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const query = searchParams.get('q') ?? ''

  const results = await searchTaxonomy({
    query,
  })

  return NextResponse.json(results)
}