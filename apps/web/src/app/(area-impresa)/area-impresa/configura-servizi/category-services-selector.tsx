"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, Button, Checkbox, Input, cn } from "@esigenta/ui";

type ServiceOption = {
  id: string;
  name: string;
  description: string | null;
};

export type CategoryOption = {
  id: string;
  name: string;
  sectorName: string | null;
  services: ServiceOption[];
};

export type CategoryServicesSelectorProps = {
  categories: CategoryOption[];
  initialCategoryIds: string[];
  initialServiceIds: string[];
  action: (formData: FormData) => Promise<void>;
};

const maxCategories = 6;
const serviceBatchSize = 10;

function getAllowedServiceIds({
  categories,
  selectedCategoryIds,
}: {
  categories: CategoryOption[];
  selectedCategoryIds: string[];
}) {
  const selectedCategoryIdSet = new Set(selectedCategoryIds);
  const allowedServiceIds = new Set<string>();

  categories.forEach((category) => {
    if (!selectedCategoryIdSet.has(category.id)) {
      return;
    }

    category.services.forEach((service) => {
      allowedServiceIds.add(service.id);
    });
  });

  return allowedServiceIds;
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getSelectedServiceCount({
  category,
  selectedServiceIdSet,
}: {
  category: CategoryOption;
  selectedServiceIdSet: Set<string>;
}) {
  return category.services.filter((service) =>
    selectedServiceIdSet.has(service.id),
  ).length;
}

export function CategoryServicesSelector({
  categories,
  initialCategoryIds,
  initialServiceIds,
  action,
}: CategoryServicesSelectorProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] =
    useState(initialCategoryIds);
  const [activeCategoryId, setActiveCategoryId] = useState(
    initialCategoryIds[0] ?? null,
  );
  const [serviceQueries, setServiceQueries] = useState<Record<string, string>>(
    {},
  );
  const [visibleServiceCounts, setVisibleServiceCounts] = useState<
    Record<string, number>
  >({});
  const [selectedServiceIds, setSelectedServiceIds] = useState(() => {
    const allowedServiceIds = getAllowedServiceIds({
      categories,
      selectedCategoryIds: initialCategoryIds,
    });

    return initialServiceIds.filter((serviceId) =>
      allowedServiceIds.has(serviceId),
    );
  });

  const selectedCategoryIdSet = useMemo(
    () => new Set(selectedCategoryIds),
    [selectedCategoryIds],
  );
  const selectedServiceIdSet = useMemo(
    () => new Set(selectedServiceIds),
    [selectedServiceIds],
  );

  const selectedCategories = categories.filter((category) =>
    selectedCategoryIdSet.has(category.id),
  );
  const activeCategory = selectedCategories.find(
    (category) => category.id === activeCategoryId,
  );
  const activeVisibleServices = activeCategory
    ? getVisibleServices(activeCategory)
    : [];
  const renderedSelectedServiceIdSet = new Set(
    activeVisibleServices
      .filter((service) => selectedServiceIdSet.has(service.id))
      .map((service) => service.id),
  );
  const hiddenSelectedServiceIds = selectedServiceIds.filter(
    (serviceId) => !renderedSelectedServiceIdSet.has(serviceId),
  );

  function getCategoryServiceQuery(categoryId: string) {
    return serviceQueries[categoryId] ?? "";
  }

  function getVisibleServiceCount(categoryId: string) {
    return visibleServiceCounts[categoryId] ?? serviceBatchSize;
  }

  function getServiceMatchesQuery(service: ServiceOption, query: string) {
    const normalizedQuery = normalizeSearchText(query.trim());

    if (!normalizedQuery) {
      return true;
    }

    return normalizeSearchText(
      `${service.name} ${service.description ?? ""}`,
    ).includes(normalizedQuery);
  }

  function getFilteredServices(category: CategoryOption) {
    const query = getCategoryServiceQuery(category.id);

    return category.services
      .filter(
        (service) =>
          selectedServiceIdSet.has(service.id) ||
          getServiceMatchesQuery(service, query),
      )
      .sort((left, right) => {
        const leftSelected = selectedServiceIdSet.has(left.id);
        const rightSelected = selectedServiceIdSet.has(right.id);

        if (leftSelected !== rightSelected) {
          return leftSelected ? -1 : 1;
        }

        return left.name.localeCompare(right.name, "it");
      });
  }

  function getVisibleServices(category: CategoryOption) {
    const filteredServices = getFilteredServices(category);
    const selectedServices = filteredServices.filter((service) =>
      selectedServiceIdSet.has(service.id),
    );
    const unselectedServices = filteredServices.filter(
      (service) => !selectedServiceIdSet.has(service.id),
    );

    return [
      ...selectedServices,
      ...unselectedServices.slice(0, getVisibleServiceCount(category.id)),
    ];
  }

  function hasMoreServices(category: CategoryOption) {
    const filteredServices = getFilteredServices(category);
    const unselectedServices = filteredServices.filter(
      (service) => !selectedServiceIdSet.has(service.id),
    );

    return unselectedServices.length > getVisibleServiceCount(category.id);
  }

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((currentCategoryIds) => {
      const isSelected = currentCategoryIds.includes(categoryId);

      if (!isSelected && currentCategoryIds.length >= maxCategories) {
        return currentCategoryIds;
      }

      const nextCategoryIds = isSelected
        ? currentCategoryIds.filter(
            (currentCategoryId) => currentCategoryId !== categoryId,
          )
        : [...currentCategoryIds, categoryId];

      const allowedServiceIds = getAllowedServiceIds({
        categories,
        selectedCategoryIds: nextCategoryIds,
      });

      setSelectedServiceIds((currentServiceIds) =>
        currentServiceIds.filter((serviceId) =>
          allowedServiceIds.has(serviceId),
        ),
      );
      setActiveCategoryId((currentActiveCategoryId) => {
        if (!isSelected) {
          return categoryId;
        }

        if (currentActiveCategoryId === categoryId) {
          return nextCategoryIds[0] ?? null;
        }

        return currentActiveCategoryId &&
          nextCategoryIds.includes(currentActiveCategoryId)
          ? currentActiveCategoryId
          : (nextCategoryIds[0] ?? null);
      });

      return nextCategoryIds;
    });
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds((currentServiceIds) =>
      currentServiceIds.includes(serviceId)
        ? currentServiceIds.filter(
            (currentServiceId) => currentServiceId !== serviceId,
          )
        : [...currentServiceIds, serviceId],
    );
  }

  return (
    <form action={action} className="mt-6 space-y-8">
      {hiddenSelectedServiceIds.map((serviceId) => (
        <Input
          key={serviceId}
          type="hidden"
          name="serviceIds"
          value={serviceId}
          readOnly
        />
      ))}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Scegli fino a 6 categorie
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
              Le categorie determinano quali richieste puoi vedere. Puoi
              configurare i servizi anche dopo.
            </p>
          </div>

          <Badge variant="neutral">
            {selectedCategoryIds.length}/{maxCategories} categorie selezionate
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => {
            const selected = selectedCategoryIdSet.has(category.id);
            const disabled =
              !selected && selectedCategoryIds.length >= maxCategories;
            const selectedServiceCount = getSelectedServiceCount({
              category,
              selectedServiceIdSet,
            });

            return (
              <label
                key={category.id}
                className={cn(
                  "flex cursor-pointer gap-4 rounded-2xl border border-border-primary bg-surface-primary p-4 transition-colors hover:border-border-focus",
                  selected ? "border-border-focus bg-surface-secondary" : "",
                  disabled ? "cursor-not-allowed opacity-60" : "",
                )}
              >
                <Checkbox
                  name="categoryIds"
                  value={category.id}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => toggleCategory(category.id)}
                  className="mt-1"
                />

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-primary">
                    {category.name}
                  </span>

                  {category.sectorName ? (
                    <span className="mt-1 block text-xs font-medium text-text-muted">
                      {category.sectorName}
                    </span>
                  ) : null}

                  {selected ? (
                    <span className="mt-3 inline-flex text-xs font-medium text-text-secondary">
                      {category.services.length > 0
                        ? `${selectedServiceCount}/${category.services.length} servizi selezionati`
                        : "Servizi opzionali"}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 border-t border-border-primary pt-6">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Servizi opzionali
          </h3>

          <div className="mt-1 max-w-3xl space-y-1 text-sm leading-6 text-text-secondary">
            <p>
              I servizi sono opzionali: aiutano esigenta a mostrarti prima le
              richieste più pertinenti.
            </p>
            <p>
              Non devi selezionare tutto: scegli solo i servizi più importanti
              per la tua attività. Puoi configurarli anche dopo.
            </p>
          </div>
        </div>

        {selectedCategories.length === 0 ? (
          <p className="text-sm text-text-muted">
            Seleziona una categoria per configurare i servizi opzionali.
          </p>
        ) : (
          <div className="space-y-3">
            {selectedCategories.map((category) => {
              const open = activeCategoryId === category.id;
              const selectedServiceCount = getSelectedServiceCount({
                category,
                selectedServiceIdSet,
              });
              const visibleServices = open ? getVisibleServices(category) : [];
              const showServiceSearch =
                open && category.services.length > serviceBatchSize;

              return (
                <div
                  key={category.id}
                  className="overflow-hidden rounded-2xl border border-border-primary bg-surface-primary"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-between gap-4 rounded-none p-4 text-left hover:bg-surface-secondary"
                    aria-expanded={open}
                    onClick={() => {
                      setActiveCategoryId((currentCategoryId) =>
                        currentCategoryId === category.id ? null : category.id,
                      );
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text-primary">
                        {category.name}
                      </span>
                      <span className="mt-1 block text-xs font-normal text-text-secondary">
                        {category.services.length > 0
                          ? `${selectedServiceCount}/${category.services.length} servizi selezionati`
                          : "Nessun servizio disponibile"}
                      </span>
                    </span>

                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-text-secondary transition-transform",
                        open ? "rotate-180" : "",
                      )}
                      aria-hidden="true"
                    />
                  </Button>

                  {open ? (
                    <div className="space-y-4 border-t border-border-primary bg-surface-secondary p-4">
                      {category.services.length === 0 ? (
                        <p className="text-sm text-text-muted">
                          Nessun servizio disponibile per questa categoria.
                        </p>
                      ) : (
                        <>
                          {showServiceSearch ? (
                            <label className="grid gap-2">
                              <span className="text-sm font-medium text-text-primary">
                                Cerca servizio
                              </span>
                              <Input
                                type="search"
                                value={getCategoryServiceQuery(category.id)}
                                onChange={(event) => {
                                  setServiceQueries((currentQueries) => ({
                                    ...currentQueries,
                                    [category.id]: event.target.value,
                                  }));
                                  setVisibleServiceCounts((currentCounts) => ({
                                    ...currentCounts,
                                    [category.id]: serviceBatchSize,
                                  }));
                                }}
                                placeholder="Cerca servizio..."
                              />
                            </label>
                          ) : null}

                          <div className="grid gap-3">
                            {visibleServices.map((service) => {
                              const selected = selectedServiceIdSet.has(
                                service.id,
                              );

                              return (
                                <label
                                  key={`${category.id}-${service.id}`}
                                  className="flex cursor-pointer gap-4 rounded-2xl border border-border-primary bg-surface-primary p-4 transition-colors hover:border-border-focus"
                                >
                                  <Checkbox
                                    name="serviceIds"
                                    value={service.id}
                                    checked={selected}
                                    onChange={() => toggleService(service.id)}
                                    className="mt-1"
                                  />

                                  <span className="min-w-0">
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
                              );
                            })}
                          </div>

                          {visibleServices.length === 0 ? (
                            <p className="text-sm text-text-muted">
                              Nessun servizio trovato con questa ricerca.
                            </p>
                          ) : null}

                          {hasMoreServices(category) ? (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setVisibleServiceCounts((currentCounts) => ({
                                  ...currentCounts,
                                  [category.id]:
                                    getVisibleServiceCount(category.id) +
                                    serviceBatchSize,
                                }));
                              }}
                            >
                              Mostra altri
                            </Button>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex justify-end border-t border-border-primary pt-6">
        <Button type="submit">Salva configurazione</Button>
      </div>
    </form>
  );
}
