# Segmento objetivo

> Define **a quién va dirigido** AutoFinance. Acompaña a [about.md](about.md) y usa el
> vocabulario de [lenguaje-ubicuo.md](lenguaje-ubicuo.md).

## Marco conceptual

Antes de nombrar el segmento, conviene separar tres conceptos que suelen confundirse:

| Concepto                        | Pregunta que responde                       | A quién corresponde                                     |
|---------------------------------|---------------------------------------------|---------------------------------------------------------|
| **Punto de vista del producto** | ¿Para quién es la herramienta?              | La concesionaria de vehículos.                          |
| **Perspectiva de cálculo**      | ¿Desde qué óptica se calculan VAN y TIR?    | El deudor.                                              |
| **Segmento objetivo**           | ¿A quién apunta el producto como audiencia? | La concesionaria, representada por el asesor de ventas. |

Por eso AutoFinance tiene **un único segmento objetivo**: la **concesionaria de vehículos** (y sus
asesores de ventas). El deudor es **beneficiario final**, no segmento del producto, porque no opera
el sistema. Es **multi-concesionaria**: la misma app sirve a varias concesionarias, cada una con su
cuenta y sus datos separados.

> **Nota de lenguaje:** en estos documentos **no** se usa la palabra "usuario" para referirse a
> las personas. El término `Usuario` se reserva para el contexto genérico de **IAM**
> (autenticación/cuenta). Aquí hablamos de **asesor de ventas**, **actor** o **rol operativo**.

## Segmento objetivo: concesionaria de vehículos (asesor de ventas)

La **concesionaria de vehículos** peruana que ofrece crédito vehicular bajo la modalidad **Compra
Inteligente** a sus compradores. Operativamente, quien interactúa con el sistema es el **asesor de
ventas** de la concesionaria.

| Atributo     | Descripción                                                                                                                                                                                                  |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Quién es     | Concesionaria de vehículos en Perú que ofrece financiamiento a sus compradores; el asesor de ventas es su rol operativo.                                                                                     |
| Qué necesita | Armar cotizaciones rápidas y **exactas**; registrar cliente y oferta; **editar y volver a guardar** lo registrado; mostrar al deudor el cronograma y los indicadores de transparencia.                       |
| Contexto     | Marco normativo SBS (transparencia de la información); operaciones en Soles o Dólares; modalidad balloon para reducir la cuota mensual; varias concesionarias sobre la misma app (cuenta por concesionaria). |
| Qué valora   | Reproducibilidad del cálculo, claridad de los indicadores, trazabilidad de las cotizaciones, separación de sus datos.                                                                                        |

## Beneficiario final: el deudor / comprador

El deudor **no es segmento objetivo del producto** (no usa el sistema), pero su perfil y sus
derechos **moldean los requisitos**.

| Atributo                | Descripción                                                                                                                                                                                                      |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Perfil                  | Comprador de vehículo **sensible a la cuota mensual baja**, dispuesto a asumir un pago final (cuotón) a cambio de cuotas periódicas menores. La modalidad Compra Inteligente encaja exactamente con este perfil. |
| Por qué importa         | Su **óptica define el cálculo de VAN y TIR**; la **norma de transparencia SBS** existe para protegerlo, lo que obliga a exponer TCEA y el desglose de seguros y costos.                                          |
| Relación con el sistema | Recibe la oferta y la explicación del asesor; sus datos se registran, pero **no opera** la herramienta.                                                                                                          |

## Por qué un solo segmento en v1

- El enunciado fija que el desarrollo se enfoca **desde el punto de vista de la concesionaria**; el
  sistema es su herramienta de cotización.
- Mantener **un segmento** evita mezclar "quién usa el producto" con "quién se beneficia del
  resultado", lo que mantiene limpio el modelado posterior.
- El perfil del deudor se captura como **driver de requisitos** (indicadores, transparencia),
  no como un segmento aparte que habría que atender con funcionalidades propias.
- La **multi-concesionaria** no agrega segmentos: es la misma audiencia (concesionaria / asesor de
  ventas) replicada por *tenant*, con datos separados.

## Tabla resumen

| Actor                            | Relación con el producto                 | Necesidad principal                                 | Cómo lo atiende AutoFinance                                        |
|----------------------------------|------------------------------------------|-----------------------------------------------------|--------------------------------------------------------------------|
| Concesionaria / asesor de ventas | **Segmento objetivo** (opera el sistema) | Cronograma e indicadores exactos, registro editable | Motor de cálculo + CRUD + persistencia trazable por concesionaria  |
| Deudor / comprador               | **Beneficiario final** (no opera)        | Cuota mensual baja y transparencia del costo        | Modalidad balloon + VAN/TIR óptica del deudor + transparencia SBS  |
