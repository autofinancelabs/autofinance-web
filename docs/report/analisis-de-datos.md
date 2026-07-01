# Análisis de datos del motor financiero

> Diccionario de datos del motor de cálculo: **datos de entrada, intermedios y de salida**, con tipo,
> precisión, formato, valor por defecto y restricciones, orientado a Java 25 / Spring / PostgreSQL.
> Las fórmulas que relacionan estos datos están en
> [marco-conceptual-formulas.md](marco-conceptual-formulas.md); el vocabulario en
> [lenguaje-ubicuo.md](../product/lenguaje-ubicuo.md).

## 1. Cómo leer el diccionario

Cada variable se describe con: `nombre · descripción · tipo · tamaño/precisión · formato · valor por
defecto · restricciones`. Los nombres son los que usará el código (camelCase). Las tasas y
porcentajes se manejan como **fracción decimal** (0.15 = 15%), no como porcentaje.

## 2. Convenciones de tipos y precisión

| Categoría de dato     | Tipo recomendado | Precisión                         |
|-----------------------|------------------|-----------------------------------|
| Dinero (montos)       | `BigDecimal`     | scale 2 en salida; interno ≥ 12   |
| Tasas / factores      | `BigDecimal`     | scale 6–8 en salida; interno ≥ 12 |
| Conteos (n, periodos) | `int`            | —                                 |
| Banderas              | `boolean`        | —                                 |
| Categorías            | `enum`           | —                                 |

Las divisiones y potencias usan `MathContext` con redondeo `HALF_UP`.

## 3. Política de redondeo y precisión

- **Mantener decimales internos** altos y **redondear solo al mostrar** (el material de referencia lo
  indica explícitamente). Cálculo interno con `BigDecimal` scale ≥ 12, `HALF_UP`.
- Salida: montos a 2 decimales; tasas a 6–8 decimales.
- **VAN/TIR** se calculan sobre flujos internos sin redondear.

---

## 4. Datos de entrada

### 4.1 Identificación y moneda

| nombre         | descripción                                   | tipo            | precisión | formato  | default | restricciones                    |
|----------------|-----------------------------------------------|-----------------|-----------|----------|---------|----------------------------------|
| `dealershipId` | Concesionaria (tenant) dueña de la cotización | UUID            | —         | —        | sesión  | **de contexto**: lo fija la sesión, no lo digita el asesor (`@TenantId`) |
| `moneda`       | Divisa única de la operación                  | enum {PEN, USD} | —         | "PEN"    | PEN     | obligatorio; mono-divisa, sin FX |
| `precioVenta`  | Precio de venta del vehículo (PV)             | BigDecimal      | scale 2   | 16000.00 | —       | obligatorio; `> 0`               |

> `dealershipId` no es un input financiero: es el **tenant** que aísla los datos por concesionaria;
> Hibernate (`@TenantId`) lo toma de la sesión y lo aplica automáticamente.

### 4.2 Tasa

| nombre           | descripción                                    | tipo                     | precisión | formato   | default | restricciones                                               |
|------------------|------------------------------------------------|--------------------------|-----------|-----------|---------|-------------------------------------------------------------|
| `tipoTasa`       | Naturaleza de la tasa ingresada                | enum {NOMINAL, EFECTIVA} | —         | "NOMINAL" | —       | obligatorio                                                 |
| `valorTasa`      | Valor de la tasa (TNA o TEA), en fracción      | BigDecimal               | scale 10  | 0.1500    | —       | obligatorio; `≥ 0`                                          |
| `capitalizacion` | Días de capitalización (1=diaria, 30=mensual, 90=trimestral, 180=semestral, 360=anual, o cualquier valor) | int (días)               | —         | 1         | —       | **obligatorio si `tipoTasa=NOMINAL`**; ignorado si EFECTIVA; `> 0` |
| `diasAnio`       | Días por año (convención)                      | int                      | —         | 360       | 360     | fijo 360 en v1                                              |

### 4.3 Estructura del crédito

| nombre                   | descripción                                  | tipo       | precisión | formato | default | restricciones                  |
|--------------------------|----------------------------------------------|------------|-----------|---------|---------|--------------------------------|
| `porcentajeCuotaInicial` | % cuota inicial sobre PV                     | BigDecimal | scale 6   | 0.20    | 0       | `∈ [0, 1)`                     |
| `porcentajeCuotaFinal`   | % cuotón sobre PV                            | BigDecimal | scale 6   | 0.40    | 0       | `∈ [0, 1)`; 0 ⇒ francés simple |
| `numCuotas` (n)          | Nº total de cuotas ordinarias                | int        | —         | 36      | —       | obligatorio; `≥ 1`             |
| `frecuenciaDias`         | Días entre pagos                             | int        | —         | 30      | 30      | `> 0`; 30 en v1                |
| `cuotasPorAnio`          | Periodos por año (`diasAnio/frecuenciaDias`) | int        | —         | 12      | 12      | derivado/validado              |

Restricción de cruce: `porcentajeCuotaInicial + porcentajeCuotaFinal < 1`.

### 4.4 Gracia

| nombre                     | descripción                  | tipo                  | precisión   | formato                         | default | restricciones                    |
|----------------------------|------------------------------|-----------------------|-------------|---------------------------------|---------|----------------------------------|
| `graciaConfig`             | Marca de gracia por periodo  | lista de enum {S,T,P} | n elementos | ["T","T","T","P","P","P","S",…] | todos S | longitud ≤ n; definida al inicio |
| `numPeriodosGraciaTotal`   | Conteo de T (forma compacta) | int                   | —           | 3                               | 0       | `≥ 0`                            |
| `numPeriodosGraciaParcial` | Conteo de P (forma compacta) | int                   | —           | 3                               | 0       | `≥ 0`; `(T+P) < n`               |

### 4.5 Costos iniciales

| nombre                 | descripción                    | tipo       | precisión | formato | default | restricciones    |
|------------------------|--------------------------------|------------|-----------|---------|---------|------------------|
| `costosNotariales`     | Gasto notarial                 | BigDecimal | scale 2   | 100.00  | 0       | `≥ 0`            |
| `costosRegistrales`    | Gasto registral                | BigDecimal | scale 2   | 75.00   | 0       | `≥ 0`            |
| `tasacion`             | Costo de tasación              | BigDecimal | scale 2   | 0.00    | 0       | `≥ 0`            |
| `comisiones`           | Comisión de estudio/activación | BigDecimal | scale 2   | 0.00    | 0       | `≥ 0`            |
| `costosInicialesTotal` | Suma (derivable)               | BigDecimal | scale 2   | 175.00  | 0       | `= Σ` anteriores |

### 4.6 Costos periódicos y seguros

| nombre                 | descripción                                                   | tipo       | precisión    | formato  | default | restricciones                        |
|------------------------|---------------------------------------------------------------|------------|--------------|----------|---------|--------------------------------------|
| `tsd`                  | Tasa de seguro de desgravamen **mensual** (sobre saldo); por periodo = `tsd × frec/30` | BigDecimal | scale 10     | 0.000490 | 0       | `≥ 0` (ON_BALANCE)                   |
| `tsr` / `seguroRiesgo` | Seguro contra todo riesgo: tasa **anual** sobre PV (por periodo = `tsr × frec/díasAño`) **o** monto fijo por periodo | BigDecimal | scale 2 / 10 | 0.0010   | 0       | `≥ 0`; `ON_SALE_PRICE` (tasa anual) o `FIXED` (monto) |
| `gps`                  | Costo de GPS por periodo                                      | BigDecimal | scale 2      | 20.00    | 0       | `≥ 0`                                |
| `portes`               | Portes por periodo                                            | BigDecimal | scale 2      | 3.50     | 0       | `≥ 0`                                |
| `gastosAdm`            | Gastos administrativos por periodo                            | BigDecimal | scale 2      | 3.50     | 0       | `≥ 0`                                |
| `desgravamenEmbebido`  | Usar `j = i + TSD` en la cuota                                | boolean    | —            | false    | false   | variante `Should`                    |

> **Modelo de costos flexible (implementado).** Los costos ya no son campos fijos: son una **lista
> de `Cost`** `{ name, value, basis, timing, embedded }`, definible por operación (cualquier entidad
> puede añadir costos en runtime). `basis ∈ {FIXED, ON_BALANCE, ON_SALE_PRICE}` (monto fijo, % sobre
> saldo, % sobre precio); `timing ∈ {INITIAL, PERIODIC}`; `embedded` marca el desgravamen (entra en
> `j` y capitaliza en el cuotón). Las tablas §4.5–§4.6 son los costos **típicos** expresados así
> (p. ej. desgravamen = `ON_BALANCE` embebido; riesgo = `ON_SALE_PRICE`; GPS/portes/gastos adm. =
> `FIXED PERIODIC`; notariales/registrales = `FIXED INITIAL`).

### 4.7 Parámetros de evaluación

| nombre     | descripción          | tipo       | precisión | formato | default | restricciones               |
|------------|----------------------|------------|-----------|---------|---------|-----------------------------|
| `cokAnual` | COK anual del deudor | BigDecimal | scale 10  | 0.0344  | —       | obligatorio para VAN; `≥ 0` |

---

## 5. Datos intermedios (derivados)

| nombre                            | descripción                                  | tipo       | precisión         | restricciones                                      |
|-----------------------------------|----------------------------------------------|------------|-------------------|----------------------------------------------------|
| `tea`                             | TEA efectiva del financiamiento              | BigDecimal | interno ≥ 12      | de TNA+capitalización, o = `valorTasa` si EFECTIVA |
| `tep` / `tem` (`i`)               | Tasa efectiva del periodo                    | BigDecimal | interno ≥ 12      | `(1+TEA)^(frecuenciaDias/diasAnio) − 1`            |
| `j`                               | Tasa ajustada `i + TSD` (si embebido)        | BigDecimal | interno ≥ 12      | solo si `desgravamenEmbebido`                      |
| `cuotaInicial` (CI)               | `PV × %CI`                                   | BigDecimal | scale 2           | —                                                  |
| `cuotonValor`                     | `PV × %cuotón`                               | BigDecimal | scale 2           | —                                                  |
| `prestamo` (C/VA)                 | `PV − CI + costosInicialesTotal`             | BigDecimal | scale 2           | `> 0`                                              |
| `cuotonVP`                        | VP del cuotón `cuotón/(1+jB)^(n+1)`          | BigDecimal | interno ≥ 12      | `jB = i + TSD` si el desgravamen se capitaliza     |
| `saldoAFinanciar`                 | `prestamo − cuotonVP`                        | BigDecimal | interno ≥ 12      | base de la cuota regular                           |
| `cokPeriodo`                      | `(1+cokAnual)^(frecuenciaDias/diasAnio) − 1` | BigDecimal | interno ≥ 12      | —                                                  |
| `cuotaRegular` (R)                | cuota constante francés/balloon              | BigDecimal | scale 2 (display) | —                                                  |
| `saldoInicial_t` / `saldoFinal_t` | saldos por periodo (cuota y cuotón)          | BigDecimal | interno ≥ 12      | SF último ≈ 0                                      |
| `interes_t` / `amortizacion_t`    | interés y amortización por periodo           | BigDecimal | scale 2           | `A = R − I`                                        |
| `factorDescuento_t`               | `1/(1+cokPeriodo)^t`                         | BigDecimal | interno ≥ 12      | —                                                  |

---

## 6. Datos de salida

### 6.1 Fila del cronograma

| nombre                                                                | descripción                      | tipo         | precisión |
|-----------------------------------------------------------------------|----------------------------------|--------------|-----------|
| `nro`                                                                 | Número de periodo                | int          | —         |
| `tipoGracia`                                                          | Marca del periodo                | enum {S,T,P} | —         |
| `saldoInicialCuoton` / `interesCuoton` / `saldoFinalCuoton`           | Bloque del cuotón                | BigDecimal   | scale 2   |
| `saldoInicialCuota` / `interesCuota`                                  | Bloque de la cuota regular       | BigDecimal   | scale 2   |
| `cuotaRegular` / `amortizacion`                                       | Cuota y amortización del periodo | BigDecimal   | scale 2   |
| `seguroDesgravamen` / `seguroRiesgo` / `gps` / `portes` / `gastosAdm` | Costos periódicos                | BigDecimal   | scale 2   |
| `saldoFinalCuota`                                                     | Saldo final de la cuota regular  | BigDecimal   | scale 2   |
| `flujo`                                                               | Flujo del periodo                | BigDecimal   | scale 2   |

### 6.2 Totales y acumulados

Expuestos como `SimulationSummary`:

| nombre                  | descripción                                        | tipo       | precisión |
|-------------------------|----------------------------------------------------|------------|-----------|
| `totalInterest`         | Σ intereses                                        | BigDecimal | scale 2   |
| `totalAmortization`     | Σ amortización                                      | BigDecimal | scale 2   |
| `totalLoanInstallments` | Σ cuota del préstamo (cuotas financieras pagadas)  | BigDecimal | scale 2   |
| `totalToPay`            | Σ flujo (**monto total a pagar**, sin descontar)   | BigDecimal | scale 2   |
| `totalsPerCost`         | Σ por **nombre de costo** (mapa; desgravamen, riesgo, GPS, portes, gastos adm., o cualquiera definido) | Map\<String,BigDecimal\> | scale 2 |

### 6.3 Indicadores

| nombre                       | descripción                           | tipo       | precisión |
|------------------------------|---------------------------------------|------------|-----------|
| `van`                        | Valor Actual Neto (óptica del deudor) | BigDecimal | scale 2   |
| `tirPeriodo`                 | TIR del periodo                       | BigDecimal | scale 8   |
| `tcea`                       | Tasa de Costo Efectivo Anual          | BigDecimal | scale 6   |
| `tea` / `tem` / `cokPeriodo` | Eco de tasas (transparencia, H6.5)    | BigDecimal | scale 6–8 |

---

## 7. Reglas de validación transversales

| Regla          | Criterio                                                                                          |
|----------------|---------------------------------------------------------------------------------------------------|
| Capitalización | obligatoria si `tipoTasa = NOMINAL`                                                               |
| Porcentajes    | `%CI ∈ [0,1)`, `%cuotón ∈ [0,1)`, `%CI + %cuotón < 1`                                             |
| Gracia         | `(numPeriodosGraciaTotal + numPeriodosGraciaParcial) < n`; `graciaConfig` de longitud ≤ n         |
| Moneda         | `∈ {PEN, USD}`                                                                                    |
| Montos         | todos `≥ 0`; `precioVenta > 0`; `prestamo > 0`                                                    |
| Cuadre         | `saldoFinalCuota` del último periodo ≈ 0; `cuotaRegular = interes + amortizacion` en periodos `S` |

## 8. Trazabilidad campo → fórmula → término de lenguaje ubicuo

| Campo                         | Fórmula (marco conceptual) | Término en lenguaje ubicuo               |
|-------------------------------|----------------------------|------------------------------------------|
| `prestamo`                    | §4                         | Préstamo / Capital financiado            |
| `tem` (`i`)                   | §3                         | TEP / TEM                                |
| `cuotaRegular`                | §5 / §6                    | Cuota regular                            |
| `cuotonVP`                    | §6                         | (nuevo: "VP del cuotón" — sembrar)       |
| `factorDescuento_t`           | §11                        | (nuevo: "factor de descuento" — sembrar) |
| `flujo`                       | §10                        | Flujo total / Flujo de caja del periodo  |
| `van` / `tirPeriodo` / `tcea` | §11                        | VAN / TIR / TCEA                         |

> **Nota:** `VP del cuotón` y `factor de descuento` aún no figuran en
> [lenguaje-ubicuo.md](../product/lenguaje-ubicuo.md); el glosario es "semilla" y conviene añadirlos
> en su próxima iteración.
