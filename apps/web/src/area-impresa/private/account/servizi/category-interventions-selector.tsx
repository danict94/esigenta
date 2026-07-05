"use client";

import { useMemo, useState } from "react";

import { Badge, Button, Checkbox, Input, cn } from "@esigenta/ui";

type InterventionOption = {
  id: string;
  name: string;
  description: string | null;
};

export type ProjectGroupOption = {
  id: string;
  name: string;
  interventions: InterventionOption[];
};

export type CategoryOption = {
  id: string;
  name: string;
};

export type CategoryInterventionsSelectorProps = {
  categories: CategoryOption[];
  projectGroups: ProjectGroupOption[];
  initialCategoryIds: string[];
  initialInterventionIds: string[];
  action: (formData: FormData) => Promise<void>;
};

const maxCategories = 6;
const interventionBatchSize = 10;
const visibleChipLimit = 12;

// Same hand as site/shell/icons.tsx: 24x24 grid, 1.5px stroke, round
// caps/joins, currentColor. Kept local instead of importing the site/shell
// icon set, since area-impresa and the marketing site are separate domains.
function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6 9.5 12 15.5 18 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M5 12.5 9.5 17 19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getInterventionMatchesQuery(
  intervention: InterventionOption,
  query: string,
) {
  const normalizedQuery = normalizeSearchText(query.trim());

  if (!normalizedQuery) {
    return true;
  }

  return normalizeSearchText(
    `${intervention.name} ${intervention.description ?? ""}`,
  ).includes(normalizedQuery);
}

export function CategoryInterventionsSelector({
  categories,
  projectGroups,
  initialCategoryIds,
  initialInterventionIds,
  action,
}: CategoryInterventionsSelectorProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] =
    useState(initialCategoryIds);
  const [activeProjectGroupId, setActiveProjectGroupId] = useState<
    string | null
  >(projectGroups[0]?.id ?? null);
  const [interventionQueries, setInterventionQueries] = useState<
    Record<string, string>
  >({});
  const [visibleInterventionCounts, setVisibleInterventionCounts] = useState<
    Record<string, number>
  >({});
  const [selectedInterventionIds, setSelectedInterventionIds] = useState(
    initialInterventionIds,
  );

  const selectedCategoryIdSet = useMemo(
    () => new Set(selectedCategoryIds),
    [selectedCategoryIds],
  );
  const selectedInterventionIdSet = useMemo(
    () => new Set(selectedInterventionIds),
    [selectedInterventionIds],
  );

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((currentCategoryIds) => {
      const isSelected = currentCategoryIds.includes(categoryId);

      if (!isSelected && currentCategoryIds.length >= maxCategories) {
        return currentCategoryIds;
      }

      return isSelected
        ? currentCategoryIds.filter(
            (currentCategoryId) => currentCategoryId !== categoryId,
          )
        : [...currentCategoryIds, categoryId];
    });
  }

  function toggleIntervention(interventionId: string) {
    setSelectedInterventionIds((currentInterventionIds) =>
      currentInterventionIds.includes(interventionId)
        ? currentInterventionIds.filter(
            (currentInterventionId) => currentInterventionId !== interventionId,
          )
        : [...currentInterventionIds, interventionId],
    );
  }

  function getSelectedInterventions(interventions: InterventionOption[]) {
    return interventions.filter((intervention) =>
      selectedInterventionIdSet.has(intervention.id),
    );
  }

  function isProjectGroupFullySelected(projectGroup: ProjectGroupOption) {
    return (
      projectGroup.interventions.length > 0 &&
      projectGroup.interventions.every((intervention) =>
        selectedInterventionIdSet.has(intervention.id),
      )
    );
  }

  function toggleSelectAll(projectGroup: ProjectGroupOption) {
    const groupInterventionIds = projectGroup.interventions.map(
      (intervention) => intervention.id,
    );
    const groupInterventionIdSet = new Set(groupInterventionIds);
    const allSelected = isProjectGroupFullySelected(projectGroup);

    setSelectedInterventionIds((currentInterventionIds) => {
      if (allSelected) {
        return currentInterventionIds.filter(
          (interventionId) => !groupInterventionIdSet.has(interventionId),
        );
      }

      const remaining = currentInterventionIds.filter(
        (interventionId) => !groupInterventionIdSet.has(interventionId),
      );

      return [...remaining, ...groupInterventionIds];
    });
  }

  function getQuery(projectGroupId: string) {
    return interventionQueries[projectGroupId] ?? "";
  }

  function getVisibleCount(projectGroupId: string) {
    return visibleInterventionCounts[projectGroupId] ?? interventionBatchSize;
  }

  // Stable alphabetical order regardless of selection — selection state
  // must never reorder this list, otherwise the row a user just clicked
  // jumps away from under the pointer/finger.
  function getFilteredInterventions(projectGroup: ProjectGroupOption) {
    const query = getQuery(projectGroup.id);

    return projectGroup.interventions
      .filter((intervention) => getInterventionMatchesQuery(intervention, query))
      .sort((left, right) => left.name.localeCompare(right.name, "it"));
  }

  function getVisibleInterventions(projectGroup: ProjectGroupOption) {
    return getFilteredInterventions(projectGroup).slice(
      0,
      getVisibleCount(projectGroup.id),
    );
  }

  function hasMoreInterventions(projectGroup: ProjectGroupOption) {
    return (
      getFilteredInterventions(projectGroup).length >
      getVisibleCount(projectGroup.id)
    );
  }

  const activeProjectGroup = projectGroups.find(
    (projectGroup) => projectGroup.id === activeProjectGroupId,
  );
  const renderedInterventionIdSet = new Set(
    activeProjectGroup
      ? getVisibleInterventions(activeProjectGroup).map(
          (intervention) => intervention.id,
        )
      : [],
  );

  // Every selected intervention must reach the form submission even when
  // it isn't currently rendered as a checkbox — either its group is
  // collapsed, or it's outside the active group's current search/page
  // window. Whatever isn't on screen right now gets a hidden input instead.
  const hiddenSelectedInterventionIds = selectedInterventionIds.filter(
    (interventionId) => !renderedInterventionIdSet.has(interventionId),
  );

  return (
    <form action={action} className="mt-6 space-y-8">
      {hiddenSelectedInterventionIds.map((interventionId) => (
        <Input
          key={interventionId}
          type="hidden"
          name="interventionIds"
          value={interventionId}
          readOnly
        />
      ))}

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-eg-terra">
              Identità: fino a 6 categorie
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-eg-ardesia">
              Determinano come la tua impresa si presenta.
            </p>
          </div>

          <Badge variant="neutral">
            {selectedCategoryIds.length}/{maxCategories} selezionate
          </Badge>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const selected = selectedCategoryIdSet.has(category.id);
            const disabled =
              !selected && selectedCategoryIds.length >= maxCategories;

            return (
              <label
                key={category.id}
                className={cn(
                  "relative flex cursor-pointer items-center gap-3 rounded-eg-lg border border-eg-hairline bg-eg-calce p-3 transition-colors hover:border-eg-cotto",
                  selected
                    ? "border-eg-cotto bg-eg-cotto-tint"
                    : "",
                  disabled ? "cursor-not-allowed opacity-60" : "",
                )}
              >
                <Checkbox
                  name="categoryIds"
                  value={category.id}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => toggleCategory(category.id)}
                />

                <span className="min-w-0 flex-1 text-sm font-semibold text-eg-terra">
                  {category.name}
                </span>

                {selected ? (
                  <CheckGlyph className="h-4 w-4 shrink-0 text-eg-cotto" />
                ) : null}
              </label>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 border-t border-eg-hairline pt-6">
        <div>
          <h3 className="text-base font-semibold text-eg-terra">
            Operativo: interventi
          </h3>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-eg-ardesia">
            Scegli gli interventi che vuoi ricevere, organizzati per area di
            lavoro.
          </p>
        </div>

        <div className="space-y-2">
          {projectGroups.map((projectGroup) => {
            const open = activeProjectGroupId === projectGroup.id;
            const selected = getSelectedInterventions(
              projectGroup.interventions,
            );
            const allSelected = isProjectGroupFullySelected(projectGroup);
            const visibleInterventions = getVisibleInterventions(projectGroup);
            const showSearch =
              projectGroup.interventions.length > interventionBatchSize;
            const visibleChips = selected.slice(0, visibleChipLimit);
            const hiddenChipCount = selected.length - visibleChips.length;

            return (
              <div
                key={projectGroup.id}
                className="overflow-hidden rounded-eg-lg border border-eg-hairline bg-eg-calce"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-between gap-4 rounded-none p-4 text-left hover:bg-eg-calce-2"
                  aria-expanded={open}
                  onClick={() => {
                    setActiveProjectGroupId((currentId) =>
                      currentId === projectGroup.id ? null : projectGroup.id,
                    );
                  }}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-eg-terra">
                      {projectGroup.name}
                    </span>
                    <span className="mt-1 block text-xs font-normal text-eg-ardesia">
                      {projectGroup.interventions.length > 0
                        ? `${selected.length}/${projectGroup.interventions.length} interventi selezionati`
                        : "Nessun intervento disponibile"}
                    </span>
                  </span>

                  <ChevronGlyph
                    className={cn(
                      "h-4 w-4 shrink-0 text-eg-ardesia transition-transform",
                      open ? "rotate-180" : "",
                    )}
                  />
                </Button>

                {open ? (
                  <div className="space-y-4 border-t border-eg-hairline bg-eg-calce-2 p-4">
                    {projectGroup.interventions.length === 0 ? (
                      <p className="text-sm text-eg-ardesia">
                        Nessun intervento disponibile per questa area.
                      </p>
                    ) : (
                      <>
                        {selected.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {visibleChips.map((intervention) => (
                              <button
                                key={intervention.id}
                                type="button"
                                onClick={() =>
                                  toggleIntervention(intervention.id)
                                }
                                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-eg-cotto px-3 py-1 text-xs font-medium text-eg-calce transition-colors hover:bg-eg-cotto-dark"
                              >
                                <span className="truncate">
                                  {intervention.name}
                                </span>
                                <CloseGlyph className="h-3 w-3 shrink-0" />
                              </button>
                            ))}

                            {hiddenChipCount > 0 ? (
                              <span className="inline-flex items-center rounded-full bg-eg-calce-2 px-3 py-1 text-xs font-medium text-eg-ardesia">
                                +{hiddenChipCount} altri selezionati
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        <label className="flex cursor-pointer items-center gap-3">
                          <Checkbox
                            checked={allSelected}
                            onChange={() => toggleSelectAll(projectGroup)}
                          />
                          <span className="text-sm font-semibold text-eg-terra">
                            Seleziona tutti
                          </span>
                        </label>

                        {showSearch ? (
                          <label className="grid gap-2">
                            <span className="text-sm font-medium text-eg-terra">
                              Cerca intervento
                            </span>
                            <Input
                              type="search"
                              value={getQuery(projectGroup.id)}
                              onChange={(event) => {
                                setInterventionQueries((current) => ({
                                  ...current,
                                  [projectGroup.id]: event.target.value,
                                }));
                                setVisibleInterventionCounts((current) => ({
                                  ...current,
                                  [projectGroup.id]: interventionBatchSize,
                                }));
                              }}
                              placeholder="Cerca intervento..."
                            />
                          </label>
                        ) : null}

                        <div className="grid gap-2">
                          {visibleInterventions.map((intervention) => {
                            const isSelected = selectedInterventionIdSet.has(
                              intervention.id,
                            );

                            return (
                              <label
                                key={intervention.id}
                                className={cn(
                                  "flex cursor-pointer gap-3 rounded-eg-md border border-eg-hairline bg-eg-calce p-3 transition-colors hover:border-eg-cotto",
                                  isSelected
                                    ? "border-eg-cotto bg-eg-cotto-tint"
                                    : "",
                                )}
                              >
                                <Checkbox
                                  name="interventionIds"
                                  value={intervention.id}
                                  checked={isSelected}
                                  onChange={() =>
                                    toggleIntervention(intervention.id)
                                  }
                                  className="mt-0.5"
                                />

                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-semibold text-eg-terra">
                                    {intervention.name}
                                  </span>

                                  {intervention.description ? (
                                    <span className="mt-1 block text-sm leading-6 text-eg-ardesia">
                                      {intervention.description}
                                    </span>
                                  ) : null}
                                </span>

                                {isSelected ? (
                                  <CheckGlyph className="h-4 w-4 shrink-0 text-eg-cotto" />
                                ) : null}
                              </label>
                            );
                          })}
                        </div>

                        {hasMoreInterventions(projectGroup) ? (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setVisibleInterventionCounts((current) => ({
                                ...current,
                                [projectGroup.id]:
                                  getVisibleCount(projectGroup.id) +
                                  interventionBatchSize,
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
      </section>

      <div className="flex justify-end border-t border-eg-hairline pt-6">
        <Button type="submit">Salva configurazione</Button>
      </div>
    </form>
  );
}
