# Lenguaje ubicuo (v2 — consolidado por contexto)

> Glosario **consolidado** del lenguaje común de AutoFinance, **organizado por bounded context** tras
> el descubrimiento de dominio de la Fase 3. Sustituye a la semilla v1 (que agrupaba por temas A–G).
> El detalle financiero (fórmulas) vive en `docs/guides/`; el modelo táctico en
> [domain-model.md](../ddd/domain-model.md) y [bounded-contexts.md](../ddd/bounded-contexts.md).

## Cómo leer este glosario

- **El lenguaje ubicuo de negocio es español** (términos peruanos del crédito vehicular). **Los
  identificadores del modelo y del código son inglés** (clases, value objects, servicios). Este
  glosario es el **puente**: columna *Término* (negocio) ↔ columna *Modelo* (identificador en inglés).
- Cada término se lista bajo el **contexto** al que pertenece. Donde un término no corresponde a una
  clase, la columna *Modelo* va con `—`.
- **Nota de naming (IAM):** el término `User` pertenece al contexto genérico de **Identity & Access**
  y **pertenece a una `Dealership`** (la cuenta/tenant de la concesionaria). **No** se usa "usuario"
  como la persona del negocio; la persona operativa es el **asesor de ventas**.

## Mapa de cambios v1 → v2

| Cambio                   | Detalle                                                                                                                                                                                                |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Reorganización           | De grupos temáticos A–G a **secciones por bounded context**.                                                                                                                                           |
| Términos nuevos (Fase 2) | `BalloonPresentValue` (VP del cuotón), `DiscountFactor` (factor de descuento), liquidación del cuotón, saldo a financiar (`financedBalance`), COK del periodo (`periodicCostOfCapital`), eco de tasas. |
| Puente de idioma         | Se añade la columna *Modelo* (identificador en inglés) a cada término modelable.                                                                                                                       |
| Sin cambios              | Guarda de naming IAM; términos retirados (B/C, PRD…) siguen fuera del producto.                                                                                                                        |

---

## Identity & Access (IAM) `generic`

| Término                       | Modelo                       | Definición                                                                                                                                          |
|-------------------------------|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Concesionaria / Cuenta        | `Dealership`                 | Cuenta (**tenant**) de la concesionaria que opera el sistema; agrupa a sus usuarios y sus datos. Raíz del aislamiento multi-tenant.                 |
| Usuario                       | `User`                       | Identidad de acceso (email/username + password) que **pertenece a una** `Dealership`. Concepto de IAM; reservado, **no** es la persona del negocio. |
| Credenciales                  | —                            | Email/username y contraseña con los que se autentica el acceso.                                                                                     |
| Login / Sesión                | `Session`                    | Acción de autenticarse y estado autenticado que habilita operar; fija la concesionaria (tenant) actual.                                             |
| Tenant / concesionaria actual | `DealershipId` (`@TenantId`) | Identificador de la concesionaria del usuario logueado; discrimina y aísla los datos (Hibernate lo aplica automáticamente).                         |
| Asesor de ventas              | — (rol)                      | Rol operativo de la **concesionaria** que opera el sistema. No es una clase de IAM.                                                                 |

> Los datos de **Clients**, **Vehicle Offers** y **Credit Simulation** quedan **aislados por
> `Dealership`** (cada agregado lleva el discriminador `dealershipId` vía `@TenantId`).

## Clients `supporting`

| Término                | Modelo             | Definición                                                                                        |
|------------------------|--------------------|---------------------------------------------------------------------------------------------------|
| Cliente / Deudor       | `Client`           | Persona que adquiere el vehículo y asume el crédito; **beneficiario final**, no opera el sistema. |
| Documento de identidad | `DocumentId` (VO)  | Identificación del cliente (DNI/CE u otro).                                                       |
| Datos de contacto      | `ContactInfo` (VO) | Teléfono, email, dirección.                                                                       |

## Vehicle Offers `supporting`

| Término              | Modelo                | Definición                                                                |
|----------------------|-----------------------|---------------------------------------------------------------------------|
| Oferta vehicular     | `VehicleOffer`        | Vehículo + precio + características que sirven de base al financiamiento. |
| Vehículo             | `Vehicle` (VO)        | Bien financiado (marca, modelo, año…).                                    |
| Precio de venta (PV) | `SalePrice` (`Money`) | Valor del vehículo; base de la cuota inicial y el cuotón.                 |
| Plan                 | `Plan`                | Configuración estándar de plazo/condiciones (p. ej. Plan 36 = 36 cuotas). |

## Credit Simulation `core`

Contexto núcleo. Incluye configuración del financiamiento, motor de cronograma e indicadores.

### Configuration

| Término                                 | Modelo                                                   | Definición                                                                    |
|-----------------------------------------|----------------------------------------------------------|-------------------------------------------------------------------------------|
| Moneda                                  | `Currency` (PEN/USD)                                     | Divisa única de la operación (sin tipo de cambio).                            |
| Tasa nominal anual (TNA)                | `Rate` (`RateType.NOMINAL`)                              | Tasa nominal; requiere capitalización para volverse efectiva.                 |
| Tasa efectiva anual (TEA)               | `Rate` (`RateType.EFFECTIVE`)                            | Tasa efectiva en base anual.                                                  |
| Capitalización                          | `Capitalization`                                         | Días de capitalización (diaria, mensual…); obligatoria si la tasa es nominal. |
| Tasa efectiva del periodo (TEP/TEM)     | `Rate.toPeriodicRate()`                                  | Tasa ajustada a la frecuencia de pago.                                        |
| Tasas equivalentes                      | `Rate` (comportamiento)                                  | Tasas que rinden igual en distintas frecuencias.                              |
| Cuota inicial (CI) / % cuota inicial    | `downPayment: Money` / `initialPercentage: Percentage`   | Aporte adelantado; `CI = PV × %CI`.                                           |
| Cuotón / cuota balloon / valor residual | `balloonAmount: Money` / `balloonPercentage: Percentage` | Parte diferida al final; `cuotón = PV × %cuotón`.                             |
| Plazo (n)                               | `Term.numberOfInstallments`                              | Número total de cuotas.                                                       |
| Frecuencia de pago                      | `Term.frequencyDays`                                     | Días entre pagos (30 en v1).                                                  |
| Convención 30/360                       | —                                                        | Mes de 30 días, año de 360 días.                                              |

### Grace

| Término                        | Modelo               | Definición                                                                         |
|--------------------------------|----------------------|------------------------------------------------------------------------------------|
| Periodo de gracia              | `GraceConfiguration` | Diferimiento total/parcial definido al inicio.                                     |
| Gracia total (T)               | `GraceType.TOTAL`    | No se paga ni amortiza; el interés se capitaliza (el saldo sube).                  |
| Gracia parcial (P)             | `GraceType.PARTIAL`  | Se pagan solo intereses; el saldo se mantiene.                                     |
| Sin gracia (S)                 | `GraceType.NONE`     | Periodo normal según el método.                                                    |
| Recálculo de cuota tras gracia | `ScheduleCalculator` | La cuota ordinaria se recalcula sobre el saldo post-gracia y las cuotas restantes. |

### Schedule / engine

| Término                              | Modelo                                          | Definición                                                        |
|--------------------------------------|-------------------------------------------------|-------------------------------------------------------------------|
| Plan de pagos / Cronograma           | `CreditSimulation` (schedule)                   | Tabla de cómo se cancela la deuda por periodo.                    |
| Método francés vencido ordinario     | `ScheduleCalculator`                            | Amortización de cuota constante, pago al vencimiento.             |
| Compra Inteligente                   | — (modalidad)                                   | Financiamiento francés que difiere parte del capital como cuotón. |
| Préstamo / capital financiado (C/VA) | `loanAmount: Money`                             | `PV − CI + costos iniciales`.                                     |
| Saldo inicial / final                | `ScheduleRow.openingBalance` / `closingBalance` | Saldo antes/después del periodo.                                  |
| Interés                              | `ScheduleRow.interest`                          | `saldo inicial × i`.                                              |
| Amortización                         | `ScheduleRow.amortization`                      | `cuota − interés`.                                                |
| Cuota regular                        | `ScheduleRow.installment`                       | Pago periódico constante del tramo ordinario.                     |
| Cuota total                          | `ScheduleRow.totalInstallment`                  | Cuota del préstamo + costos periódicos.                           |
| VP del cuotón                        | `BalloonPresentValue` (VO)                      | Valor presente del cuotón: `cuotón/(1+i)^n`.                      |
| Saldo a financiar                    | `financedBalance: Money`                        | Parte no diferida del préstamo (`C − VP del cuotón`).             |
| Liquidación del cuotón               | — (fila final)                                  | Pago final que cancela el cuotón diferido.                        |
| Fila del cronograma                  | `ScheduleRow` (VO)                              | Una fila del plan de pagos.                                       |

### Costs & flow

| Término                            | Modelo                    | Definición                                                              |
|------------------------------------|---------------------------|-------------------------------------------------------------------------|
| Costos iniciales                   | `InitialCosts` (VO)       | Notariales, registrales, tasación, comisiones; pueden financiarse.      |
| Costos periódicos                  | `PeriodicCosts` (VO)      | Pagos que acompañan la cuota; no amortizan; se pagan también en gracia. |
| Seguro de desgravamen (TSD)        | `creditLifeInsuranceRate` | Cubre la deuda ante fallecimiento/invalidez; sobre el saldo.            |
| Seguro contra todo riesgo (TSR)    | `allRiskInsurance`        | Seguro del bien; fijo por periodo o `PV × TSR`.                         |
| GPS                                | `gps`                     | Costo periódico del rastreo.                                            |
| Portes                             | `shippingFees`            | Costo periódico de envío/gestión.                                       |
| Gastos administrativos             | `adminFees`               | Otros cobros administrativos del periodo.                               |
| Flujo del periodo                  | `ScheduleRow.cashFlow`    | `cuota + desgravamen + riesgo + GPS + portes + gastos adm`.             |
| Desgravamen embebido (j = i + TSD) | `Rate` (variante)         | Cuota calculada con el desgravamen incorporado en la tasa.              |

### Indicators & transparency

| Término                    | Modelo                   | Definición                                                          |
|----------------------------|--------------------------|---------------------------------------------------------------------|
| VAN                        | `Indicators.npv`         | Valor Actual Neto desde la óptica del deudor.                       |
| TIR                        | `Indicators.periodicIrr` | Tasa que hace VAN = 0 (periódica; se anualiza).                     |
| COK                        | `costOfCapital`          | Costo de oportunidad del capital del deudor; tasa de descuento.     |
| COK del periodo            | `periodicCostOfCapital`  | COK anual ajustado a la frecuencia.                                 |
| TCEA                       | `Indicators.tcea`        | Tasa de Costo Efectivo Anual: `(1 + TIR_periodo)^(cuotas/año) − 1`. |
| Factor de descuento        | `DiscountFactor` (VO)    | `1/(1 + COK_periodo)^t`.                                            |
| Norma de transparencia SBS | —                        | Marco peruano que exige informar el costo real (TCEA + desglose).   |
| Eco de tasas               | `Indicators` (campos)    | TEA/TEM/COK del periodo expuestos para transparencia.               |

> **Indicadores como servicio de dominio:** VAN/TIR/TCEA no forman un contexto aparte; se calculan en
> el core mediante el servicio de dominio `IndicatorsCalculator`. Ver
> [bounded-contexts.md](../ddd/bounded-contexts.md).

---

## Términos retirados / fuera del producto

| Término                                  | Razón                                                                         |
|------------------------------------------|-------------------------------------------------------------------------------|
| B/C, PRD, VAC, CAUE                      | Referencia teórica del material de indicadores; no son parte del producto v1. |
| Interés simple                           | Fuera de alcance: el crédito vehicular usa interés compuesto.                 |
| Otros métodos (alemán/americano/peruano) | Fuera del producto: solo francés + Compra Inteligente.                        |

## Relación con la semilla (v1)

Este documento **consolida y reemplaza** la semilla v1 (agrupada por temas A–G). Mantiene la misma
ruta para no romper los enlaces de [about.md](about.md), [segmentos-objetivo.md](segmentos-objetivo.md)
y [product-backlog.md](product-backlog.md). Es la fuente vigente del lenguaje ubicuo para la Fase 3 en
adelante.
