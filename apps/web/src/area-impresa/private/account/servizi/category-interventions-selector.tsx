"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

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
  /**
   * Already resolved server-side (Category.projectGroupIds, see
   * packages/domain/src/company/services/get-services-configuration-page.ts)
   * — used here only to decide which already-fetched ProjectGroups to list
   * first for the currently selected categories. No category -> group ->
   * intervention mapping is computed in this component.
   */
  projectGroupIds: string[];
};

export type CategoryInterventionsSelectorProps = {
  categories: CategoryOption[];
  projectGroups: ProjectGroupOption[];
  initialCategoryIds: string[];
  initialInterventionIds: string[];
  action: (formData: FormData) => Promise<void>;
  /**
   * View/edit mode is a display concern owned by apps/web (see
   * services-configuration-page.tsx) — the server decides whether to open
   * in edit mode (unconfigured company, or an error just occurred) and
   * this component only holds the resulting local UI state.
   */
  startInEditMode: boolean;
};

const maxCategories = 6;
const interventionBatchSize = 10;

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

// Which ProjectGroup ids belong to the given categories — a plain lookup
// over data already resolved server-side (CategoryOption.projectGroupIds),
// not a re-derivation of the category -> group mapping itself.
function computePriorityProjectGroupIds(
  categories: CategoryOption[],
  categoryIds: string[],
): Set<string> {
  const categoryIdSet = new Set(categoryIds);
  const groupIds = new Set<string>();

  for (const category of categories) {
    if (!categoryIdSet.has(category.id)) {
      continue;
    }

    for (const groupId of category.projectGroupIds) {
      groupIds.add(groupId);
    }
  }

  return groupIds;
}

// Order-independent comparison — the form works with plain string[] ids,
// not Sets, so equality must ignore order and duplicates.
function areIdSetsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }

  const setA = new Set(a);

  return b.every((id) => setA.has(id));
}

// "A", "A e B", "A, B e C" — Italian list join for the view-mode summary
// sentence. Display-only formatting, not a taxonomy/business rule.
function formatNameList(names: string[]): string {
  if (names.length <= 1) {
    return names[0] ?? "";
  }

  if (names.length === 2) {
    return `${names[0]} e ${names[1]}`;
  }

  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

// Reads pending state from the nearest ancestor <form>, so Save reflects
// the actual in-flight submission and disables itself against a double
// click/tap without any extra state wiring in the parent component.
function SaveConfigurationButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvataggio…" : "Salva configurazione"}
    </Button>
  );
}

export function CategoryInterventionsSelector({
  categories,
  projectGroups,
  initialCategoryIds,
  initialInterventionIds,
  action,
  startInEditMode,
}: CategoryInterventionsSelectorProps) {
  const [mode, setMode] = useState<"view" | "edit">(
    startInEditMode ? "edit" : "view",
  );
  const [selectedCategoryIds, setSelectedCategoryIds] =
    useState(initialCategoryIds);
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

  // Priority groups follow the LIVE category selection (not just the saved
  // one) — checking a category during this same edit immediately promotes
  // its groups, so the list reacts to what the user is doing right now.
  // When no category is selected, there is nothing to prioritize: every
  // group renders in the single main list, matching the pre-UX2 behaviour.
  const priorityProjectGroupIdSet = useMemo(
    () => computePriorityProjectGroupIds(categories, selectedCategoryIds),
    [categories, selectedCategoryIds],
  );
  const priorityGroups = useMemo(
    () =>
      priorityProjectGroupIdSet.size === 0
        ? projectGroups
        : projectGroups.filter((group) =>
            priorityProjectGroupIdSet.has(group.id),
          ),
    [projectGroups, priorityProjectGroupIdSet],
  );
  const otherGroups = useMemo(
    () =>
      priorityProjectGroupIdSet.size === 0
        ? []
        : projectGroups.filter(
            (group) => !priorityProjectGroupIdSet.has(group.id),
          ),
    [projectGroups, priorityProjectGroupIdSet],
  );

  const [activeProjectGroupId, setActiveProjectGroupId] = useState<
    string | null
  >(() => {
    const initialPriorityIds = computePriorityProjectGroupIds(
      categories,
      initialCategoryIds,
    );
    const firstPriorityGroup = projectGroups.find((group) =>
      initialPriorityIds.has(group.id),
    );

    return (firstPriorityGroup ?? projectGroups[0])?.id ?? null;
  });

  // "Altri servizi" opens by default only if it already contains a saved
  // selection — an existing, deliberate fuori-categoria choice must never
  // start out of sight. Otherwise it stays collapsed to keep the page
  // short. Computed once from the saved (initial*) props, not re-evaluated
  // as the user edits, so collapsing it never feels like it is fighting
  // the user's own later changes.
  const [showOtherGroups, setShowOtherGroups] = useState(() => {
    const initialPriorityIds = computePriorityProjectGroupIds(
      categories,
      initialCategoryIds,
    );

    if (initialPriorityIds.size === 0) {
      return true;
    }

    const initialSelectedInterventionIdSet = new Set(initialInterventionIds);

    return projectGroups.some(
      (group) =>
        !initialPriorityIds.has(group.id) &&
        group.interventions.some((intervention) =>
          initialSelectedInterventionIdSet.has(intervention.id),
        ),
    );
  });

  // The currently open group must never disappear from view. If checking a
  // different category moves it from the priority list into "Altri
  // servizi" while that section happens to be collapsed, force it visible
  // rather than silently hiding an open, possibly mid-edit group.
  const isOtherGroupsVisible =
    showOtherGroups ||
    otherGroups.some((group) => group.id === activeProjectGroupId);

  // Dirty state compares current local selections against the last
  // saved configuration (the initial* props) — not against whatever was
  // on screen a moment ago, so it stays correct across toggles in either
  // direction, including toggling something back to its saved value.
  const isDirty = useMemo(
    () =>
      !areIdSetsEqual(selectedCategoryIds, initialCategoryIds) ||
      !areIdSetsEqual(selectedInterventionIds, initialInterventionIds),
    [
      selectedCategoryIds,
      selectedInterventionIds,
      initialCategoryIds,
      initialInterventionIds,
    ],
  );

  // Nothing to cancel back to for a company that has never saved a
  // configuration — Annulla is only meaningful once a saved state exists.
  const canCancel =
    initialCategoryIds.length > 0 || initialInterventionIds.length > 0;

  function handleCancel() {
    setSelectedCategoryIds(initialCategoryIds);
    setSelectedInterventionIds(initialInterventionIds);
    setMode("view");
  }

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

  // Shared by both the priority list and the "Altri servizi" list below —
  // one accordion row implementation, rendered for two different arrays,
  // never duplicated markup.
  function renderProjectGroupRow(projectGroup: ProjectGroupOption) {
    const open = activeProjectGroupId === projectGroup.id;
    const selected = getSelectedInterventions(projectGroup.interventions);
    const allSelected = isProjectGroupFullySelected(projectGroup);
    const isPartiallySelected = selected.length > 0 && !allSelected;
    const visibleInterventions = getVisibleInterventions(projectGroup);
    const showSearch = projectGroup.interventions.length > interventionBatchSize;

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
                <label className="flex cursor-pointer items-center gap-3 py-1">
                  {/* Raw input (not the shared Checkbox) only because the
                      "mixed" visual state requires setting the DOM
                      .indeterminate property via a ref, which Checkbox does
                      not currently expose — same classes/token as Checkbox,
                      no design-system change. */}
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(node) => {
                      if (node) {
                        node.indeterminate = isPartiallySelected;
                      }
                    }}
                    onChange={() => toggleSelectAll(projectGroup)}
                    className="h-4 w-4 accent-eg-cotto disabled:cursor-not-allowed disabled:opacity-60"
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
                          isSelected ? "border-eg-cotto bg-eg-cotto-tint" : "",
                        )}
                      >
                        <Checkbox
                          name="interventionIds"
                          value={intervention.id}
                          checked={isSelected}
                          onChange={() => toggleIntervention(intervention.id)}
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

  // Riepilogo — shown for an already-configured company instead of the
  // full form, per the approved view/edit split. Built only from the
  // saved (initial*) ids, never from the in-progress local selection, so
  // it can never show something that hasn't actually been saved.
  if (mode === "view") {
    const savedCategoryNames = categories
      .filter((category) => initialCategoryIds.includes(category.id))
      .map((category) => category.name);
    const savedInterventionCount = initialInterventionIds.length;
    const hasSavedConfiguration = savedCategoryNames.length > 0;

    return (
      <div className="mt-6 space-y-5">
        <p className="text-sm leading-6 text-eg-terra">
          {hasSavedConfiguration ? (
            <>
              Operi come{" "}
              <span className="font-semibold">
                {formatNameList(savedCategoryNames)}
              </span>
              . Hai selezionato{" "}
              <span className="font-semibold">
                {savedInterventionCount}{" "}
                {savedInterventionCount === 1 ? "intervento" : "interventi"}
              </span>
              .
            </>
          ) : (
            "Non hai ancora selezionato categorie o interventi."
          )}
        </p>

        <div className="flex justify-end">
          <Button type="button" onClick={() => setMode("edit")}>
            {hasSavedConfiguration ? "Modifica configurazione" : "Configura ora"}
          </Button>
        </div>
      </div>
    );
  }

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
            lavoro, a partire da quelle delle tue categorie.
          </p>
        </div>

        <div className="space-y-2">{priorityGroups.map(renderProjectGroupRow)}</div>

        {otherGroups.length > 0 ? (
          <div className="space-y-2 border-t border-eg-hairline pt-4">
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full justify-between gap-4 p-3 text-left"
              aria-expanded={isOtherGroupsVisible}
              onClick={() => setShowOtherGroups((current) => !current)}
            >
              <span className="text-sm font-semibold text-eg-terra">
                Altri servizi disponibili ({otherGroups.length})
              </span>

              <ChevronGlyph
                className={cn(
                  "h-4 w-4 shrink-0 text-eg-ardesia transition-transform",
                  isOtherGroupsVisible ? "rotate-180" : "",
                )}
              />
            </Button>

            {isOtherGroupsVisible ? (
              <div className="space-y-2">
                {otherGroups.map(renderProjectGroupRow)}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="flex flex-col gap-4 border-t border-eg-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={cn(
            "text-sm",
            isDirty ? "font-medium text-eg-terra" : "text-eg-ardesia",
          )}
        >
          {isDirty ? "Modifiche non salvate" : "Nessuna modifica da salvare"}
        </p>

        <div className="flex justify-end gap-3">
          {canCancel ? (
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Annulla
            </Button>
          ) : null}

          <SaveConfigurationButton />
        </div>
      </div>
    </form>
  );
}
