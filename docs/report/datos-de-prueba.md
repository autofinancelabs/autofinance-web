# Diseño de datos de prueba (golden datasets)

> Conjuntos de datos dorados (entrada → salida esperada) para **comprobar la veracidad** del motor.
> Los nombres de campo son los de [analisis-de-datos.md](analisis-de-datos.md); las fórmulas, las de
> [marco-conceptual-formulas.md](marco-conceptual-formulas.md). Valores tomados de los ejemplos
> resueltos de `docs/guides/`.

## 1. Propósito y criterio de aceptación

Cada dataset fija entradas conocidas y los resultados esperados. El motor se considera **correcto**
si reproduce los valores esperados dentro de las tolerancias de §3. Se incluyen **tres** datasets:

| ID     | Escenario                                   | Qué valida                                                                                         |
|--------|---------------------------------------------|----------------------------------------------------------------------------------------------------|
| **D1** | Plan 36 Compra Inteligente (CORE)           | Cuotón, gracia `T` y `P`, costos periódicos, conversión TNA→TEA→TEM, VAN/TIR/TCEA.                 |
| **D2** | Francés vehicular simple                    | Cuota francesa pura e indicadores VAN/TIR/TCEA en aislamiento (balloon=0, sin gracia, sin costos). |
| **D3** | 60 meses con gracia y costos (VAN negativo) | Operación larga, gracia total, costos completos, **VAN < 0** (contraste).                          |

## 2. Cómo se presenta cada dataset

Tres bloques: (a) **entradas**, (b) **valores intermedios esperados**, (c) **cronograma esperado**
(filas clave en el cuerpo; completo en `<details>` cuando aplica) y **indicadores esperados**.

## 3. Tolerancias de comparación

| Magnitud                                           | Tolerancia                                                        |
|----------------------------------------------------|-------------------------------------------------------------------|
| Montos (dinero)                                    | ±0.05 (los ejemplos fuente redondean a 2 decimales por fila)      |
| Tasas                                              | ±1×10⁻⁶                                                           |
| Cuota / indicadores derivados de tasas redondeadas | hasta ±1.00 si la fuente usó una tasa redondeada (ver nota de D2) |

La política de redondeo del motor es la de [analisis-de-datos.md](analisis-de-datos.md) §3 (decimales
internos altos, redondeo solo al mostrar). Diferencias mayores a la tolerancia señalan un error del
motor o un artefacto conocido de la fuente.

---

## 4. Dataset D1 — Plan 36 Compra Inteligente (PEN, CORE)

Fuente: `docs/guides/metodo-frances-compra-inteligente-balloon.md`.

> **Notas de fidelidad (importante):**
> 1. Este ejemplo usa la **variante de desgravamen embebido** (`j = i + TSD`, marco §7): la cuota
>    regular **379.16** ya incluye el desgravamen. Por eso, en los periodos ordinarios `S` el flujo
>    suma solo `riesgo + GPS + portes + gastos adm = 31.00` sobre la cuota (no vuelve a sumar el
>    desgravamen), mientras que en los periodos de gracia `T`/`P` el desgravamen sí se agrega aparte.
> 2. El archivo fuente tiene artefactos de transcripción (p. ej. §7.7 lista GPS=740 y portes=129.50,
>    que son **totales** mal etiquetados; los valores por periodo correctos son GPS=20.00,
>    portes=3.50, gastos adm=3.50, riesgo=4.00). Se usan los valores de la **tabla del cronograma**.
> 3. El bloque del cuotón de la fuente arrastra pequeños redondeos; D1 valida sobre todo los
>    **indicadores** (dentro de tolerancia). D2 y D3 son los validadores aritméticos exactos.
> 4. El **COK anual es 50%** (`cokAnual = 0.50`); el COK del periodo es `(1.5)^(30/360) − 1 =
>    3.4366083%`, tasa con la que se descuenta el **VAN (+4,436.18)**. (Una versión previa rotulaba
>    3.44% como "anual"; en realidad ese 3.44% era el COK del **periodo**.)

### 4.1 Entradas

| Campo                                           |                                     Valor |
|-------------------------------------------------|------------------------------------------:|
| `moneda`                                        |                                       PEN |
| `precioVenta`                                   |                                 16,000.00 |
| `tipoTasa` / `valorTasa` / `capitalizacion`     |               NOMINAL / 0.15 / diaria (1) |
| `diasAnio` / `frecuenciaDias`                   |                                  360 / 30 |
| `porcentajeCuotaInicial`                        |                      0.20 (CI = 3,200.00) |
| `porcentajeCuotaFinal`                          |                  0.40 (cuotón = 6,400.00) |
| `numCuotas` (n)                                 |                                        36 |
| `graciaConfig`                                  | periodos 1–3 = `T`, 4–6 = `P`, 7–36 = `S` |
| `costosNotariales` / `costosRegistrales`        |             100.00 / 75.00 (total 175.00) |
| `tsd`                                           |                                  0.000490 |
| `seguroRiesgo` / `gps` / `portes` / `gastosAdm` |                4.00 / 20.00 / 3.50 / 3.50 |
| `cokAnual`                                      |                               0.50 (=50%) |
| `desgravamenEmbebido`                           |                                      true |

### 4.2 Valores intermedios esperados

| Intermedio                                |      Valor |
|-------------------------------------------|-----------:|
| TEA                                       | 16.179795% |
| TEM (`i`)                                 | 1.2575815% |
| `j = i + TSD`                             | 1.3065815% |
| préstamo                                  |  12,975.00 |
| VP del cuotón                             |   3,959.01 |
| saldo a financiar                         |   9,015.99 |
| saldo a financiar tras gracia (periodo 7) |   9,360.44 |
| cuota regular `R`                         |     379.16 |

### 4.3 Cronograma esperado (filas clave)

| Nº | P.G. | Saldo ini. cuota | Interés cuota | Cuota reg. | Amort. | Saldo fin. cuota |     Flujo |
|---:|:----:|-----------------:|--------------:|-----------:|-------:|-----------------:|----------:|
|  0 |      |                  |               |            |        |                  | 12,975.00 |
|  1 |  T   |         9,015.99 |        113.38 |       0.00 |   0.00 |         9,129.37 |     35.42 |
|  3 |  T   |         9,244.18 |        116.25 |       0.00 |   0.00 |         9,360.44 |     35.53 |
|  4 |  P   |         9,360.44 |        117.72 |     117.72 |   0.00 |         9,360.44 |    153.30 |
|  6 |  P   |         9,360.44 |        117.72 |     117.72 |   0.00 |         9,360.44 |    153.30 |
|  7 |  S   |         9,360.44 |        117.72 |     379.16 | 256.86 |         9,103.58 |    410.16 |
| 35 |  S   |           743.71 |          9.35 |     379.16 | 369.44 |           374.27 |    410.16 |
| 36 |  S   |           374.27 |          4.71 |     379.16 | 374.27 |             0.00 |    410.16 |
| 37 |  S   |             0.00 |          0.00 |       0.00 |   0.00 |             0.00 |  6,431.00 |

(Periodo 0 = desembolso del préstamo; periodo 37 = liquidación del cuotón = 6,400 + 31 de costos.)

### 4.4 Indicadores esperados

| Indicador         |      Valor |
|-------------------|-----------:|
| Intereses totales |   2,264.74 |
| TIR del periodo   | 1.5861749% |
| TCEA              |   20.7856% |
| VAN               |   4,436.18 |

<details>
<summary>Cronograma completo D1 (37 periodos, columnas de la fuente)</summary>

| Nº | P.G. | SI cuotón | Int. cuotón | SF cuotón | SI cuota | Int. cuota | Cuota reg. | Amort. | Desgrav. | Riesgo |   GPS | Portes | G. adm. | SF cuota |     Flujo |
|---:|:----:|----------:|------------:|----------:|---------:|-----------:|-----------:|-------:|---------:|-------:|------:|-------:|--------:|---------:|----------:|
|  0 |      |      0.00 |        0.00 |      0.00 |     0.00 |       0.00 |       0.00 |   0.00 |     0.00 |   0.00 |  0.00 |   0.00 |    0.00 |     0.00 | 12,975.00 |
|  1 |  T   |  3,959.01 |       49.79 |  4,010.74 | 9,015.99 |     113.38 |       0.00 |   0.00 |     4.42 |   4.00 | 20.00 |   3.50 |    3.50 | 9,129.37 |     35.42 |
|  2 |  T   |  4,010.74 |       50.44 |  4,063.14 | 9,129.37 |     114.81 |       0.00 |   0.00 |     4.47 |   4.00 | 20.00 |   3.50 |    3.50 | 9,244.18 |     35.47 |
|  3 |  T   |  4,063.14 |       51.10 |  4,116.23 | 9,244.18 |     116.25 |       0.00 |   0.00 |     4.53 |   4.00 | 20.00 |   3.50 |    3.50 | 9,360.44 |     35.53 |
|  4 |  P   |  4,116.23 |       51.76 |  4,170.01 | 9,360.44 |     117.72 |     117.72 |   0.00 |     4.59 |   4.00 | 20.00 |   3.50 |    3.50 | 9,360.44 |    153.30 |
|  5 |  P   |  4,170.01 |       52.44 |  4,224.50 | 9,360.44 |     117.72 |     117.72 |   0.00 |     4.59 |   4.00 | 20.00 |   3.50 |    3.50 | 9,360.44 |    153.30 |
|  6 |  P   |  4,224.50 |       53.13 |  4,279.69 | 9,360.44 |     117.72 |     117.72 |   0.00 |     4.59 |   4.00 | 20.00 |   3.50 |    3.50 | 9,360.44 |    153.30 |
|  7 |  S   |  4,279.69 |       53.82 |  4,335.61 | 9,360.44 |     117.72 |     379.16 | 256.86 |     4.59 |   4.00 | 20.00 |   3.50 |    3.50 | 9,103.58 |    410.16 |
|  8 |  S   |  4,335.61 |       54.52 |  4,392.26 | 9,103.58 |     114.48 |     379.16 | 260.21 |     4.46 |   4.00 | 20.00 |   3.50 |    3.50 | 8,843.37 |    410.16 |
|  9 |  S   |  4,392.26 |       55.24 |  4,449.65 | 8,843.37 |     111.21 |     379.16 | 263.61 |     4.33 |   4.00 | 20.00 |   3.50 |    3.50 | 8,579.75 |    410.16 |
| 10 |  S   |  4,449.65 |       55.96 |  4,507.78 | 8,579.75 |     107.90 |     379.16 | 267.06 |     4.20 |   4.00 | 20.00 |   3.50 |    3.50 | 8,312.70 |    410.16 |
| 11 |  S   |  4,507.78 |       56.69 |  4,566.68 | 8,312.70 |     104.54 |     379.16 | 270.55 |     4.07 |   4.00 | 20.00 |   3.50 |    3.50 | 8,042.15 |    410.16 |
| 12 |  S   |  4,566.68 |       57.43 |  4,626.35 | 8,042.15 |     101.14 |     379.16 | 274.08 |     3.94 |   4.00 | 20.00 |   3.50 |    3.50 | 7,768.07 |    410.16 |
| 13 |  S   |  4,626.35 |       58.18 |  4,686.80 | 7,768.07 |      97.69 |     379.16 | 277.66 |     3.81 |   4.00 | 20.00 |   3.50 |    3.50 | 7,490.41 |    410.16 |
| 14 |  S   |  4,686.80 |       58.94 |  4,748.03 | 7,490.41 |      94.20 |     379.16 | 281.29 |     3.67 |   4.00 | 20.00 |   3.50 |    3.50 | 7,209.12 |    410.16 |
| 15 |  S   |  4,748.03 |       59.71 |  4,810.07 | 7,209.12 |      90.66 |     379.16 | 284.97 |     3.53 |   4.00 | 20.00 |   3.50 |    3.50 | 6,924.15 |    410.16 |
| 16 |  S   |  4,810.07 |       60.49 |  4,872.92 | 6,924.15 |      87.08 |     379.16 | 288.69 |     3.39 |   4.00 | 20.00 |   3.50 |    3.50 | 6,635.46 |    410.16 |
| 17 |  S   |  4,872.92 |       61.28 |  4,936.59 | 6,635.46 |      83.45 |     379.16 | 292.46 |     3.25 |   4.00 | 20.00 |   3.50 |    3.50 | 6,343.00 |    410.16 |
| 18 |  S   |  4,936.59 |       62.08 |  5,001.09 | 6,343.00 |      79.77 |     379.16 | 296.28 |     3.11 |   4.00 | 20.00 |   3.50 |    3.50 | 6,046.72 |    410.16 |
| 19 |  S   |  5,001.09 |       62.89 |  5,066.43 | 6,046.72 |      76.04 |     379.16 | 300.15 |     2.96 |   4.00 | 20.00 |   3.50 |    3.50 | 5,746.57 |    410.16 |
| 20 |  S   |  5,066.43 |       63.71 |  5,132.63 | 5,746.57 |      72.27 |     379.16 | 304.07 |     2.82 |   4.00 | 20.00 |   3.50 |    3.50 | 5,442.49 |    410.16 |
| 21 |  S   |  5,132.63 |       64.55 |  5,199.69 | 5,442.49 |      68.44 |     379.16 | 308.05 |     2.67 |   4.00 | 20.00 |   3.50 |    3.50 | 5,134.45 |    410.16 |
| 22 |  S   |  5,199.69 |       65.39 |  5,267.63 | 5,134.45 |      64.57 |     379.16 | 312.07 |     2.52 |   4.00 | 20.00 |   3.50 |    3.50 | 4,822.37 |    410.16 |
| 23 |  S   |  5,267.63 |       66.24 |  5,336.45 | 4,822.37 |      60.65 |     379.16 | 316.15 |     2.36 |   4.00 | 20.00 |   3.50 |    3.50 | 4,506.22 |    410.16 |
| 24 |  S   |  5,336.45 |       67.11 |  5,406.18 | 4,506.22 |      56.67 |     379.16 | 320.28 |     2.21 |   4.00 | 20.00 |   3.50 |    3.50 | 4,185.94 |    410.16 |
| 25 |  S   |  5,406.18 |       67.99 |  5,476.81 | 4,185.94 |      52.64 |     379.16 | 324.47 |     2.05 |   4.00 | 20.00 |   3.50 |    3.50 | 3,861.48 |    410.16 |
| 26 |  S   |  5,476.81 |       68.88 |  5,548.37 | 3,861.48 |      48.56 |     379.16 | 328.71 |     1.89 |   4.00 | 20.00 |   3.50 |    3.50 | 3,532.77 |    410.16 |
| 27 |  S   |  5,548.37 |       69.78 |  5,620.87 | 3,532.77 |      44.43 |     379.16 | 333.00 |     1.73 |   4.00 | 20.00 |   3.50 |    3.50 | 3,199.77 |    410.16 |
| 28 |  S   |  5,620.87 |       70.69 |  5,694.31 | 3,199.77 |      40.24 |     379.16 | 337.35 |     1.57 |   4.00 | 20.00 |   3.50 |    3.50 | 2,862.42 |    410.16 |
| 29 |  S   |  5,694.31 |       71.61 |  5,768.71 | 2,862.42 |      36.00 |     379.16 | 341.76 |     1.40 |   4.00 | 20.00 |   3.50 |    3.50 | 2,520.66 |    410.16 |
| 30 |  S   |  5,768.71 |       72.55 |  5,844.08 | 2,520.66 |      31.70 |     379.16 | 346.22 |     1.24 |   4.00 | 20.00 |   3.50 |    3.50 | 2,174.44 |    410.16 |
| 31 |  S   |  5,844.08 |       73.49 |  5,920.44 | 2,174.44 |      27.35 |     379.16 | 350.75 |     1.07 |   4.00 | 20.00 |   3.50 |    3.50 | 1,823.69 |    410.16 |
| 32 |  S   |  5,920.44 |       74.45 |  5,997.80 | 1,823.69 |      22.93 |     379.16 | 355.33 |     0.89 |   4.00 | 20.00 |   3.50 |    3.50 | 1,468.36 |    410.16 |
| 33 |  S   |  5,997.80 |       75.43 |  6,076.16 | 1,468.36 |      18.47 |     379.16 | 359.97 |     0.72 |   4.00 | 20.00 |   3.50 |    3.50 | 1,108.39 |    410.16 |
| 34 |  S   |  6,076.16 |       76.41 |  6,155.55 | 1,108.39 |      13.94 |     379.16 | 364.68 |     0.54 |   4.00 | 20.00 |   3.50 |    3.50 |   743.71 |    410.16 |
| 35 |  S   |  6,155.55 |       77.41 |  6,235.98 |   743.71 |       9.35 |     379.16 | 369.44 |     0.36 |   4.00 | 20.00 |   3.50 |    3.50 |   374.27 |    410.16 |
| 36 |  S   |  6,235.98 |       78.42 |  6,317.46 |   374.27 |       4.71 |     379.16 | 374.27 |     0.18 |   4.00 | 20.00 |   3.50 |    3.50 |     0.00 |    410.16 |
| 37 |  S   |  6,317.46 |       79.45 |      0.00 |     0.00 |       0.00 |       0.00 |   0.00 |     0.00 |   4.00 | 20.00 |   3.50 |    3.50 |     0.00 |  6,431.00 |

</details>

---

## 5. Dataset D2 — Francés vehicular simple (PEN, indicadores limpios)

Fuente: `docs/guides/metodo-frances.md` (vehículo a 3 meses). Sin balloon, sin gracia, sin costos:
aísla la cuota francesa y los indicadores. Verificable a mano.

> Nota de redondeo: la fuente reporta la cuota con la TEM redondeada (0.72%), por lo que el motor a
> alta precisión puede arrojar la cuota con una diferencia de hasta ~1.00 (ver tolerancia §3). Los
> indicadores (VAN, TIR, TCEA) son consistentes con la cuota reportada.

### 5.1 Entradas

| Campo                         |                 Valor |
|-------------------------------|----------------------:|
| `moneda`                      |                   PEN |
| `precioVenta`                 |             15,000.00 |
| `porcentajeCuotaInicial`      |  0.20 (CI = 3,000.00) |
| `porcentajeCuotaFinal`        |     0.00 (sin cuotón) |
| `tipoTasa` / `valorTasa`      | EFECTIVA / 0.09 (TEA) |
| `diasAnio` / `frecuenciaDias` |              360 / 30 |
| `numCuotas` (n)               |                     3 |
| gracia / costos               |               ninguno |
| `cokAnual`                    |                  0.12 |

### 5.2 Valores intermedios esperados

| Intermedio  |     Valor |
|-------------|----------:|
| préstamo    | 12,000.00 |
| TEM (`i`)   |  0.72073% |
| COK mensual |  0.94888% |
| cuota `R`   |  4,057.80 |

### 5.3 Cronograma esperado

| Nº | Saldo inicial | Interés |    Cuota | Amortización | Saldo final |
|---:|--------------:|--------:|---------:|-------------:|------------:|
|  1 |     12,000.00 |   86.49 | 4,057.80 |     3,971.31 |    8,028.69 |
|  2 |      8,028.69 |   57.87 | 4,057.80 |     3,999.93 |    4,028.76 |
|  3 |      4,028.76 |   29.04 | 4,057.80 |     4,028.76 |        0.00 |

### 5.4 Indicadores esperados

| Indicador   | Valor |
|-------------|------:|
| VAN         | 54.03 |
| TIR mensual | 0.72% |
| TCEA        | 9.00% |

---

## 6. Dataset D3 — 60 meses con gracia y costos, VAN negativo (PEN)

Fuente: `docs/guides/metodo-frances.md` (operación integral). Sin balloon, con **3 periodos de gracia
total**, costos completos y desgravamen **separado** (no embebido): valida el camino general del
algoritmo con un **VAN < 0**.

### 6.1 Entradas

| Campo                         |                                                  Valor |
|-------------------------------|-------------------------------------------------------:|
| `moneda`                      |                                                    PEN |
| `precioVenta`                 |                                              65,000.00 |
| `porcentajeCuotaInicial`      |                                  0.20 (CI = 13,000.00) |
| `porcentajeCuotaFinal`        |                                                   0.00 |
| `tipoTasa` / `valorTasa`      |                                  EFECTIVA / 0.09 (TEA) |
| `diasAnio` / `frecuenciaDias` |                                               360 / 30 |
| `numCuotas` (n)               |                                                     60 |
| `graciaConfig`                |                         periodos 1–3 = `T`, 4–60 = `S` |
| costos iniciales              | 180.00 (notariales 100 + registrales 50 + comisión 30) |
| `tsd`                         |                                               0.000450 |
| `seguroRiesgo` (PV×TSR)       |                                                   5.42 |
| `portes` / `gastosAdm`        |                                          20.00 / 40.00 |
| `cokAnual`                    |                                                   0.05 |
| `desgravamenEmbebido`         |                                                  false |

### 6.2 Valores intermedios esperados

| Intermedio                    |      Valor |
|-------------------------------|-----------:|
| préstamo                      |  52,180.00 |
| TEM (`i`)                     | 0.7207323% |
| COK del periodo               | 0.4074124% |
| saldo tras gracia (periodo 4) |  53,316.39 |
| cuota `R` (desde periodo 4)   |   1,143.95 |

### 6.3 Cronograma esperado (filas clave)

| Nº | P.G. | Saldo inicial | Interés | Amortización | Cuota préstamo | Saldo final |     Flujo |
|---:|:----:|--------------:|--------:|-------------:|---------------:|------------:|----------:|
|  1 |  T   |     52,180.00 |  376.08 |         0.00 |           0.00 |   52,556.08 |    −88.90 |
|  2 |  T   |     52,556.08 |  378.79 |         0.00 |           0.00 |   52,934.87 |    −89.07 |
|  3 |  T   |     52,934.87 |  381.52 |         0.00 |           0.00 |   53,316.39 |    −89.24 |
|  4 |  S   |     53,316.39 |  384.27 |       759.68 |       1,143.95 |   52,556.71 | −1,233.36 |
|  5 |  S   |     52,556.71 |  378.79 |       765.15 |       1,143.95 |   51,791.55 | −1,233.02 |
|  6 |  S   |     51,791.55 |  373.28 |       770.67 |       1,143.95 |   51,020.88 | −1,232.67 |
| 58 |  S   |      3,382.96 |   24.38 |     1,119.57 |       1,143.95 |    2,263.40 | −1,210.89 |
| 59 |  S   |      2,263.40 |   16.31 |     1,127.63 |       1,143.95 |    1,135.76 | −1,210.38 |
| 60 |  S   |      1,135.76 |    8.19 |     1,135.76 |       1,143.95 |        0.00 | −1,209.88 |

(Costos por periodo: desgravamen = saldo×TSD, riesgo 5.42, portes 20.00, gastos adm 40.00.)

### 6.4 Indicadores esperados

| Indicador         |      Valor |
|-------------------|-----------:|
| Intereses totales |  13,025.03 |
| Desgravamen total |     813.24 |
| Riesgo total      |     325.00 |
| TIR del periodo   | 0.9657104% |
| TCEA              |   12.2243% |
| VAN               |  −9,420.70 |

---

## 7. Matriz de cobertura

| Dataset | Balloon | Gracia T | Gracia P | Costos | Desgrav. embebido | Tasa nominal | VAN + | VAN − | Cronograma largo |
|---------|:-------:|:--------:|:--------:|:------:|:-----------------:|:------------:|:-----:|:-----:|:----------------:|
| D1      |    ✓    |    ✓     |    ✓     |   ✓    |         ✓         |      ✓       |   ✓   |       |      ✓ (36)      |
| D2      |         |          |          |        |                   |              |   ✓   |       |                  |
| D3      |         |    ✓     |          |   ✓    |                   |              |       |   ✓   |      ✓ (60)      |

Entre los tres cubren: cuotón, gracia total y parcial, costos periódicos, desgravamen embebido y
separado, conversión nominal y efectiva, VAN positivo y negativo, y cronogramas corto y largo.
