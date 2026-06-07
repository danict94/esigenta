export type LegalMode =
  | "initial_personal"
  | "business_registered"

export type LegalProfile = {
  projectName: string
  legalMode: LegalMode
  ownerName: string
  businessName: string
  vatNumber: string
  taxCode: string
  registeredOffice: string
  privacyEmail: string
  pecEmail: string
  supportEmail: string
  lastUpdated: string
  hasVatNumber: boolean
  isCommercialLaunchReady: boolean
}

export const legalProfile: LegalProfile = {
  projectName: "Esigenta",
  legalMode: "initial_personal",
  ownerName: "[Nome titolare]",
  businessName: "",
  vatNumber: "",
  taxCode: "",
  registeredOffice: "",
  privacyEmail: "[Email privacy]",
  pecEmail: "",
  supportEmail: "[Email supporto]",
  lastUpdated: "2026-06-07",
  hasVatNumber: false,
  isCommercialLaunchReady: false,
}

export function getLegalControllerLabel() {
  if (
    legalProfile.legalMode === "business_registered" &&
    legalProfile.businessName
  ) {
    return legalProfile.businessName
  }

  return legalProfile.ownerName
}

export function getInitialPhaseNotice() {
  if (legalProfile.legalMode === "business_registered") {
    return null
  }

  return "Servizio in fase iniziale; i dati del titolare saranno completati prima dell'operativita commerciale stabile."
}

export function getFiscalUpdateNotice() {
  if (legalProfile.hasVatNumber) {
    return null
  }

  return "Dati fiscali e societari saranno aggiornati quando disponibili."
}
