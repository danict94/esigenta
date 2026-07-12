export { getCompanyProfilePage } from "./get-profile-page"
export type {
  GetCompanyProfilePageResult,
  CompanyProfileData,
  CompanyProfileCategory,
  CompanyProfileIntervention,
  CompanyContactChangePendingRequest,
  CompanyProfileCreditSummary,
} from "./get-profile-page"

export { updateCompanyProfile } from "./update-profile"
export type {
  UpdateCompanyProfileInput,
  UpdateCompanyProfileResult,
  UpdateCompanyProfileErrorCode,
} from "./update-profile"

export { requestCompanyPhoneContactChange } from "./request-phone-change"
export type {
  RequestPhoneChangeInput,
  RequestPhoneChangeResult,
  RequestPhoneChangeErrorCode,
} from "./request-phone-change"

export { deactivateCompanyAccount } from "./deactivate-account"
export type {
  DeactivateAccountResult,
  DeactivateAccountErrorCode,
} from "./deactivate-account"

export { updateCompanyPublicProfile } from "./update-public-profile"
export type {
  UpdateCompanyPublicProfileInput,
  UpdateCompanyPublicProfileResult,
  UpdateCompanyPublicProfileErrorCode,
} from "./update-public-profile"

export { generateUniqueCompanyPublicSlug } from "./generate-company-public-slug"

export {
  deriveCompanyProfileCompleteness,
  companyProfileCompletenessFieldLabels,
} from "./derive-company-profile-completeness"
export type {
  CompanyProfileCompleteness,
  CompanyProfileCompletenessField,
  DeriveCompanyProfileCompletenessInput,
} from "./derive-company-profile-completeness"
