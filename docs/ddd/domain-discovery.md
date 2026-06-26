# Descubrimiento de dominio

> Descubrimiento del dominio con **EventStorming ligero** (eventos, comandos, políticas, read models,
> sistemas externos), agrupación en agregados, y un **Domain Message Flow** del escenario "generate
> simulation". Eventos en pasado, comandos en imperativo; identificadores del modelo en inglés.
> Insumo de [bounded-contexts.md](bounded-contexts.md) y [domain-model.md](domain-model.md).
> Vocabulario: [lenguaje-ubicuo.md](../product/lenguaje-ubicuo.md).

## Método

Se sigue el EventStorming del skill `ddd-playbook` en versión solo-analista: descubrir eventos de
dominio (algo que **ocurrió**, en pasado), los comandos que los disparan (en imperativo), las
políticas (un evento dispara automáticamente un comando), los read models (lo que un actor consulta
para decidir) y los sistemas externos; luego agrupar en **agregados** (un agregado recibe comandos y
produce eventos) y estos en **bounded contexts**.

## Línea de tiempo (happy path)

```text
DealershipRegistered
  │  (alta de cuenta de concesionaria; fija el tenant)
AdvisorAuthenticated
  │  (pivote: IAM → negocio)
ClientRegistered ── VehicleOfferRegistered
  │  (pivote: registro → simulación)
FinancingConfigured → SimulationGenerated → ScheduleGenerated → BalloonSettled → IndicatorsCalculated
  │
SimulationSaved
```

Camino alterno (editar):

```text
SimulationReopened → SimulationReconfigured → ScheduleGenerated → IndicatorsCalculated → SimulationSaved
```

Los **puntos pivote** (cambios de fase) anticipan las fronteras de contexto: la barra IAM→negocio y la
barra registro→simulación.

## Eventos de dominio

| Evento                   | Contexto          | Disparado por (comando)         |
|--------------------------|-------------------|---------------------------------|
| `DealershipRegistered`   | Identity & Access | `RegisterDealership`            |
| `AdvisorAuthenticated`   | Identity & Access | `Authenticate` (fija el tenant) |
| `ClientRegistered`       | Clients           | `RegisterClient`                |
| `ClientUpdated`          | Clients           | `UpdateClient`                  |
| `VehicleOfferRegistered` | Vehicle Offers    | `RegisterVehicleOffer`          |
| `VehicleOfferUpdated`    | Vehicle Offers    | `UpdateVehicleOffer`            |
| `FinancingConfigured`    | Credit Simulation | `ConfigureFinancing`            |
| `SimulationGenerated`    | Credit Simulation | `GenerateSimulation`            |
| `ScheduleGenerated`      | Credit Simulation | `GenerateSimulation` (interno)  |
| `BalloonSettled`         | Credit Simulation | `GenerateSimulation` (interno)  |
| `IndicatorsCalculated`   | Credit Simulation | `GenerateSimulation` (interno)  |
| `SimulationSaved`        | Credit Simulation | `SaveSimulation`                |
| `SimulationReopened`     | Credit Simulation | `ReopenSimulation`              |
| `SimulationReconfigured` | Credit Simulation | `ReconfigureSimulation`         |

## Comandos

| Comando                                       | Actor            | Agregado destino   | Evento(s) producido(s)                                                               |
|-----------------------------------------------|------------------|--------------------|--------------------------------------------------------------------------------------|
| `RegisterDealership`                          | Concesionaria    | `Dealership`       | `DealershipRegistered` (crea la cuenta + su primer `User`)                           |
| `Authenticate`                                | Asesor de ventas | `User`             | `AdvisorAuthenticated`                                                               |
| `RegisterClient` / `UpdateClient`             | Asesor de ventas | `Client`           | `ClientRegistered` / `ClientUpdated`                                                 |
| `RegisterVehicleOffer` / `UpdateVehicleOffer` | Asesor de ventas | `VehicleOffer`     | `VehicleOfferRegistered` / `VehicleOfferUpdated`                                     |
| `ConfigureFinancing`                          | Asesor de ventas | `CreditSimulation` | `FinancingConfigured`                                                                |
| `GenerateSimulation`                          | Asesor de ventas | `CreditSimulation` | `SimulationGenerated`, `ScheduleGenerated`, `BalloonSettled`, `IndicatorsCalculated` |
| `SaveSimulation`                              | Asesor de ventas | `CreditSimulation` | `SimulationSaved`                                                                    |
| `ReopenSimulation` / `ReconfigureSimulation`  | Asesor de ventas | `CreditSimulation` | `SimulationReopened` / `SimulationReconfigured`                                      |

> El **asesor de ventas** pertenece a una `Dealership`; al autenticar, la sesión fija el **tenant**
> (`dealershipId`) que aísla y discrimina todos sus datos (Hibernate `@TenantId`).

## Políticas (event → command)

| Política                                                               | Naturaleza                                                         |
|------------------------------------------------------------------------|--------------------------------------------------------------------|
| Cuando `ScheduleGenerated` ⇒ calcular indicadores                      | **Interna al agregado**, síncrona (parte de `GenerateSimulation`). |
| Cuando `BalloonSettled` ⇒ incluir la fila de liquidación en los flujos | **Interna**, síncrona.                                             |

> **Honestidad de modelado:** el motor de cálculo es **síncrono dentro de un único agregado**. No hay
> políticas que crucen fronteras de contexto ni eventual consistency entre agregados. Documentarlo así
> evita introducir domain events innecesarios (anti-patrón). Ver
> [domain-model.md](domain-model.md#domain-events).

## Read models

| Read model                                      | Quién lo consulta | Para decidir                                   |
|-------------------------------------------------|-------------------|------------------------------------------------|
| Lista de clientes                               | Asesor de ventas  | A qué cliente asociar la operación.            |
| Lista de ofertas vehiculares                    | Asesor de ventas  | Qué oferta financiar.                          |
| Cronograma + panel de indicadores/transparencia | Asesor de ventas  | Evaluar la conveniencia y mostrarla al deudor. |
| Historial de simulaciones por cliente           | Asesor de ventas  | Revisar operaciones anteriores.                |

## Sistemas externos

| Sistema externo     | Estado en v1                                |
|---------------------|---------------------------------------------|
| Tipo de cambio (FX) | **Ausente** (mono-divisa, sin conversión).  |
| Pasarela de pagos   | **Ausente** (sin originación/pagos reales). |
| Scoring crediticio  | **Ausente**.                                |

> El **vacío deliberado** de sistemas externos es un hallazgo: confirma que el límite de alcance de
> Fase 1 (sin FX, sin pagos, sin scoring) se sostiene en el modelo. IAM es interno.

## Agregados candidatos

Agrupando comandos+eventos (un agregado recibe comandos y produce eventos):

| Agregado           | Recibe                                                                                                    | Produce                                                                                                    |
|--------------------|-----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `Dealership` (IAM) | `RegisterDealership`                                                                                      | `DealershipRegistered`                                                                                     |
| `User` (IAM)       | `Authenticate`                                                                                            | `AdvisorAuthenticated`                                                                                     |
| `Client`           | `RegisterClient`, `UpdateClient`                                                                          | `ClientRegistered`, `ClientUpdated`                                                                        |
| `VehicleOffer`     | `RegisterVehicleOffer`, `UpdateVehicleOffer`                                                              | `VehicleOfferRegistered`, `VehicleOfferUpdated`                                                            |
| `CreditSimulation` | `ConfigureFinancing`, `GenerateSimulation`, `SaveSimulation`, `ReopenSimulation`, `ReconfigureSimulation` | `SimulationGenerated`, `ScheduleGenerated`, `BalloonSettled`, `IndicatorsCalculated`, `SimulationSaved`, … |

`CreditSimulation` concentra configuración + cronograma + indicadores en **un solo agregado** porque el
**cuadre** (saldo final ≈ 0, `installment = interest + amortization`, cuotón liquidado) es una
invariante que abarca todas las filas y debe valer dentro de **una transacción**.

## Contextos candidatos

| Agregados          | Contexto candidato | Subdominio |
|--------------------|--------------------|------------|
| `Dealership`       | Identity & Access  | generic    |
| `User`             | Identity & Access  | generic    |
| `Client`           | Clients            | supporting |
| `VehicleOffer`     | Vehicle Offers     | supporting |
| `CreditSimulation` | Credit Simulation  | **core**   |

El detalle (canvases, context map) está en [bounded-contexts.md](bounded-contexts.md).

## Domain Message Flow — escenario "generate simulation"

Mensajes (commands/queries/events) entre el asesor y los contextos. Las consultas a Clients y
VehicleOffers son **by-id** (no comparten modelo) — base del ACL del context map.

```mermaid
sequenceDiagram
    actor Advisor as Asesor de ventas
    participant CS as Credit Simulation (core)
    participant CL as Clients
    participant VO as Vehicle Offers

    Advisor->>CS: GenerateSimulation {clientId, vehicleOfferId, configuration}
    CS->>CL: query: client valid? {clientId}
    CL-->>CS: {clientId, minimal data}
    CS->>VO: query: sale price & currency {vehicleOfferId}
    VO-->>CS: {salePrice, currency}
    Note over CS: build schedule (French + balloon, grace) + indicators (internal, one transaction)
    CS-->>Advisor: SimulationGenerated {schedule, totals, npv, irr, tcea}
```
