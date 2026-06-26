# Product backlog

> Backlog **representativo** (historias clave por épica, no exhaustivo) de AutoFinance.
> Acompaña a [about.md](about.md) y [segmentos-objetivo.md](segmentos-objetivo.md). El
> vocabulario está en [lenguaje-ubicuo.md](lenguaje-ubicuo.md).

## Convenciones

- **Formato de historia:** `Como <rol>, quiero <acción>, para <beneficio>`. El rol operativo es
  el **asesor de ventas** (no se usa "usuario"; reservado a IAM).
- **Criterios de aceptación (AC):** estilo Gherkin-lite `Dado / Cuando / Entonces`.
- **Priorización MoSCoW:** `Must` (imprescindible para el MVP y exigido por el enunciado),
  `Should` (aumenta calidad, no bloquea la demo), `Could` (deseable), `Won't` (fuera de esta
  fase).
- **Subdominio:** cada épica se etiqueta como `core`, `supporting` o `generic` para guiar el
  esfuerzo de modelado en fases DDD posteriores.

## Mapa épica → feature → historia

| Épica                                  | Subdominio    | Features (resumen)                                                                                          | Prioridad dominante |
|----------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------|---------------------|
| E1 Cuenta y acceso                     | generic       | Alta de cuenta de concesionaria + login obligatorio; protección de endpoints; aislamiento por concesionaria | Must                |
| E2 Gestión de clientes                 | supporting    | Alta, edición/reguardado, consulta, baja del deudor                                                         | Must                |
| E3 Gestión de ofertas vehiculares      | supporting    | Alta, edición/reguardado, consulta, baja de la oferta                                                       | Must                |
| E4 Configuración del financiamiento    | core (config) | Moneda, tipo de tasa + capitalización, gracia, % cuota inicial, % cuotón, plazo, costos                     | Must                |
| E5 Motor de simulación / plan de pagos | **core**      | Cronograma francés + balloon, gracia, costos periódicos, cuadre                                             | Must                |
| E6 Indicadores y transparencia         | **core**      | VAN/TIR óptica del deudor, TCEA, conversión de tasas, transparencia SBS                                     | Must                |
| E7 Persistencia y trazabilidad         | supporting    | Guardar/editar/reabrir simulación ligada a cliente y oferta                                                 | Must                |
| E8 Ayuda y asistencia                  | supporting    | Ayuda contextual por campo; diagnóstico técnico                                                             | Should              |

---

## E1 — Cuenta y acceso `generic`

**H1.1 (Must)** — Como asesor de ventas, quiero iniciar sesión con usuario y contraseña, para
acceder al sistema.
```text
Dado un actor con credenciales registradas
Cuando envía credenciales válidas
Entonces recibe una sesión válida y puede operar
```
```text
Dado credenciales inválidas
Cuando intenta ingresar
Entonces el acceso se rechaza y no se expone información sensible
```

**H1.2 (Must)** — Como sistema, quiero bloquear todo endpoint de negocio sin sesión válida, para
garantizar que el acceso al aplicativo sea obligatoriamente autenticado.
```text
Dado un endpoint de negocio
Cuando se invoca sin sesión válida
Entonces la respuesta es de acceso no autorizado
```

**H1.3 (Must)** — Como **concesionaria**, quiero **registrar mi cuenta** (alta de la concesionaria y
su usuario), para poder operar el sistema. Un usuario pertenece a **una** concesionaria.

**H1.4 (Must)** — Como sistema, quiero **aislar los datos por concesionaria** (cada cuenta solo ve lo
suyo), para garantizar la separación entre concesionarias (multi-tenant).

---

## E2 — Gestión de clientes `supporting`

**H2.1 (Must)** — Como asesor de ventas, quiero dar de alta los datos del cliente (deudor), para
asociarlo a una oferta y una simulación.
```text
Dado los datos obligatorios del cliente (documento, nombres, contacto)
Cuando registro el cliente
Entonces queda persistido y disponible para asociarlo
```
```text
Dado un dato obligatorio faltante o inválido
Cuando intento registrar
Entonces el alta se rechaza indicando el campo
```

**H2.2 (Must)** — Como asesor de ventas, quiero **editar y volver a guardar** los datos del
cliente, para corregir o actualizar la información (requisito explícito del enunciado).
```text
Dado un cliente registrado
Cuando modifico sus datos y guardo
Entonces los cambios quedan persistidos
```

**H2.3 (Must)** — Como asesor de ventas, quiero consultar/listar clientes, para encontrar a quién
asociar una operación.

**H2.4 (Should)** — Como asesor de ventas, quiero dar de baja un cliente, para completar el CRUD.

---

## E3 — Gestión de ofertas vehiculares `supporting`

**H3.1 (Must)** — Como asesor de ventas, quiero registrar la oferta vehicular (vehículo, precio
de venta y características), para usarla como base del financiamiento.
```text
Dado los datos de la oferta (vehículo, precio de venta)
Cuando la registro
Entonces queda persistida y disponible para configurar el financiamiento
```

**H3.2 (Must)** — Como asesor de ventas, quiero **editar y volver a guardar** la oferta vehicular,
para mantenerla actualizada.

**H3.3 (Must)** — Como asesor de ventas, quiero consultar/listar ofertas vehiculares.

**H3.4 (Should)** — Como asesor de ventas, quiero dar de baja una oferta, para completar el CRUD.

---

## E4 — Configuración del financiamiento `core (config)`

**H4.1 (Must)** — Como asesor de ventas, quiero definir la **moneda** de la operación (PEN o USD),
para que todos los montos y tasas se expresen en ella.
```text
Dada una operación nueva
Cuando selecciono la moneda (PEN o USD)
Entonces toda la operación queda denominada en esa única moneda (sin conversión)
```

**H4.2 (Must)** — Como asesor de ventas, quiero definir el **tipo de tasa**: efectiva, o nominal
indicando su **capitalización**, para calcular correctamente la tasa del periodo.
```text
Dado que elijo tasa nominal (TNA)
Cuando configuro la operación
Entonces la capitalización es obligatoria y se deriva la tasa efectiva del periodo
```
```text
Dado que elijo tasa efectiva (TEA)
Cuando configuro la operación
Entonces se deriva la tasa efectiva del periodo sin requerir capitalización
```

**H4.3 (Must)** — Como asesor de ventas, quiero definir al inicio los **periodos de gracia** total
(`T`) y parcial (`P`), para reflejar el diferimiento pactado.
```text
Dado un conjunto de periodos marcados como T o P al inicio
Cuando se genera la simulación
Entonces esos periodos aplican la regla de gracia correspondiente
```

**H4.4 (Must)** — Como asesor de ventas, quiero definir **% de cuota inicial**, **% de cuota
final (cuotón)** y el **plazo/Plan** (p. ej. Plan 36), para parametrizar la Compra Inteligente.

**H4.5 (Should)** — Como asesor de ventas, quiero configurar los **costos** de la operación
(costos iniciales notariales/registrales; costos periódicos: desgravamen `TSD`, seguro de riesgo
`TSR`, GPS, portes, gastos administrativos), para reflejar el costo real del crédito.

---

## E5 — Motor de simulación / plan de pagos `core`

**H5.1 (Must)** — Como asesor de ventas, quiero generar el **cronograma por método francés vencido
ordinario**, para ver interés, amortización y saldo por periodo.
```text
Dado el préstamo, la tasa efectiva del periodo y n, sin gracia
Cuando genero el cronograma
Entonces la cuota es constante = VA·[ i / (1 − (1+i)^−n) ]
   y para cada periodo: interés = saldo·i, amortización = cuota − interés,
   saldo final = saldo inicial − amortización
   y el saldo final del último periodo es ≈ 0
```

**H5.2 (Must)** — Como asesor de ventas, quiero aplicar la **Compra Inteligente con cuotón**, para
reducir la cuota periódica difiriendo parte del capital al final.
```text
Dado un % de cuota final (cuotón) y n
Cuando genero el cronograma
Entonces la cuota ordinaria = [ VA − cuotón/(1+i)^n ]·[ i / (1 − (1+i)^−n) ]
   y existe un bloque paralelo que controla el crecimiento del cuotón
   y una fila final que liquida el cuotón
```

**H5.3 (Must)** — Como asesor de ventas, quiero que la **gracia** se aplique correctamente, para
que el saldo evolucione según lo pactado.
```text
Dado un periodo de gracia total (T)
Entonces cuota = 0, amortización = 0, saldo final = saldo inicial + interés (se capitaliza)
```
```text
Dado un periodo de gracia parcial (P)
Entonces cuota = interés, amortización = 0, saldo final = saldo inicial (se mantiene)
```

**H5.4 (Must)** — Como asesor de ventas, quiero que cada periodo arme el **flujo total**, para
reflejar lo que realmente paga el deudor.
```text
Dado un periodo del cronograma
Cuando se calcula el pago
Entonces flujo total = cuota + seguro de desgravamen + seguro de riesgo + GPS + portes + gastos administrativos
   y los costos periódicos se pagan también durante la gracia
```

**H5.5 (Must)** — Como sistema, quiero validar el cronograma con **reglas de cuadre**, para
garantizar la veracidad del modelo.
```text
Dado un cronograma generado
Entonces se cumple: saldo final último ≈ 0; cuota = interés + amortización;
   gracia total sube el saldo; gracia parcial lo mantiene
   (replicable contra el ejemplo Plan 36)
```

**H5.6 (Should)** — Como asesor de ventas, quiero la variante con **desgravamen incorporado en la
tasa** (`j = i + TSD`), para calcular la cuota con el seguro embebido.

---

## E6 — Indicadores financieros y transparencia `core`

**H6.1 (Must)** — Como asesor de ventas, quiero calcular el **VAN desde la óptica del deudor**,
para saber si el financiamiento es conveniente frente a su COK.
```text
Dado el préstamo recibido y los flujos totales por periodo
Cuando calculo el VAN a la COK del periodo
Entonces VAN = Préstamo + Σ [ Flujo_t / (1 + COK_periodo)^t ]
```

**H6.2 (Must)** — Como asesor de ventas, quiero calcular la **TIR periódica**, para conocer el
costo efectivo de la operación.
```text
Dado los flujos de la operación
Cuando calculo la TIR
Entonces es la tasa que hace VAN = 0
```

**H6.3 (Must)** — Como asesor de ventas, quiero obtener la **TCEA**, para comparar el costo anual
real del crédito.
```text
Dada la TIR periódica
Cuando la anualizo
Entonces TCEA = (1 + TIR_periodo)^(periodos por año) − 1
```

**H6.4 (Must)** — Como asesor de ventas, quiero exponer los **indicadores de transparencia SBS**,
para cumplir la norma: TCEA y el desglose y totales de seguro de desgravamen, seguro de riesgo,
GPS, portes y gastos administrativos.

**H6.5 (Should)** — Como asesor de ventas, quiero ver la **conversión de tasas** aplicada
(TNA + capitalización → TEA → TEP/TEM), para entender de dónde sale la tasa del periodo.

---

## E7 — Persistencia y trazabilidad `supporting`

**H7.1 (Must)** — Como asesor de ventas, quiero **guardar** una simulación completa (configuración
+ cronograma + indicadores) ligada a un cliente y una oferta, para conservar la operación.
```text
Dada una simulación generada
Cuando la guardo
Entonces queda persistida y asociada a su cliente y su oferta vehicular
```

**H7.2 (Must)** — Como asesor de ventas, quiero **reabrir y editar** una simulación guardada y
volver a calcular y guardar, para ajustar la operación (requisito de editar/reguardar).

**H7.3 (Should)** — Como asesor de ventas, quiero el **historial** de simulaciones por cliente,
para revisar operaciones anteriores.

---

## E8 — Ayuda y asistencia `supporting`

**H8.1 (Should)** — Como asesor de ventas, quiero **ayuda contextual por campo** (qué es TEA,
capitalización, gracia, cuotón, COK), para operar correctamente. Cubre el requisito del enunciado
de "ayuda o indicaciones en cada uno de los campos".

**H8.2 (Could)** — Como operador, quiero un endpoint de **diagnóstico/health**, para verificar que
el servicio está disponible (asistencia técnica).

---

## Trazabilidad con el enunciado

| Requisito del enunciado (`project-statement.md`)              | Épica(s) que lo cubren          |
|---------------------------------------------------------------|---------------------------------|
| Ingreso obligatorio con usuario y clave                       | E1                              |
| Dar de alta datos del cliente                                 | E2 (H2.1)                       |
| Dar de alta características de la oferta vehicular            | E3 (H3.1)                       |
| Editar/modificar y volver a guardar                           | E2 (H2.2), E3 (H3.2), E7 (H7.2) |
| Configurar moneda                                             | E4 (H4.1)                       |
| Configurar tipo de tasa (efectiva o nominal + capitalización) | E4 (H4.2)                       |
| Configurar plazos de gracia                                   | E4 (H4.3)                       |
| Plan de pagos por método francés vencido + Compra Inteligente | E5                              |
| Cálculo de VAN y TIR (óptica del deudor)                      | E6 (H6.1, H6.2)                 |
| Indicadores de transparencia SBS                              | E6 (H6.3, H6.4)                 |
| Registrar todas las operaciones en base de datos              | E7                              |
| Ayuda/indicaciones por campo                                  | E8 (H8.1)                       |

## Resumen de priorización MoSCoW

| Nivel                 | Qué incluye                                                                                                                                                                                                                         | Rationale                                                                                  |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| **Must**              | E1 (cuenta de concesionaria + login + aislamiento); E2/E3 alta + edición/reguardado + consulta; E4 (moneda, tasa+capitalización, gracia, %CI, %cuotón, plazo); E5 completo; E6 (VAN, TIR, TCEA, transparencia); E7 guardar + editar | Es lo que el enunciado vuelve obligatorio y el núcleo sin el cual no hay producto ni demo. |
| **Should**            | Baja en CRUD (H2.4, H3.4); H4.5 costos; H5.6 `j = i + TSD`; H6.5 conversión visible; H7.3 historial; E8 ayuda                                                                                                                       | Aumenta realismo y calidad; no bloquea la demostración.                                    |
| **Could**             | H8.2 diagnóstico/health; exportes                                                                                                                                                                                                   | Deseable, valor marginal.                                                                  |
| **Won't (esta fase)** | Otros métodos (alemán/americano/peruano); UI; originación/desembolso; pagos reales; scoring; tipo de cambio (FX)                                                                                                                    | Mantiene el alcance enfocado; ver *Alcance y límites* en [about.md](about.md).             |
