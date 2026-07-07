/**
 * Wire shapes for the sign-in endpoint, mirroring the backend resources exactly.
 */

/** Request body for `POST /authentication/sign-in` (`SignInResource`). */
export interface SignInRequest {
  identifier: string;
  password: string;
}

/** Response body for a successful sign-in (`AuthenticatedUserResource`). */
export interface AuthenticatedUserResource {
  userId: string;
  username: string;
  dealershipId: string;
  token: string;
}
