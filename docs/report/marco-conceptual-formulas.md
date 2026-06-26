# Marco conceptual del motor financiero

> Modelo matemático que implementa el motor de cálculo de AutoFinance. Es el **contrato** entre el
> material de referencia (`docs/guides/`) y el código: selecciona y congela las fórmulas exactas del
> producto v1. El vocabulario es el de [lenguaje-ubicuo.md](../product/lenguaje-ubicuo.md); el
> diccionario de variables está en [analisis-de-datos.md](analisis-de-datos.md) y la secuencia de
> cálculo en [algoritmo.md](algoritmo.md).

## 1. Alcance y supuestos del modelo

- **Un solo método**: francés vencido ordinario + **Compra Inteligente** (cuotón). El francés puro
  es el caso particular con cuotón = 0.
- **Una sola tasa por operación** (sin cambios de tasa intermedios).
- **Mono-divisa**: toda la operación en PEN **o** USD; sin tipo de cambio.
- **Convención 30/360**: mes de 30 días, año de 360 días.
- **Perspectiva dual**: el sistema modela la operación desde la **concesionaria**; los indicadores
  **VAN/TIR** se calculan desde la **óptica del deudor**.
- **Fuera del modelo**: otros métodos (alemán/americano/peruano), FX, cambio de tasa intermedio.

## 2. Notación y convención de tiempo

| Símbolo         | Significado                                          | Unidad         |
|-----------------|------------------------------------------------------|----------------|
| `PV`            | Precio de venta del vehículo                         | dinero         |
| `%CI`           | Porcentaje de cuota inicial sobre `PV`               | fracción [0,1) |
| `CI`            | Cuota inicial                                        | dinero         |
| `%cuotón`       | Porcentaje de cuota final (cuotón) sobre `PV`        | fracción [0,1) |
| `cuotón`        | Valor de la cuota final diferida                     | dinero         |
| `C` / `VA`      | Préstamo o capital financiado                        | dinero         |
| `TNA`           | Tasa nominal anual                                   | fracción       |
| `TEA`           | Tasa efectiva anual                                  | fracción       |
| `TEP` / `TEM`   | Tasa efectiva del periodo (i)                        | fracción       |
| `i`             | Tasa efectiva del periodo usada en la cuota          | fracción       |
| `j`             | Tasa ajustada con desgravamen embebido (`i + TSD`)   | fracción       |
| `n`             | Número total de cuotas ordinarias                    | entero         |
| `t`             | Índice de periodo (1..n)                             | entero         |
| `m`             | Capitalizaciones por año (`360/días_capitalización`) | entero         |
| `SI_t` / `SF_t` | Saldo inicial / final del periodo `t`                | dinero         |
| `I_t` / `A_t`   | Interés / amortización del periodo `t`               | dinero         |
| `R`             | Cuota regular (constante en el tramo ordinario)      | dinero         |
| `CT`            | Cuota total (cuota + costos periódicos)              | dinero         |
| `TSD` / `TSR`   | Tasa seguro desgravamen / seguro todo riesgo         | fracción       |
| `COK`           | Costo de oportunidad del capital del deudor          | fracción       |
| `TIR` / `TCEA`  | Tasa interna de retorno / costo efectivo anual       | fracción       |

Convención de días: `m = 360/días_capitalización`; al pasar de anual a periodo se usa el exponente
`días_periodo/días_año` (p. ej. `30/360`).

## 3. Conversión de tasas

```text
TEA  = (1 + TNA/m)^m − 1                       (nominal → efectiva anual)
TEP  = (1 + TNA/m)^n − 1                        (nominal → efectiva del periodo, directo)
TEP  = (1 + TEA)^(días_periodo/días_año) − 1    (efectiva anual → efectiva del periodo)
TEP2 = (1 + TEP1)^(n2/n1) − 1                   (tasas equivalentes)
```

Reglas de aplicación:

| Entrada                                 | Camino                                        | Resultado               |
|-----------------------------------------|-----------------------------------------------|-------------------------|
| Tasa **nominal** (TNA + capitalización) | `TEA = (1 + TNA/m)^m − 1`, luego a TEP        | requiere capitalización |
| Tasa **efectiva** (TEA)                 | `TEP = (1 + TEA)^(días_periodo/días_año) − 1` | directo                 |

Donde `m = 360/días_capitalización` y, para el camino directo nominal,
`n = días_periodo/días_capitalización`. El **interés simple no se usa** (fuera de alcance).

## 4. Cálculo del préstamo

```text
CI       = PV × %CI
C        = PV − CI + costos_iniciales
```

Los **costos iniciales** (notariales, registrales, tasación, comisiones) se suman al préstamo solo
si se financian. Si se pagan al contado, no entran en `C`.

## 5. Cuota — método francés vencido ordinario

```text
R = C × [ i / (1 − (1 + i)^(−n)) ]          (≡ C × [ i·(1+i)^n ] / [ (1+i)^n − 1 ])
```

Descomposición por periodo:

```text
I_t  = SI_t × i
A_t  = R − I_t
SF_t = SI_t − A_t
SI_(t+1) = SF_t
```

Al inicio la cuota es mayormente interés; conforme baja el saldo, crece la amortización. El saldo
final del último periodo debe ser ≈ 0.

## 6. Cuota — Compra Inteligente (cuotón / balloon)

Una parte del valor se difiere como **cuotón** y no se amortiza con las cuotas ordinarias:

```text
cuotón = PV × %cuotón
jB     = i + TSD   (si el desgravamen se capitaliza en el cuotón; si no, jB = i)
VP     = cuotón / (1 + jB)^(n+1)             (valor presente del cuotón, liquidado en el periodo n+1)
R      = (C − VP) × [ i / (1 − (1 + i)^(−n)) ]
```

Con cuotón = 0, `VP = 0` y la fórmula se reduce al francés puro de §5.

El cronograma corre **dos bloques en paralelo**:

| Bloque        | Comportamiento                                                                                                          |
|---------------|------------------------------------------------------------------------------------------------------------------------|
| Cuotón        | Crece cada periodo capitalizando interés **y desgravamen**: `SF = SI × (1 + jB)`. Se liquida en la fila final (periodo `n+1`) a su valor nominal. |
| Cuota regular | Aplica el método francés de §5 sobre el saldo no diferido (`C − VP`).                                                  |

Tras la última cuota ordinaria se añade una **fila de liquidación del cuotón** que paga el saldo
acumulado del bloque del cuotón.

> La fórmula de `R` de arriba es la forma cerrada **sin gracia** (sobre `C − VP` y los `n` periodos).
> Cuando hay periodos de gracia, la cuota ordinaria se **recalcula** sobre el saldo que entra al
> tramo ordinario y las cuotas ordinarias restantes (ver §9).

## 7. Variante: desgravamen embebido en la tasa `Should`

En algunos modelos la cuota incorpora el seguro de desgravamen ajustando la tasa de cálculo:

```text
j = i + TSD
R = (C − cuotón/(1+j)^(n+1)) × [ j / (1 − (1 + j)^(−n)) ]
```

Cuando el desgravamen está embebido, la tasa `j` se usa para la cuota regular **y** para la
capitalización del cuotón (§6). El desgravamen por fila se registra aparte (sobre el saldo) pero no se
suma dos veces al flujo. Los demás costos periódicos se suman al flujo igual que en §10.

## 8. Construcción del cronograma (el "qué")

Para cada periodo `t = 1..n` se calcula el interés sobre el saldo inicial, se aplica la regla del
tipo de periodo (sin gracia `S`, total `T` o parcial `P`, §9), se obtiene la amortización y el saldo
final, y se agregan los costos periódicos para formar el flujo (§10). El detalle procedimental
(orden de operaciones, subrutinas) está en [algoritmo.md](algoritmo.md).

## 9. Periodos de gracia

```text
Gracia total  (T):  I_t = SI_t × i ;  cuota = 0 ;  A_t = 0 ;  SF_t = SI_t + I_t = SI_t × (1 + i)
Gracia parcial (P): I_t = SI_t × i ;  cuota = I_t ; A_t = 0 ;  SF_t = SI_t
Sin gracia    (S):  periodo normal según el método (§5/§6)
```

La gracia total **capitaliza** intereses (el saldo sube); la parcial los paga (el saldo se mantiene).
En ambos casos, los **costos periódicos se siguen pagando**.

**Recálculo de la cuota tras la gracia:** cuando existen periodos de gracia, la cuota ordinaria `R`
se calcula sobre el saldo que resulta al terminar el tramo de gracia y el número de cuotas ordinarias
restantes (`k = n − periodos de gracia`), de forma análoga al recálculo del método francés del
material de referencia. Sin gracia, `R` se calcula desde el inicio sobre `C − VP` y los `n` periodos
(§5/§6).

## 10. Costos periódicos y flujo de caja del periodo

```text
Seguro de desgravamen:   SD_t = SI_t × TSD          (sobre el saldo del periodo)
Seguro contra todo riesgo: STR = PV × TSR            (o un monto fijo por periodo)
Cuota total:             CT_t = R + costos_periódicos
Flujo del periodo:       Flujo_t = cuota + SD_t + STR + GPS + portes + gastos_adm
```

Los costos periódicos no amortizan capital y se pagan también durante la gracia.

## 11. Indicadores: VAN, TIR, TCEA

Desde la óptica del deudor, el préstamo es un ingreso inicial y las cuotas/flujos son egresos:

```text
VAN  = Préstamo + Σ_{t=1..n}  Flujo_t / (1 + COK_periodo)^t      (flujos como salidas, signo negativo)
       ≡ Préstamo − Σ_{t=1..n} Cuota_t / (1 + COK)^t
TIR:   tasa que hace VAN = 0  (se resuelve numéricamente; ver algoritmo.md)
TCEA = (1 + TIR_periodo)^(cuotas_por_año) − 1
COK_periodo = (1 + COK_anual)^(días_periodo/días_año) − 1
```

Interpretación: `VAN > 0` ⇒ el financiamiento conviene frente al COK del deudor. La **TCEA** supera
a la tasa compensatoria porque incluye seguros y costos; es el indicador de transparencia comparable.

## 12. Reglas de cuadre (validación del modelo)

| Regla                   | Criterio                                                                              |
|-------------------------|---------------------------------------------------------------------------------------|
| Saldo final último      | ≈ 0 (cuota regular)                                                                   |
| Composición de la cuota | `R = I_t + A_t` en periodos `S`                                                       |
| Gracia total            | el saldo sube por intereses capitalizados                                             |
| Gracia parcial          | el saldo se mantiene                                                                  |
| Cuotón                  | crece a `SI × (1 + i)` y se liquida en la fila final                                  |
| Reproducibilidad        | replicable contra el dataset D1 (Plan 36) de [datos-de-prueba.md](datos-de-prueba.md) |

## 13. Política de redondeo y precisión

- **Cálculo interno con alta precisión**: mantener decimales internos (`BigDecimal`, `MathContext`
  de scale ≥ 12, redondeo `HALF_UP`) y redondear **solo al mostrar**.
- **Salida**: montos a 2 decimales; tasas a 6–8 decimales.
- **VAN/TIR** se calculan sobre los flujos internos sin redondear, para evitar acumulación de error.
- Fundamento: el material de referencia advierte explícitamente "mantener decimales internos y
  redondear solo para mostrar".

## 14. Mapa fórmula → historia → guía fuente

| Fórmula / regla          | Historia (backlog) | Guía fuente (`docs/guides/`)                                       |
|--------------------------|--------------------|--------------------------------------------------------------------|
| Conversión de tasas (§3) | H4.2, H6.5         | tasas-equivalentes-y-tasa-efectiva, tasa-interes-compuesta-nominal |
| Préstamo (§4)            | H4.4               | planes-de-pago, metodo-frances                                     |
| Cuota francesa (§5)      | H5.1               | metodo-frances                                                     |
| Compra Inteligente (§6)  | H5.2               | metodo-frances-compra-inteligente-balloon                          |
| `j = i + TSD` (§7)       | H5.6               | metodo-frances-compra-inteligente-balloon                          |
| Gracia (§9)              | H5.3               | planes-de-pago, metodo-frances-compra-inteligente-balloon          |
| Costos / flujo (§10)     | H5.4               | planes-de-pago, metodo-frances                                     |
| VAN/TIR/TCEA (§11)       | H6.1, H6.2, H6.3   | van-tir, indicadores-rentabilidad                                  |
| Reglas de cuadre (§12)   | H5.5               | planes-de-pago (§16)                                               |
