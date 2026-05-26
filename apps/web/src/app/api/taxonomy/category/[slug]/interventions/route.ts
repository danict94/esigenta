import { NextResponse } from 'next/server'

import {
  listInterventionsForCategory,
} from '@fixpro/db'

type CategoryInterventionsRouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(
  _request: Request,
  {
    params,
  }: CategoryInterventionsRouteContext,
) {
  const { slug } = await params

  const interventions =
    await listInterventionsForCategory(
      decodeURIComponent(slug),
    )

  return NextResponse.json({
    interventions,
  })
}
