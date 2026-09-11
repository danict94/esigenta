export function initializeInterventionSelection(
  persistedInterventionIds: readonly string[],
): string[] {
  return [...persistedInterventionIds]
}

export function toggleInterventionSelection(
  currentInterventionIds: readonly string[],
  interventionId: string,
): string[] {
  return currentInterventionIds.includes(interventionId)
    ? currentInterventionIds.filter((currentId) => currentId !== interventionId)
    : [...currentInterventionIds, interventionId]
}

export function replaceProjectGroupInterventionSelection(
  currentInterventionIds: readonly string[],
  projectGroupInterventionIds: readonly string[],
  selectAll: boolean,
): string[] {
  const groupIds = new Set(projectGroupInterventionIds)
  const outsideGroup = currentInterventionIds.filter((id) => !groupIds.has(id))

  return selectAll
    ? [...outsideGroup, ...projectGroupInterventionIds]
    : outsideGroup
}
