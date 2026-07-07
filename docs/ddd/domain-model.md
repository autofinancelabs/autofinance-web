# Modelo de dominio — Credit Simulation (core)

> Modelo de dominio **táctico** del contexto core **Credit Simulation**: agregado, entidades, value
> objects, servicios de dominio, repositorio, factory y eventos, cada uno justificado con el árbol de
> decisión del skill `ddd-playbook`. Las fórmulas de referencia viven en `docs/guides/` (resumidas en
> [marco-conceptual-formulas.md](../report/marco-conceptual-formulas.md)) y los tipos/restricciones en
> [analisis-de-datos.md](../report/analisis-de-datos.md); aquí se modela el **dominio**. Diagrama de
> clases: [credit-simulation-class-diagram.puml](../diagrams/credit-simulation-class-diagram.puml).

## Alcance

Se modela en profundidad el contexto **core** (Credit Simulation). Clients y Vehicle Offers se modelan
de forma **ligera** (CRUD); IAM solo se menciona. Identificadores del modelo en inglés.

## Árbol de decisión aplicado

| Pregunta                                               | Resultado                               |
|--------------------------------------------------------|-----------------------------------------|
| ¿Tiene identidad que persiste en el tiempo?            | **Entity** (a menudo raíz de agregado). |
| ¿Se define por sus valores y es intercambiable?        | **Value Object** (inmutable).           |
| ¿Varios objetos deben ser consistentes juntos?         | **Aggregate** tras una raíz.            |
| ¿Lógica que abarca varios objetos o sin hogar natural? | **Domain Service** (stateless).         |
| ¿Algo ocurrió a lo que otros reaccionan?               | **Domain Event**.                       |
| ¿Persistir/recuperar un agregado?                      | **Repository** (uno por raíz).          |
| ¿Construcción compleja de un objeto válido?            | **Factory**.                            |

Cada bloque siguiente cita la regla que lo justifica.

## Agregado raíz: `CreditSimulation`

**Una** raíz que agrupa configuración + cronograma + indicadores, porque el **cuadre** (saldo final
≈ 0, `installment = interest + amortization`, cuotón liquidado) es una invariante que abarca todas las
filas y debe valer dentro de **una transacción** (regla: varios objetos consistentes juntos → agregado
tras una raíz). Referencia a otros agregados **solo por ID** (`ClientId`, `VehicleOfferId`) — regla de
agregados pequeños y referencias by-id. Lleva además un `DealershipId` (el **tenant**): discrimina y
aísla la simulación por concesionaria (`@TenantId` de Hibernate).

### Aggregate Design Canvas — `CreditSimulation`

| Sección                                       | Contenido                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|-----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Name**                                      | `CreditSimulation` (lifespan: una operación de crédito).                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Description / por qué esta frontera**       | Agrupa configuración, cronograma e indicadores porque el cuadre es una invariante transaccional que cruza todas las filas; mantenerlos juntos evita un modelo anémico con la lógica dispersa en servicios.                                                                                                                                                                                                                                                                                             |
| **State transitions**                         | `Draft → Configured → Generated → Saved → Reopened → (Reconfigured → Generated) → Saved`.                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Enforced invariants & corrective policies** | (a) `initialPercentage + balloonPercentage < 1`; (b) capitalización obligatoria si `RateType = NOMINAL`; (c) `(totalGrace + partialGrace) < numberOfInstallments`; (d) moneda única ∈ {PEN, USD} en toda la operación; (e) `loanAmount > 0`; (f) tras generar: último `closingBalance` ≈ 0 (tolerancia), `installment = interest + amortization` en periodos S, el bloque del cuotón crece a `SI×(1+jB)` (capitaliza interés + desgravamen) y se liquida. **Corrective policies: ninguna** (consistencia fuerte; todo en una transacción). |
| **Handled commands & created events**         | Comandos: `ConfigureFinancing`, `GenerateSimulation`, `SaveSimulation`, `ReopenSimulation`, `ReconfigureSimulation`. Eventos: `SimulationGenerated`, `ScheduleGenerated`, `BalloonSettled`, `IndicatorsCalculated` (internos).                                                                                                                                                                                                                                                                         |
| **Throughput**                                | Bajo: un asesor por simulación; sin contención (≈1 cliente por instancia) → optimistic locking suficiente.                                                                                                                                                                                                                                                                                                                                                                                             |
| **Size**                                      | Acotado: `n` filas (Plan 36/60) + 1 liquidación; instancia pequeña.                                                                                                                                                                                                                                                                                                                                                                                                                                    |

> **Nota de persistencia (mapeo).** El agregado guarda como campos **mapeados** dos listas planas:
> `grace: List<GraceType>` y `costs: List<Cost>` (tablas hijas ordenadas `grace_periods` y
> `credit_simulation_costs`). Los value objects `GraceConfiguration` y `Costs` son **wrappers
> transitorios** que el agregado reconstruye sobre esas listas para alimentar a los calculadores; el
> **constructor sí acepta** `GraceConfiguration`/`Costs` y los desempaqueta. El **cronograma**
> (`schedule: List<ScheduleRow>`) y el **resumen** (`summary: SimulationSummary`, con `totalsPerCost`)
> se persisten como **snapshots `jsonb`** (serializados por Jackson) en la propia tabla
> `credit_simulations`, no como tablas hijas. Ver [database-model.md](../architecture/database-model.md).

## Entities

| Entity             | Rol               | Justificación                                                             |
|--------------------|-------------------|---------------------------------------------------------------------------|
| `CreditSimulation` | Raíz del agregado | Tiene identidad (`SimulationId`) y ciclo de vida (estados Draft→…→Saved). |

`ScheduleRow` **no** es entidad: no tiene identidad propia ni ciclo de vida fuera del cronograma, es
intercambiable por sus valores y debe ser inmutable → **Value Object** (regla: definido por valores →
VO). Se modela como VO dentro del agregado.

## Value Objects

Inmutables, con validación/comportamiento dentro (regla: preferir VO sobre primitivo cuando el
concepto lleva reglas).

| Value Object                  | Atributos                                                                                                | Invariante propia                                                             | Justificación                                                                              |
|-------------------------------|----------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `Money`                       | `amount: BigDecimal`, `currency: Currency`                                                               | `amount` escala interna alta; prohíbe operar montos de distinta moneda        | Concepto con reglas (no un `BigDecimal` suelto).                                           |
| `Currency`                    | enum `PEN`/`USD`                                                                                         | valor del enum                                                                | Categoría cerrada.                                                                         |
| `Rate`                        | `value: BigDecimal`, `type: RateType` (NOMINAL/EFFECTIVE), `capitalization: Capitalization?`             | capitalización obligatoria si NOMINAL                                         | VO con comportamiento `toEffectiveAnnual()`, `toPeriodicRate(frequencyDays, daysPerYear)`. |
| `Percentage`                  | `value: BigDecimal`                                                                                      | `∈ [0, 1)`                                                                    | Regla de rango.                                                                            |
| `Term`                        | `numberOfInstallments`, `frequencyDays`, `installmentsPerYear`                                           | `numberOfInstallments ≥ 1`; `installmentsPerYear = daysPerYear/frequencyDays` | Agrupa el plazo con reglas derivadas.                                                      |
| `GraceConfiguration`          | lista/conteos de `GraceType`                                                                             | `(totalGrace + partialGrace) < n`; longitud ≤ n                               | Regla de cruce.                                                                            |
| `GraceType`                   | enum `NONE`/`TOTAL`/`PARTIAL` (≙ S/T/P)                                                                  | —                                                                             | Categoría cerrada.                                                                         |
| `InitialCosts`                | notariales, registrales, tasación, comisiones                                                            | cada uno `≥ 0`                                                                | Agrupa costos iniciales.                                                                   |
| `PeriodicCosts`               | `creditLifeInsuranceRate` (TSD), `allRiskInsurance` (TSR), `gps`, `shippingFees`, `adminFees`            | cada uno `≥ 0`                                                                | Agrupa costos periódicos.                                                                  |
| `ScheduleRow`                 | periodo, `GraceType`, saldos/interés (cuota y cuotón), `installment`, `amortization`, costos, `cashFlow` | `installment = interest + amortization` en S                                  | Fila inmutable del cronograma.                                                             |
| `Indicators`                  | `npv`, `periodicIrr`, `tcea`, eco de tasas                                                               | —                                                                             | Resultado de la evaluación.                                                                |
| `DiscountFactor`              | `value` para periodo `t`                                                                                 | `1/(1+COK_periodo)^t`                                                         | Concepto con regla.                                                                        |
| `BalloonPresentValue`         | `Money`                                                                                                  | `cuotón/(1+jB)^(n+1)`, `jB = i + TSD` si el desgravamen se capitaliza        | VP del cuotón.                                                                             |
| `ClientId` / `VehicleOfferId` | identificador                                                                                            | referencia by-id                                                              | Identidades de otros agregados, no sus modelos.                                            |

## Domain services

Stateless; **no vacían el agregado** (la raíz orquesta y guarda el estado; los servicios solo
calculan) — evita el modelo anémico.

| Domain service         | Responsabilidad                                                                                          | Justificación                                                                                 |
|------------------------|----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `ScheduleCalculator`   | Construye las `n` filas: cuota francesa/balloon, recálculo tras gracia, bloque del cuotón y liquidación. | Lógica que abarca varios objetos, sin hogar natural en un VO → servicio de dominio stateless. |
| `IndicatorsCalculator` | VAN/TIR/TCEA + COK del periodo + eco de tasas sobre los flujos del cronograma.                           | Materializa "Indicators/Transparency" como servicio del core (no un contexto).                |

> La conversión de tasas (TNA+capitalización/TEA → TEP) es **comportamiento del VO `Rate`**, no un
> servicio aparte.

## Repository

`CreditSimulationRepository` — uno por raíz; interfaz en la capa de dominio, implementación en
infraestructura (JPA). Cubre E7: guardar/reabrir/editar y `findByClientId` para el historial. Todas
sus consultas quedan **auto-filtradas por la concesionaria actual** (Hibernate `@TenantId`), así que
`findByClientId` devuelve solo el historial del tenant en sesión.
Justificación: persistir/recuperar un agregado → Repository.

## Factory

`CreditSimulationFactory` — ensambla una configuración válida y dispara el cálculo inicial, devolviendo
una instancia bien formada. Justificación: construir un objeto válido requiere ensamblar varias partes
y reglas. (Alternativa: método de fábrica estático en la raíz; decisión de estilo.)

## Domain events

`SimulationGenerated`, `ScheduleGenerated`, `BalloonSettled`, `IndicatorsCalculated` — en pasado,
**internos y deliberados**. En v1 **no** se usan para eventual consistency entre agregados (el cálculo
es síncrono dentro del agregado); se documentan porque pueden habilitar reacciones futuras
(auditoría, notificaciones). Regla del playbook: los domain events son una elección deliberada, no un
default.

## Modelado ligero — Clients y Vehicle Offers `supporting`

CRUD simple; sin servicios de dominio (evitar over-engineering — el DDD táctico profundo no aplica a
CRUD puro).

| Contexto       | Raíz           | Value Objects                                  | Repository               |
|----------------|----------------|------------------------------------------------|--------------------------|
| Clients        | `Client`       | `DocumentId`, `ContactInfo`                    | `ClientRepository`       |
| Vehicle Offers | `VehicleOffer` | `Vehicle`, `SalePrice` (reusa `Money`), `Plan` | `VehicleOfferRepository` |

Tanto `Client` como `VehicleOffer` (y `CreditSimulation`) llevan un `DealershipId` (el tenant) que los
**aísla por concesionaria** (`@TenantId`).

`Money`/`Currency` es un **kernel técnico** compartido (sin reglas de negocio), no un shared kernel de
dominio.

## Nota IAM `generic` + cuenta (tenant)

Sin modelado táctico profundo: `User` (email/username, password) + sesión, vía proveedor (p. ej.
Spring Security). IAM también provee la **`Dealership`** (cuenta/tenant de la concesionaria): el
registro crea la `Dealership` + su primer `User`, y **un usuario pertenece a una sola concesionaria**.
Conformist. Ver [bounded-contexts.md](bounded-contexts.md).

## Mapa a las 4 capas (sin código)

| Capa               | Piezas                                                                                                                                                         |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Domain**         | `CreditSimulation` (raíz), VOs, `ScheduleCalculator`, `IndicatorsCalculator`, interfaz `CreditSimulationRepository`, `CreditSimulationFactory`, domain events. |
| **Application**    | Orquestación de casos de uso (handlers de `GenerateSimulation`, etc.).                                                                                         |
| **Infrastructure** | Implementación JPA de los repositorios; persistencia; el `CurrentTenantIdentifierResolver` que lee el `DealershipId` de la sesión (multi-tenant `@TenantId`).  |
| **Interfaces**     | API REST (controllers, DTOs).                                                                                                                                  |

Las dependencias apuntan **hacia adentro**; el dominio no depende de nada externo. El **código es la
fase siguiente**; aquí solo se diseña el modelo.
