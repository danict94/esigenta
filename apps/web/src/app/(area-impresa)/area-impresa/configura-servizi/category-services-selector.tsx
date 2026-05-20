"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Badge,
  Button,
  Checkbox,
  cn,
} from "@fixpro/ui"

export type RequestMatchingMode =
  | "CATEGORY_WITH_SERVICE_PRIORITY"
  | "SELECTED_SERVICES_ONLY"

type ServiceOption = {
  id: string
  name: string
  description: string | null
}

export type CategoryOption = {
  id: string
  name: string
  sectorName: string | null
  services: ServiceOption[]
}

export type CategoryServicesSelectorProps = {
  categories: CategoryOption[]
  initialCategoryIds: string[]
  initialServiceIds: string[]
  initialRequestMatchingMode: RequestMatchingMode
  action: (formData: FormData) => Promise<void>
}

const maxCategories = 6

function getAllowedServiceIds({
  categories,
  selectedCategoryIds,
}: {
  categories: CategoryOption[]
  selectedCategoryIds: string[]
}) {
  const selectedCategoryIdSet = new Set(
    selectedCategoryIds,
  )
  const allowedServiceIds = new Set<string>()

  categories.forEach((category) => {
    if (!selectedCategoryIdSet.has(category.id)) {
      return
    }

    category.services.forEach((service) => {
      allowedServiceIds.add(service.id)
    })
  })

  return allowedServiceIds
}

export function CategoryServicesSelector({
  categories,
  initialCategoryIds,
  initialServiceIds,
  initialRequestMatchingMode,
  action,
}: CategoryServicesSelectorProps) {
  const [
    selectedCategoryIds,
    setSelectedCategoryIds,
  ] = useState(initialCategoryIds)
  const [
    selectedServiceIds,
    setSelectedServiceIds,
  ] = useState(() => {
    const allowedServiceIds =
      getAllowedServiceIds({
        categories,
        selectedCategoryIds:
          initialCategoryIds,
      })

    return initialServiceIds.filter(
      (serviceId) =>
        allowedServiceIds.has(serviceId),
    )
  })

  const selectedCategoryIdSet = useMemo(
    () => new Set(selectedCategoryIds),
    [selectedCategoryIds],
  )
  const selectedServiceIdSet = useMemo(
    () => new Set(selectedServiceIds),
    [selectedServiceIds],
  )

  const [
    requestMatchingMode,
    setRequestMatchingMode,
  ] = useState<RequestMatchingMode>(
    initialRequestMatchingMode,
  )

  const hasSelectedServices =
    selectedServiceIds.length > 0

  useEffect(() => {
    if (
      hasSelectedServices ||
      requestMatchingMode !==
        "SELECTED_SERVICES_ONLY"
    ) {
      return
    }

    setRequestMatchingMode(
      "CATEGORY_WITH_SERVICE_PRIORITY",
    )
  }, [
    hasSelectedServices,
    requestMatchingMode,
  ])

  const selectedCategories = categories.filter(
    (category) =>
      selectedCategoryIdSet.has(category.id),
  )

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds(
      (currentCategoryIds) => {
        const isSelected =
          currentCategoryIds.includes(categoryId)
        const nextCategoryIds = isSelected
          ? currentCategoryIds.filter(
              (currentCategoryId) =>
                currentCategoryId !==
                categoryId,
            )
          : currentCategoryIds.length >=
              maxCategories
            ? currentCategoryIds
            : [
                ...currentCategoryIds,
                categoryId,
              ]

        const allowedServiceIds =
          getAllowedServiceIds({
            categories,
            selectedCategoryIds:
              nextCategoryIds,
          })

        setSelectedServiceIds(
          (currentServiceIds) =>
            currentServiceIds.filter(
              (serviceId) =>
                allowedServiceIds.has(
                  serviceId,
                ),
            ),
        )

        return nextCategoryIds
      },
    )
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds(
      (currentServiceIds) =>
        currentServiceIds.includes(serviceId)
          ? currentServiceIds.filter(
              (currentServiceId) =>
                currentServiceId !== serviceId,
            )
          : [
              ...currentServiceIds,
              serviceId,
            ],
    )
  }

  return (
    <form action={action} className="mt-6 space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Scegli fino a 6 categorie
            </h3>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Categoria = base della visibilità. Puoi selezionare da 1 a 6
              aree operative.
            </p>
          </div>

          <Badge variant="neutral">
            {selectedCategoryIds.length}/{maxCategories} categorie selezionate
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => {
            const selected =
              selectedCategoryIdSet.has(
                category.id,
              )
            const disabled =
              !selected &&
              selectedCategoryIds.length >=
                maxCategories

            return (
              <label
                key={category.id}
                className={cn(
                  "flex cursor-pointer gap-4 border border-border-primary bg-surface-primary p-4 transition-colors hover:border-border-focus",
                  selected
                    ? "border-border-focus bg-surface-secondary"
                    : "",
                  disabled
                    ? "cursor-not-allowed opacity-60"
                    : "",
                )}
              >
                <Checkbox
                  name="categoryIds"
                  value={category.id}
                  checked={selected}
                  disabled={disabled}
                  onChange={() =>
                    toggleCategory(category.id)
                  }
                  className="mt-1"
                />

                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text-primary">
                    {category.name}
                  </span>

                  {category.sectorName ? (
                    <span className="mt-1 block text-xs font-medium text-text-muted">
                      {category.sectorName}
                    </span>
                  ) : null}
                </span>
              </label>
            )
          })}
        </div>
      </section>

      <section className="space-y-4 border-t border-border-primary pt-6">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Servizi opzionali
          </h3>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            I servizi sono opzionali: aiutano FixPro a dare priorità alle
            richieste più pertinenti, ma la categoria resta la base della
            visibilità.
          </p>
        </div>

        {selectedCategories.length === 0 ? (
          <p className="text-sm text-text-muted">
            Seleziona almeno una categoria per vedere i servizi collegati.
          </p>
        ) : (
          <div className="space-y-6">
            {selectedCategories.map((category) => (
              <div
                key={category.id}
                className="space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {category.name}
                  </h4>

                  <Badge variant="warning" size="sm">
                    {category.services.length} servizi
                  </Badge>
                </div>

                {category.services.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    Nessun servizio configurabile per questa categoria.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {category.services.map(
                      (service) => {
                        const selected =
                          selectedServiceIdSet.has(
                            service.id,
                          )

                        return (
                          <label
                            key={`${category.id}-${service.id}`}
                            className="flex cursor-pointer gap-4 border border-border-primary bg-surface-primary p-4 transition-colors hover:border-border-focus"
                          >
                            <Checkbox
                              name="serviceIds"
                              value={service.id}
                              checked={selected}
                              onChange={() =>
                                toggleService(
                                  service.id,
                                )
                              }
                              className="mt-1"
                            />

                            <span>
                              <span className="block text-sm font-semibold text-text-primary">
                                {service.name}
                              </span>

                              {service.description ? (
                                <span className="mt-1 block text-sm leading-6 text-text-secondary">
                                  {service.description}
                                </span>
                              ) : null}
                            </span>
                          </label>
                        )
                      },
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-border-primary bg-surface-primary p-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-text-primary">
            Modalità ricezione richieste
          </h3>
          <p className="text-sm leading-6 text-text-secondary">
            Per impostazione predefinita ricevi richieste compatibili
            con le tue categorie professionali. I servizi selezionati
            migliorano la precisione del matching.
          </p>
        </div>

        <label className="flex cursor-pointer gap-4 rounded-2xl border border-border-primary bg-surface-secondary p-4">
          <Checkbox
            name="requestMatchingMode"
            value="SELECTED_SERVICES_ONLY"
            checked={
              hasSelectedServices &&
              requestMatchingMode ===
                "SELECTED_SERVICES_ONLY"
            }
            disabled={!hasSelectedServices}
            onChange={() => {
              if (!hasSelectedServices) {
                return
              }

              setRequestMatchingMode((currentMode) =>
                currentMode ===
                "SELECTED_SERVICES_ONLY"
                  ? "CATEGORY_WITH_SERVICE_PRIORITY"
                  : "SELECTED_SERVICES_ONLY",
              )
            }}
            className="mt-1"
          />

          <span className="min-w-0">
            <span className="block text-sm font-medium text-text-primary">
              Ricevi solo richieste compatibili con i servizi selezionati
            </span>
            <span className="mt-1 block text-sm leading-6 text-text-secondary">
              Se attivi questa opzione, FixPro ti invierà solo
              richieste collegate ai servizi che hai selezionato.
              Se la lasci disattivata, potrai ricevere anche
              richieste più ampie delle tue categorie professionali.
            </span>

            {!hasSelectedServices ? (
              <span className="mt-2 block text-sm leading-6 text-text-secondary">
                Seleziona almeno un servizio per limitare le richieste
                ai soli servizi scelti.
              </span>
            ) : null}
          </span>
        </label>
      </section>

      <div className="flex justify-end border-t border-border-primary pt-6">
        <Button type="submit">
          Salva configurazione
        </Button>
      </div>


    </form>
  )
}
