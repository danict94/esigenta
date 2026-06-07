/**
 * Esigenta V2 - Request Errors
 *
 * Small typed errors for request creation and verification.
 */

export class RequestFlowError extends Error {
  statusCode: number
  code: string

  constructor({
    code,
    message,
    statusCode,
  }: {
    code: string
    message: string
    statusCode: number
  }) {
    super(message)
    this.name = "RequestFlowError"
    this.code = code
    this.statusCode = statusCode
  }
}
