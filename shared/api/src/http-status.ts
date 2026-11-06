/**
 * The HTTP statuses the app checks, by name, so code reads `HttpStatus.notFound` rather than 404.
 * Static values only; the names follow axios's HttpStatusCode, in camelCase.
 */
export class HttpStatus {
  /** No answer at all: offline, DNS or CORS. Not a real HTTP status; ApiError uses it. */
  static readonly noResponse = 0
  /** The request succeeded and the body holds the result. */
  static readonly ok = 200
  /** Something new was made, such as a squad or a member. */
  static readonly created = 201
  /** Taken in to be done later, such as sending a sign-in code; no body. */
  static readonly accepted = 202
  /** Done, with no body. */
  static readonly noContent = 204
  /** The input was invalid. */
  static readonly badRequest = 400
  /** Not signed in, an expired token or a wrong code. */
  static readonly unauthorized = 401
  /** Missing, or not yours to see. */
  static readonly notFound = 404
  /** Clashes with what is there, such as a member already in the squad. */
  static readonly conflict = 409
  /** Too many requests, or too many tries at a code. */
  static readonly tooManyRequests = 429
  /** A server fault; this and everything above it is worth retrying. */
  static readonly internalServerError = 500
  /** The gateway got no good answer from the service behind it. */
  static readonly badGateway = 502
}
