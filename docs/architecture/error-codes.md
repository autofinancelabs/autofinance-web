# Error codes (API contract)

Every error response is an RFC 9457 **`application/problem+json`** body. The frontend must react to the
stable machine-readable **`code`**, not to the human `detail`. This catalog is kept in sync with the code
by `ErrorCodesDocumentedTest` (every `ErrorCode` enum value must appear here).

## Response shape

```json
{
  "type": "https://api.autofinance/errors/duplicate-ruc",
  "title": "Conflict",
  "status": 409,
  "detail": "A dealership with RUC 20123456789 already exists",
  "instance": "/api/v1/dealerships",
  "code": "DUPLICATE_RUC",
  "timestamp": "2026-06-26T06:27:05.183Z"
}
```

| Field       | Meaning                                                                       |
|-------------|-------------------------------------------------------------------------------|
| `type`      | Stable URI per code (`…/errors/<kebab-code>`).                                |
| `title`     | HTTP reason phrase.                                                           |
| `status`    | HTTP status (derived from the code's category — see below).                   |
| `detail`    | **Developer-facing**. Do NOT show to end users — translate by `code` instead. |
| `instance`  | The request path.                                                             |
| `code`      | **The contract.** Stable, machine-readable; map it to a localized message.    |
| `timestamp` | ISO-8601 UTC, millisecond precision.                                          |
| `errors`    | Present only on validation failures: array of `{ "field", "message" }`.       |

## How to consume it

- **Switch on `code`**, never on `detail` or the prose. `code` is stable across releases; `detail` and
  `title` are not.
- **`status` follows the category**: `VALIDATION → 400`, `UNPROCESSABLE → 422`, `NOT_FOUND → 404`,
  `CONFLICT → 409`, `UNAUTHORIZED → 401`, `FORBIDDEN → 403`, `INTERNAL → 500`.
- **Form validation**: on `VALIDATION_FAILED` read `errors[]` (`field` + `message`, sorted by field) to
  highlight inputs. The `code` covers the overall failure; `errors[]` the per-field detail.
- **Auth**: on `UNAUTHENTICATED` (401) redirect to sign-in / refresh; on `ACCESS_DENIED` (403) show a
  "not allowed" message.
- **Never surface `INTERNAL_ERROR` detail** — it is intentionally generic ("An unexpected error occurred.").

## Catalog

The **endpoint(s)** column lists where each code can surface. All paths are prefixed `/api/v1`.

### Web / framework (`WebErrorCode`)
These are cross-cutting (not tied to one context):

| code | status | category | endpoint(s) | when |
|------|--------|----------|-------------|------|
| `VALIDATION_FAILED` | 400 | VALIDATION | any write endpoint (`POST`/`PUT` with a body) | Bean-validation failure (also carries `errors[]`), or a rejected value-object/enum input. |
| `MALFORMED_REQUEST` | 400 | VALIDATION | any endpoint that accepts a JSON body | Unreadable/malformed JSON body or a type mismatch in the request. |
| `UNAUTHENTICATED` | 401 | UNAUTHORIZED | any authenticated endpoint (everything except register + sign-in + docs) | Missing or invalid bearer token. |
| `ACCESS_DENIED` | 403 | FORBIDDEN | — (no roles in v1; wired but not triggered) | Authenticated but not allowed to perform the action. |
| `INTERNAL_ERROR` | 500 | INTERNAL | any endpoint | Unexpected server error (no internals leaked). |

### Shared kernel (`SharedErrorCode`)
| code | status | category | endpoint(s) | when |
|------|--------|----------|-------------|------|
| `CURRENCY_MISMATCH` | 400 | VALIDATION | `POST /credit-simulations` | Arithmetic attempted across two different currencies. |

### Credit Simulation (`SimulationErrorCode`)
All surface on `POST /credit-simulations` (the generate use case).

| code | status | category | endpoint(s) | when |
|------|--------|----------|-------------|------|
| `INVALID_SIMULATION_CONFIGURATION` | 400 | VALIDATION | `POST /credit-simulations` | Cross-field invariant broken (e.g. initial % + balloon % ≥ 1). |
| `PERCENTAGE_OUT_OF_RANGE` | 400 | VALIDATION | `POST /credit-simulations` | A percentage is not within `[0, 1)`. |
| `MISSING_CAPITALIZATION` | 400 | VALIDATION | `POST /credit-simulations` | A nominal rate without a capitalization frequency. |
| `SCHEDULE_NOT_BALANCED` | 422 | UNPROCESSABLE | `POST /credit-simulations` | The generated schedule's final balance is not ~0. |
| `IRR_NOT_BRACKETED` | 422 | UNPROCESSABLE | `POST /credit-simulations` | The IRR bisection cannot bracket a root (non-conventional cash flows). |
| `CLIENT_NOT_FOUND` | 422 | UNPROCESSABLE | `POST /credit-simulations` | The referenced client does not exist in the dealership. |
| `VEHICLE_OFFER_NOT_FOUND` | 422 | UNPROCESSABLE | `POST /credit-simulations` | The referenced vehicle offer does not exist in the dealership. |

### Vehicle Offers (`VehicleOfferErrorCode`)
| code | status | category | endpoint(s) | when |
|------|--------|----------|-------------|------|
| `INVALID_VEHICLE_OFFER` | 400 | VALIDATION | `POST /vehicle-offers`, `PUT /vehicle-offers/{id}` | A vehicle offer invariant is broken (e.g. non-positive sale price). |

### Clients (`ClientErrorCode`)
| code | status | category | endpoint(s) | when |
|------|--------|----------|-------------|------|
| `DUPLICATE_CLIENT_DOCUMENT` | 409 | CONFLICT | `POST /clients` | A client with the same identity document already exists in the dealership. |

### IAM (`IamErrorCode`)
| code | status | category | endpoint(s) | when |
|------|--------|----------|-------------|------|
| `DUPLICATE_RUC` | 409 | CONFLICT | `POST /dealerships` | A dealership with that RUC already exists. |
| `DUPLICATE_EMAIL` | 409 | CONFLICT | `POST /dealerships` | A user with that email already exists. |
| `DUPLICATE_USERNAME` | 409 | CONFLICT | `POST /dealerships` | A user with that username already exists. |
| `INVALID_CREDENTIALS` | 401 | UNAUTHORIZED | `POST /authentication/sign-in` | Sign-in failed (unknown identifier or wrong password — not disclosed which). |

## Example payloads

**Validation (400)** — note `errors[]`:
```json
{
  "type": "https://api.autofinance/errors/validation-failed",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid request content.",
  "instance": "/api/v1/credit-simulations",
  "code": "VALIDATION_FAILED",
  "timestamp": "2026-06-26T06:27:05.183Z",
  "errors": [
    { "field": "numberOfInstallments", "message": "must be greater than 0" },
    { "field": "rateValue", "message": "must not be null" }
  ]
}
```

**Unauthenticated (401):**
```json
{
  "type": "https://api.autofinance/errors/unauthenticated",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authentication is required to access this resource.",
  "instance": "/api/v1/credit-simulations/3f...",
  "code": "UNAUTHENTICATED",
  "timestamp": "2026-06-26T06:27:05.183Z"
}
```

**Conflict (409):**
```json
{
  "type": "https://api.autofinance/errors/duplicate-client-document",
  "title": "Conflict",
  "status": 409,
  "detail": "A client with document DNI 12345678 already exists in this dealership",
  "instance": "/api/v1/clients",
  "code": "DUPLICATE_CLIENT_DOCUMENT",
  "timestamp": "2026-06-26T06:27:05.183Z"
}
```
