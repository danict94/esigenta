export type DeactivateCompanyAccountInput = {
  companyId: string
  userId: string
}

export type DeactivateCompanyAccountResult =
  | {
      ok: true
    }
  | {
      ok: false
      code:
        | "invalid_company"
        | "invalid_user"
        | "membership_not_found"
        | "not_owner"
      message: string
    }

