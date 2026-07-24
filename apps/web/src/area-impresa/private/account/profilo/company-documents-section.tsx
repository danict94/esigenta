"use client"

import { useRef, useState } from "react"

import { Badge, Button } from "@esigenta/ui"

import type {
  CompanyDocumentPageItem,
  CompanyDocumentPageStatus,
} from "@esigenta/domain"

import {
  authorizeCompanyDocumentUploadAction,
  finalizeCompanyDocumentUploadAction,
} from "../actions/document-actions"

type CompanyDocumentsSectionProps = {
  documents: CompanyDocumentPageItem[]
}

type RowState = {
  isUploading: boolean
  error: string | null
}

const emptyRowState: RowState = { isUploading: false, error: null }

function formatStatusBadge(status: CompanyDocumentPageStatus) {
  switch (status) {
    case "MISSING":
      return { label: "Mancante", variant: "neutral" as const }
    case "PENDING_REVIEW":
      return { label: "In verifica", variant: "warning" as const }
    case "APPROVED":
      return { label: "Approvato", variant: "success" as const }
    case "REJECTED":
      return { label: "Da correggere", variant: "danger" as const }
  }
}

function formatSizeLabel(maxSizeBytes: number) {
  return `${Math.round(maxSizeBytes / (1024 * 1024))} MB`
}

function formatAcceptedFormats(mimeTypes: readonly string[]) {
  return mimeTypes
    .map((mimeType) => {
      if (mimeType === "application/pdf") return "PDF"
      if (mimeType === "image/jpeg") return "JPEG"
      if (mimeType === "image/png") return "PNG"
      if (mimeType === "image/webp") return "WEBP"
      return mimeType
    })
    .join(", ")
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(date)
}

export function CompanyDocumentsSection({
  documents,
}: CompanyDocumentsSectionProps) {
  const [items, setItems] = useState(documents)
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function setRowState(type: string, patch: Partial<RowState>) {
    setRowStates((current) => ({
      ...current,
      [type]: { ...emptyRowState, ...current[type], ...patch },
    }))
  }

  async function handleFileSelected(
    item: CompanyDocumentPageItem,
    file: File,
  ) {
    setRowState(item.type, { isUploading: true, error: null })

    if (!item.acceptedMimeTypes.includes(file.type)) {
      setRowState(item.type, {
        isUploading: false,
        error: `Formato non supportato. Formati accettati: ${formatAcceptedFormats(item.acceptedMimeTypes)}.`,
      })
      return
    }

    if (file.size > item.maxSizeBytes) {
      setRowState(item.type, {
        isUploading: false,
        error: `Il file supera la dimensione massima di ${formatSizeLabel(item.maxSizeBytes)}.`,
      })
      return
    }

    const authorized = await authorizeCompanyDocumentUploadAction({
      documentType: item.type,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    })

    if (!authorized.ok) {
      setRowState(item.type, {
        isUploading: false,
        error: "Non siamo riusciti ad avviare il caricamento. Riprova.",
      })
      return
    }

    try {
      const uploadResponse = await fetch(authorized.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!uploadResponse.ok) {
        throw new Error("upload_failed")
      }
    } catch {
      setRowState(item.type, {
        isUploading: false,
        error: "Il caricamento del file non e riuscito. Riprova.",
      })
      return
    }

    const finalized = await finalizeCompanyDocumentUploadAction({
      documentType: item.type,
      objectKey: authorized.objectKey,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    })

    if (!finalized.ok) {
      setRowState(item.type, {
        isUploading: false,
        error:
          "Il file e stato caricato ma non siamo riusciti a confermarlo. Riprova.",
      })
      return
    }

    setItems((current) =>
      current.map((row) =>
        row.type === item.type
          ? {
              ...row,
              status: "PENDING_REVIEW",
              fileName: file.name,
              uploadedAt: new Date(),
              rejectionReason: null,
            }
          : row,
      ),
    )
    setRowState(item.type, { isUploading: false, error: null })
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-eg-text-muted">
        I documenti aiutano la verifica dell&apos;impresa. Per ora non
        bloccano automaticamente l&apos;operativita.
      </p>

      <ul className="grid gap-3">
        {items.map((item) => {
          const badge = formatStatusBadge(item.status)
          const rowState = rowStates[item.type] ?? emptyRowState

          return (
            <li
              key={item.type}
              className="grid gap-3 border border-eg-border p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-eg-ink">
                    {item.label}
                  </p>
                  <Badge
                    variant={item.requiredByDefault ? "warning" : "neutral"}
                    size="sm"
                  >
                    {item.requiredByDefault ? "Obbligatorio" : "Consigliato"}
                  </Badge>
                  <Badge variant={badge.variant} size="sm">
                    {badge.label}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-eg-text-muted">
                  {item.description}
                </p>
                <p className="mt-2 text-xs leading-5 text-eg-text-muted">
                  Formati: {formatAcceptedFormats(item.acceptedMimeTypes)} ·
                  Max {formatSizeLabel(item.maxSizeBytes)}
                </p>
                {item.fileName ? (
                  <p className="mt-2 text-xs leading-5 text-eg-text-muted">
                    File attuale: {item.fileName}
                    {item.uploadedAt
                      ? ` · caricato il ${formatDate(item.uploadedAt)}`
                      : ""}
                  </p>
                ) : null}
                {item.status === "REJECTED" && item.rejectionReason ? (
                  <p className="mt-2 text-xs leading-5 text-eg-error">
                    Motivo: {item.rejectionReason}
                  </p>
                ) : null}
                {rowState.error ? (
                  <p className="mt-2 text-xs leading-5 text-eg-error">
                    {rowState.error}
                  </p>
                ) : null}
              </div>

              <div>
                <input
                  ref={(node) => {
                    inputRefs.current[item.type] = node
                  }}
                  type="file"
                  accept={item.acceptedMimeTypes.join(",")}
                  className="sr-only"
                  disabled={rowState.isUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ""
                    if (file) void handleFileSelected(item, file)
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  disabled={rowState.isUploading}
                  onClick={() => inputRefs.current[item.type]?.click()}
                >
                  {rowState.isUploading
                    ? "Caricamento..."
                    : item.status === "MISSING"
                      ? "Carica"
                      : "Sostituisci"}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
