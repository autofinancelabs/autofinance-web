# AutoFinance — Plataforma de planes de pago para crédito vehicular

> Documento de producto (brief). Resume **qué es**, **qué problema resuelve** y **hasta dónde
> llega** AutoFinance. Es el punto de entrada para entender el alcance antes del modelado de
> dominio y el código. El vocabulario usado aquí está definido en
> [lenguaje-ubicuo.md](lenguaje-ubicuo.md).

## Qué es

AutoFinance es el **backend (REST API)** de un sistema que construye y conserva **planes de pago
de crédito vehicular en Perú**, calculados por el **método francés vencido ordinario** (meses de
30 días, año de 360) bajo la modalidad **Compra Inteligente** (cuota *balloon* / cuotón / valor
residual diferido al final).

El sistema es la **herramienta de cotización** de la **concesionaria de vehículos**: lo operan sus
**asesores de ventas** para ofrecer el crédito vehicular al comprador; no es una aplicación para el
público final. El asesor registra a sus clientes y las ofertas vehiculares, **ingresa** las
condiciones del financiamiento (incluida la tasa), genera el cronograma y obtiene los indicadores de
transparencia exigidos. Es **multi-concesionaria**: varias concesionarias usan la misma app, cada
una con su cuenta y sus datos separados.

## Problema que resuelve

| Dolor actual                                                                                                                                             | Cómo lo aborda AutoFinance                                                                                                          |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| El cálculo manual o en Excel del cronograma (cuotón, gracia, seguros, costos) es laborioso y propenso a error.                                           | Motor de cálculo exacto y **reproducible** que sigue las fórmulas del método francés y de la Compra Inteligente.                    |
| La norma de transparencia del Sistema Financiero Peruano (SBS) exige mostrar indicadores (TCEA, VAN, TIR, desglose de seguros y costos) de forma fiable. | Calcula y expone esos indicadores de manera consistente con el cronograma.                                                          |
| La información de clientes, ofertas y cotizaciones suele estar dispersa.                                                                                 | Centraliza clientes, ofertas vehiculares y cotizaciones en una única fuente persistente **por concesionaria**, editable y trazable. |

## Propuesta de valor

- **Cronograma exacto y reproducible** del método francés vencido ordinario + Compra Inteligente
  (cuotón).
- **Multimoneda mono-divisa**: cada operación se denomina íntegramente en Soles (PEN) **o**
  Dólares (USD), definida al inicio. (Sin tipo de cambio; ver *Alcance y límites*.)
- **Tasa configurable**: efectiva, o **nominal** indicando su **capitalización** — es un **dato de
  entrada** del asesor (sin bancos/financieras simulados).
- **Periodos de gracia** total (`T`) y parcial (`P`) definidos al inicio de la operación.
- **Indicadores desde la óptica del deudor** (VAN y TIR) más la **batería de transparencia SBS**
  (TCEA, seguro de desgravamen, seguro contra todo riesgo, GPS, portes, gastos administrativos).
- **Multi-concesionaria**: cada concesionaria opera con su propia cuenta; los datos quedan
  segregados por concesionaria.
- **Trazabilidad**: toda cotización queda registrada y puede editarse y volver a guardarse.

## Alcance y límites

| Dentro del alcance (IN)                                                                                                                                                              | Fuera del alcance (OUT)                                                                                                          |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Registro de cuenta de **concesionaria** + acceso autenticado (login/password obligatorio).                                                                                           | Otros métodos de amortización (alemán, americano, peruano): referencia teórica, no producto.                                     |
| **Multi-concesionaria**: cada concesionaria opera con su cuenta; datos segregados por concesionaria (un usuario → una concesionaria).                                                | Originación/desembolso real del crédito.                                                                                         |
| Gestión (CRUD) de clientes.                                                                                                                                                          | Pasarela o registro de pagos reales.                                                                                             |
| Gestión (CRUD) de ofertas vehiculares.                                                                                                                                               | **Scoring / historial crediticio** del cliente: el cálculo usa **solo** las condiciones ingresadas.                              |
| Configuración del financiamiento (moneda, tipo de tasa + capitalización, gracia, % cuota inicial, % cuotón, plazo); la **tasa y demás condiciones son datos de entrada** del asesor. | Catálogo de **bancos/financieras**: la cotización se arma con datos de entrada, sin entidades simuladas.                         |
| Motor de **cotización**: cronograma francés + Compra Inteligente (balloon).                                                                                                          | Suscripciones / planes de pago de la cuenta (billing).                                                                           |
| Indicadores: VAN/TIR óptica del deudor, TCEA, transparencia SBS.                                                                                                                     | Conversión de tipo de cambio (FX) PEN↔USD.                                                                                       |
| **Guardar / reabrir / editar** la cotización; persistencia y trazabilidad.                                                                                                           | Interfaz de usuario (UI): AutoFinance es **backend REST**; las pantallas del informe académico son diseño, no parte de esta API. |

## Perspectiva

Conviene no confundir tres planos:

| Plano                                   | A quién corresponde                                                                                                  |
|-----------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| **Punto de vista del producto/sistema** | La **concesionaria de vehículos** (el sistema es su herramienta de cotización).                                      |
| **Perspectiva de cálculo de VAN y TIR** | El **deudor** (los indicadores se calculan desde su óptica).                                                         |
| **Segmento objetivo**                   | La **concesionaria**, representada por el **asesor de ventas** (ver [segmentos-objetivo.md](segmentos-objetivo.md)). |

## Stakeholders

| Stakeholder                | Rol                                                                                                         |
|----------------------------|-------------------------------------------------------------------------------------------------------------|
| Concesionaria de vehículos | Dueña de su cuenta y de sus operaciones; perspectiva del sistema (tenant).                                  |
| Asesor de ventas           | Opera el sistema: registra cliente y oferta, ingresa las condiciones y genera la cotización.                |
| Deudor / comprador         | **Beneficiario final**: recibe la oferta; su óptica define VAN/TIR y la transparencia. No opera el sistema. |
| Contexto académico         | Curso de Finanzas e Ingeniería Económica; el sistema es parte del entregable.                               |

## Tecnología de un vistazo

| Aspecto           | Elección                                        |
|-------------------|-------------------------------------------------|
| Tipo              | Backend REST API                                |
| Framework         | Spring Boot 4.1                                 |
| Lenguaje          | Java 25                                         |
| Base de datos     | PostgreSQL                                      |
| Persistencia      | Spring Data JPA                                 |
| Multi-tenant      | Hibernate `@TenantId` (datos por concesionaria) |
| Utilitario        | Lombok                                          |
| Enfoque de diseño | Domain-Driven Design (DDD)                      |
