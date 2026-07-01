# AutoFinance Web — Próximos pasos

Hoja de ruta del frontend (`autofinance-web`, Angular 22 zoneless, DDD por bounded context). Actualizar a medida que se avanza.

## Estado actual (hecho)

- **Shared kernel**: HTTP (`ApiError`/`ProblemDetail`/`ApiErrorCode`, interceptors auth + error), `Money`/`Currency` + `MoneyPipe`, `NotificationService` + `Toaster` (toast custom, zoneless), `ThemeStore` + toggle (claro/oscuro, no-FOUC), primitivas UI (`input`/`label`/`form-field`/`error`/`tooltip`), `Brand`, `Breadcrumbs`, `AppShell` (topbar + sidebar + drawer móvil), `AuthLayout` (split-screen).
- **IAM** (generic): completo — sign-in, sign-up, `authGuard`/`guestGuard`, rehidratación JWT.
- **Vehicle Offers** (supporting): vertical slice completa — lista con panel de métricas, form a dos paneles con preview en vivo, breadcrumbs, sin DELETE (backend 405).
- **Política de errores**: todo error de backend → **toast**; solo validación de cliente (Signal Forms) → **inline**.
- **Shell**: `/dashboard` (saludo + cards de acceso), transiciones de ruta (`withViewTransitions`).

## 1. Transversales / deuda

- [ ] **Actualizar `DESIGN.md`** con los patrones nuevos: shell sidebar+topbar, breadcrumbs, form a dos paneles + preview, toast custom (no sonner), tooltip Spartan (CDK overlay), split-screen auth, política toast vs inline.
- [ ] **Accesibilidad (AXE / WCAG AA)** sobre lo existente: foco, contraste, labels/aria, navegación por teclado del drawer/sidebar.
- [ ] **Acceso descubrible a cotizaciones por cliente**: hoy la única entrada por-cliente es el botón de ícono por fila en la lista de Clientes; la sidebar "Cotizaciones" va directo al formulario de nueva cotización (no hay listado global; el backend solo expone `?clientId=`). Mejorar la descubribilidad (p. ej. landing de "Cotizaciones" con selector de cliente → su historial, o que la sidebar lleve a Clientes). Decisión del usuario: **dejarlo así por ahora**.
- [ ] **Decidir el campo `Plan`** de la oferta: hoy es etiqueta+cuotas opcional, no usado por el cálculo. Opciones: ocultarlo, o que **prellene el plazo** al generar la cotización (decisión natural al llegar al core).
- [ ] (Opcional) refinar acoplamiento `shared/infrastructure` → `NotificationService` (extraer un puerto si se quiere pureza estricta).
- [ ] (Opcional) eliminar artefactos de verificación: `.claude/launch.json` (config `dist`) si no se versiona.

## 2. Contexto Clients (supporting)

> ⚠️ **Bloqueo de backend**: `ClientsController` solo expone `POST /clients`, `PUT /clients/{id}`, `GET /clients/{id}`. **No hay `GET` lista ni `DELETE`.** Sin `GET` lista no es posible una página de listado ni un selector de clientes (que el core necesitará).
>
> **Decisión previa necesaria**:
> - (a) **Recomendado**: pedir al backend `GET /api/v1/clients` (lista por dealership) y `DELETE` si aplica.
> - (b) Construir Clients **sin lista**: alta/edición + búsqueda/lookup por `documentNumber` o por `id`.

### Contrato backend (verificado)
- `POST /api/v1/clients` — `RegisterClientResource { documentType (DNI/CE…), documentNumber, email?, phone?, address? }` → `201 ClientResource`.
- `PUT /api/v1/clients/{id}` — `UpdateClientResource { email, phone, address }` (la **identidad documento es inmutable** en update).
- `GET /api/v1/clients/{id}` → `200 ClientResource { id, documentType, documentNumber, email, phone, address }`.
- **Sin campo nombre**: el cliente se identifica por documento.
- Error: `DUPLICATE_CLIENT_DOCUMENT` (409) → **toast** (política actual).

### Trabajo (espeja Vehicle Offers)
- `clients/domain/model`: `Client` (entity), VOs `DocumentId` (`documentType` + `documentNumber`), `ContactInfo` (email/phone/address), command `ClientDraft`.
- `clients/infrastructure`: DTOs (request/response), assembler, endpoint dedicado (get-by-id/create/update; **list solo si el backend lo agrega**), `ClientsApi` (fachada).
- `clients/application`: `ClientsStore` (signals).
- `clients/presentation`: rutas (`/clients`, `/clients/new`, `/clients/:id/edit`); vistas lista (si hay backend) + form a dos paneles (con preview) + breadcrumbs. `documentType` como `<select hlmInput>`.
- Habilitar **card "Clientes"** en el dashboard + item en la **sidebar**.
- Tests: assembler, store, error mapping, form, (lista).

## 3. Contexto core: Credit Simulation (el de mayor valor)

Referencias: `docs/ddd/domain-model.md`, `docs/architecture/rest-api.md` (backend), `docs/report/datos-de-prueba.md` (golden data D1/D2/D3), `docs/report/marco-conceptual-formulas.md`.

### Contrato backend
- `POST /api/v1/credit-simulations` (genera y persiste) → `201 SimulationResource`.
- `GET /api/v1/credit-simulations/{id}` → `200`/`404`.
- `GET /api/v1/credit-simulations?clientId={uuid}` → lista (historial por cliente).
- Request (`GenerateSimulationResource`): `clientId`, `vehicleOfferId`, `salePrice`, `currency`, `rateValue`, `rateType` (NOMINAL/EFFECTIVE), `capitalization?`, `initialPercentage`, `balloonPercentage`, `numberOfInstallments`, `frequencyDays`, `daysPerYear`, `gracePlan[]` (S/T/P), `costs[]`, `costOfCapitalAnnual`.
- Response (`SimulationResource`): config + `loanAmount`/`financedBalance` + `indicators` (npv/irr/tcea + ecos de tasa) + `schedule[]` (filas con `appliedCosts[]`) + `summary` (`totalsPerCost`) + `state`. Enums como `String`.
- Errores: `INVALID_SIMULATION_CONFIGURATION`, `PERCENTAGE_OUT_OF_RANGE`, `MISSING_CAPITALIZATION`, `CURRENCY_MISMATCH` (400) y `SCHEDULE_NOT_BALANCED`, `IRR_NOT_BRACKETED` (422) → toast.

### Trabajo (probablemente 4–5 sub-planes)
1. **Domain**: VOs reusando `Money`/`Currency` — `Rate` (value/type/capitalization), `Percentage`, `Term`, `GraceConfiguration`/`GraceType`, `InitialCosts`/`PeriodicCosts`, `ScheduleRow`, `Indicators`, `DiscountFactor`, `BalloonPresentValue`. Entidad/agregado `CreditSimulation`. (El cálculo lo hace el backend; el front modela y muestra.)
2. **Infrastructure**: DTOs (`GenerateSimulationResource`/`SimulationResource` con `MoneyResource`, `RateResource`, `TermResource`, `ScheduleRowResource`, `IndicatorsResource`, `SummaryResource`), assembler, endpoint dedicado (generate/getById/listByClient), `CreditSimulationsApi`.
3. **Application**: `CreditSimulationStore` (signals: configurar, generar, guardar, reabrir, historial).
4. **Presentation — configuración**: form (cliente + oferta por id, moneda, tasa+capitalización, gracia T/P/S, %inicial, %cuotón, plazo/frecuencia, costos). Ojo: selección de cliente depende del gap de la lista de Clients.
5. **Presentation — resultados**: render del **cronograma** (tabla densa, `font-mono tabular-nums`, fila de liquidación del cuotón marcada con `warning`), **panel de transparencia SBS** (TCEA, VAN/TIR con color por signo: success/destructive, desglose de seguros/costos), ecos de tasa. Persistencia/reapertura + historial.
- Validar contra **D1/D2/D3** (replicar Plan 36 / Plan 60 de `datos-de-prueba.md`).
- Habilitar card "Cotización" en el dashboard.

## 4. Cierre de producto

- [ ] Dashboard con **métricas reales** (totales de ofertas/clientes/cotizaciones) + cards de acceso habilitadas.
- [ ] Pulido visual final coherente con el `DESIGN.md` actualizado.
- [ ] Suite e2e amplia (flujos completos: login → cliente → oferta → cotización → guardar/reabrir).
- [ ] Revisión de seguridad/PR final.

## Recomendación de orden

1. Resolver con backend el **gap de lista/DELETE de Clients** (#2). 
2. Si avanza → **Clients**; si no → ir directo al **core Credit Simulation** (#3), que es el valor central (Offers ya tiene lista para seleccionar oferta).
3. Intercalar #1 (DESIGN.md + a11y) como mantenimiento entre contextos.

## Notas / convenciones

- Node v24.18.0 vía nvm (`export PATH="/Users/salim/.nvm/versions/node/v24.18.0/bin:$PATH"`), pnpm, dev en :4242, backend en :8585.
- App **zoneless**: signals escritos desde callbacks async (interceptor, timers) requieren `ApplicationRef.tick()` para refrescar el shell (ver `NotificationService`).
- Errores: backend → toast; cliente → inline. Imports relativos para código de app; alias `@spartan-ng/helm/*` solo para primitivas UI.
