"use client";

import { ChevronDown } from "lucide-react";
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

  function getSelectedInterventionCount(interventions: InterventionOption[]) {
    return interventions.filter((intervention) =>
      selectedInterventionIdSet.has(intervention.id),
    ).length;
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

  function getFilteredInterventions(projectGroup: ProjectGroupOption) {
    const query = getQuery(projectGroup.id);

    return projectGroup.interventions
      .filter(
        (intervention) =>
          selectedInterventionIdSet.has(intervention.id) ||
          getInterventionMatchesQuery(intervention, query),
      )
      .sort((left, right) => {
        const leftSelected = selectedInterventionIdSet.has(left.id);
        const rightSelected = selectedInterventionIdSet.has(right.id);

        if (leftSelected !== rightSelected) {
          return leftSelected ? -1 : 1;
        }

        return left.name.localeCompare(right.name, "it");
      });
  }

  function getVisibleInterventions(projectGroup: ProjectGroupOption) {
    const filtered = getFilteredInterventions(projectGroup);
    const selected = filtered.filter((intervention) =>
      selectedInterventionIdSet.has(intervention.id),
    );
    const unselected = filtered.filter(
      (intervention) => !selectedInterventionIdSet.has(intervention.id),
    );

    return [
      ...selected,
      ...unselected.slice(0, getVisibleCount(projectGroup.id)),
    ];
  }

  function hasMoreInterventions(projectGroup: ProjectGroupOption) {
    const filtered = getFilteredInterventions(projectGroup);
    const unselected = filtered.filter(
      (intervention) => !selectedInterventionIdSet.has(intervention.id),
    );

    return unselected.length > getVisibleCount(projectGroup.id);
  }

  // Only the active (expanded) ProjectGroup renders its intervention
  // checkboxes. Selected interventions belonging to collapsed groups still
  // need to reach the form submission, so they get a hidden input here —
  // otherwise collapsing a group after selecting its interventions would
  // silently drop the selection on save.
  const hiddenSelectedInterventionIds = selectedInterventionIds.filter(
    (interventionId) => {
      const activeGroup = projectGroups.find(
        (projectGroup) => projectGroup.id === activeProjectGroupId,
      );

      return !activeGroup?.interventions.some(
        (intervention) => intervention.id === interventionId,
      );
    },
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

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-cantiere-ink">
              Scegli fino a 6 categorie
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-cantiere-ink-secondary">
              Le categorie determinano la tua identità professionale.
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

            return (
              <label
                key={category.id}
                className={cn(
                  "flex cursor-pointer gap-4 rounded-2xl border border-cantiere-hairline bg-cantiere-paper p-4 transition-colors hover:border-cantiere-accent",
                  selected ? "border-cantiere-accent bg-cantiere-linen" : "",
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

                <span className="min-w-0 flex-1 text-sm font-semibold text-cantiere-ink">
                  {category.name}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 border-t border-cantiere-hairline pt-6">
        <div>
          <h3 className="text-base font-semibold text-cantiere-ink">
            Interventi
          </h3>

          <div className="mt-1 max-w-3xl space-y-1 text-sm leading-6 text-cantiere-ink-secondary">
            <p>
              Scegli gli interventi che vuoi ricevere, organizzati per area di
              lavoro. Puoi selezionare un&apos;intera area con &quot;Seleziona
              tutti&quot; oppure scegliere singoli interventi.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {projectGroups.map((projectGroup) => {
            const open = activeProjectGroupId === projectGroup.id;
            const selectedCount = getSelectedInterventionCount(
              projectGroup.interventions,
            );
            const allSelected = isProjectGroupFullySelected(projectGroup);
            const visibleInterventions = getVisibleInterventions(projectGroup);
            const showSearch =
              projectGroup.interventions.length > interventionBatchSize;

            return (
              <div
                key={projectGroup.id}
                className="overflow-hidden rounded-2xl border border-cantiere-hairline bg-cantiere-paper"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-between gap-4 rounded-none p-4 text-left hover:bg-cantiere-linen"
                  aria-expanded={open}
                  onClick={() => {
                    setActiveProjectGroupId((currentId) =>
                      currentId === projectGroup.id ? null : projectGroup.id,
                    );
                  }}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-cantiere-ink">
                      {projectGroup.name}
                    </span>
                    <span className="mt-1 block text-xs font-normal text-cantiere-ink-secondary">
                      {projectGroup.interventions.length > 0
                        ? `${selectedCount}/${projectGroup.interventions.length} interventi selezionati`
                        : "Nessun intervento disponibile"}
                    </span>
                  </span>

                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-cantiere-ink-secondary transition-transform",
                      open ? "rotate-180" : "",
                    )}
                    aria-hidden="true"
                  />
                </Button>

                {open ? (
                  <div className="space-y-4 border-t border-cantiere-hairline bg-cantiere-linen p-4">
                    {projectGroup.interventions.length === 0 ? (
                      <p className="text-sm text-cantiere-ink-secondary">
                        Nessun intervento disponibile per questa area.
                      </p>
                    ) : (
                      <>
                        <label className="flex cursor-pointer items-center gap-3">
                          <Checkbox
                            checked={allSelected}
                            onChange={() => toggleSelectAll(projectGroup)}
                          />
                          <span className="text-sm font-semibold text-cantiere-ink">
                            Seleziona tutti
                          </span>
                        </label>

                        {showSearch ? (
                          <label className="grid gap-2">
                            <span className="text-sm font-medium text-cantiere-ink">
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

                        <div className="grid gap-3">
                          {visibleInterventions.map((intervention) => {
                            const selected = selectedInterventionIdSet.has(
                              intervention.id,
                            );

                            return (
                              <label
                                key={intervention.id}
                                className="flex cursor-pointer gap-4 rounded-2xl border border-cantiere-hairline bg-cantiere-paper p-4 transition-colors hover:border-cantiere-accent"
                              >
                                <Checkbox
                                  name="interventionIds"
                                  value={intervention.id}
                                  checked={selected}
                                  onChange={() =>
                                    toggleIntervention(intervention.id)
                                  }
                                  className="mt-1"
                                />

                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-cantiere-ink">
                                    {intervention.name}
                                  </span>

                                  {intervention.description ? (
                                    <span className="mt-1 block text-sm leading-6 text-cantiere-ink-secondary">
                                      {intervention.description}
                                    </span>
                                  ) : null}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {hasMoreInterventions(projectGroup) ? (
                          <Button
                            type="button"
                            variant="secondary"
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

      <div className="flex justify-end border-t border-cantiere-hairline pt-6">
        <Button type="submit">Salva configurazione</Button>
      </div>
    </form>
  );
}
