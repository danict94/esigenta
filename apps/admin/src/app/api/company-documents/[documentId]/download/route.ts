import { NextResponse } from "next/server"

import { createAdminCompanyDocumentDownloadUrl } from "@esigenta/domain"

import { requireAdmin } from "../../../../../auth/server"

type RouteParams = {
  params: Promise<{ documentId: string }>
}

// A plain GET redirect, not a server action: this lets "Apri documento"
// be a regular <a target="_blank"> link, which is the only reliable way
// to open a fresh signed URL in a new tab without a client component. The
// signed URL is generated on every request and never rendered in HTML —
// only this admin-only, id-only route ever sees it.
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { documentId } = await params

  const result = await createAdminCompanyDocumentDownloadUrl(documentId)

  if (!result.ok) {
    return NextResponse.json({ error: result.code }, { status: 404 })
  }

  return NextResponse.redirect(result.downloadUrl)
}
