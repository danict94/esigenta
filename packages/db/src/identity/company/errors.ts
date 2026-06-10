export class CompanyAuthorizationError extends Error {
  constructor(message = "Company authorization required.") {
    super(message)

    this.name =
      "CompanyAuthorizationError"
  }
}

export class AmbiguousCompanyMembershipError extends Error {
  constructor() {
    super(
      "Questo account risulta collegato a più imprese. Per la release Esigenta supporta una sola impresa per account.",
    )

    this.name =
      "AmbiguousCompanyMembershipError"
  }
}

export class CompanyDeactivatedError extends Error {
  constructor() {
    super(
      "Questa impresa è stata disattivata.",
    )

    this.name =
      "CompanyDeactivatedError"
  }
}
