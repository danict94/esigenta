export type RequestCommercialFields = {
  creditCost: number | null;
  maxUnlocks: number | null;
  unlockCount: number;
};

export type RequestCommercialState = RequestCommercialFields & {
  availableUnlockSlots: number | null;
  isCommerciallyConfigured: boolean;
  isSoldOut: boolean;
};

export function getRequestCommercialState({
  creditCost,
  maxUnlocks,
  unlockCount,
}: RequestCommercialFields): RequestCommercialState {
  const availableUnlockSlots =
    maxUnlocks === null ? null : Math.max(maxUnlocks - unlockCount, 0);

  return {
    creditCost,
    maxUnlocks,
    unlockCount,
    availableUnlockSlots,
    isCommerciallyConfigured: creditCost !== null && maxUnlocks !== null,
    isSoldOut: maxUnlocks !== null && maxUnlocks - unlockCount <= 0,
  };
}

export function formatCreditCost(value: number | null) {
  return value === null ? "Costo non impostato" : `${value} crediti`;
}

export function formatUnlockAvailability(value: number | null) {
  return value === null ? "Disponibilità non impostata" : `${value} posti disponibili`;
}

export function getCommercialStatusLabel(state: RequestCommercialState) {
  if (!state.isCommerciallyConfigured) {
    return "Non ancora acquistabile";
  }

  if (state.isSoldOut) {
    return "Posti terminati";
  }

  return "Disponibile";
}
