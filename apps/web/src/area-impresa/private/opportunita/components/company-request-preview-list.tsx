import {
  Badge,
  Card,
} from "@esigenta/ui"

import type {
  CompanyRequestPreview,
} from "@esigenta/domain"

import {
  formatFreshness,
} from "./request-card-format"

function getMatchLabel(
  matchLevel: CompanyRequestPreview["matchLevel"],
) {
  if (matchLevel === "selected_intervention") {
    return "Molto compatibile"
  }

  if (matchLevel === "category") {
    return "Nella tua categoria"
  }

  return "Compatibile"
}

function formatPreviewLocation({
  city,
  province,
}: Pick<
  CompanyRequestPreview,
  "city" | "province"
>) {
  const location = [city, province]
    .filter(Boolean)
    .join(" ")

  return location || "Area compatibile"
}

export function CompanyRequestPreviewList({
  requests,
}: {
  requests: CompanyRequestPreview[]
}) {
  if (requests.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-sm text-eg-ardesia">
          Nessuna richiesta compatibile al momento.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card
          key={request.id}
          className="border-l-4 border-l-eg-hairline p-4 lg:p-5"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="warning" size="sm">
                Profilo in revisione
              </Badge>
              <Badge variant="neutral" size="sm">
                {getMatchLabel(request.matchLevel)}
              </Badge>
            </div>

            <div>
              <h2 className="break-words text-xl font-semibold leading-snug tracking-tight text-eg-terra lg:text-2xl">
                {request.interventionName}
              </h2>
              <p className="mt-2 text-sm text-eg-ardesia lg:text-base">
                {formatPreviewLocation(request)} ·{" "}
                {formatFreshness(request.createdAt)}
              </p>
            </div>

            <div className="border-t border-eg-hairline pt-4">
              <p className="text-sm leading-6 text-eg-ardesia">
                Potrai vedere i dettagli e contattare il cliente appena il
                profilo sarà approvato.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-eg-lg border border-eg-hairline bg-eg-calce-2 px-4 text-sm font-medium text-eg-ardesia opacity-80 sm:w-auto"
              >
                Disponibile dopo l’approvazione
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
