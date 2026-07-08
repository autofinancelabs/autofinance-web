<h1 align="center">AutoFinance Web</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white" alt="Angular 22">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/three.js-000000?logo=threedotjs&logoColor=white" alt="three.js">
  <img src="https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white" alt="pnpm">
  <img src="https://img.shields.io/badge/architecture-DDD-blue" alt="Architecture: DDD">
  <img src="https://img.shields.io/badge/status-in%20progress-yellow" alt="Status: in progress">
</p>

Frontend (advisor-facing web app) for building and managing **vehicle-credit payment plans in Peru**.
It is the UI for the [AutoFinance API](../autofinance-api): dealership advisors register **clients**
and **vehicle offers**, then generate **credit quotations** (French amortization, *vencido ordinario*
30/360, under the **"Compra Inteligente" balloon** / *cuotón* modality) and read back the full payment
schedule together with the **SBS transparency indicators** and **VAN/TIR (NPV/IRR) from the debtor's
perspective**. **Multi-tenant**: each dealership signs in to its own account and only sees its own data.

## Features

- **Auth & multi-tenancy**: sign-in / dealership registration; the JWT carries the tenant
  (`dealershipId`), and a route guard protects the app shell.
- **Clients**: register and edit clients (document, name, contact info).
- **Vehicle offers**: register the financed vehicle and its sale price, with an optional, customizable
  **low-poly 3D model** (PS1/PS2 style, three.js) — 7 silhouettes, free hex colors, cosmetic options and
  a license plate — shown on the offer detail, list thumbnails and the quotation header.
- **Credit quotations**: configure the operation (rate, term, initial/balloon, grace, costs) and view
  the generated schedule, totals and the SBS indicator battery (TCEA, VAN, TIR, …).
- **Dashboard & help**: entry points, tenant-wide quotations list, and an in-app guide.
- **Design system**: calm, flat, "financial-grade" UI (light + dark), figures in a monospaced font with
  tabular numbers. See [`DESIGN.md`](DESIGN.md).

> Scope: this is the **frontend**. All financial math, persistence and tenancy live in the API. Anything
> out of scope there (other amortization methods, FX, real payments, scoring, billing) is out of scope
> here too.

## Stack

Angular 22 (**zoneless**, standalone components, **signals**, **Signal Forms**) · Tailwind CSS v4 ·
Spartan/Helm UI (`nova`) · Geist / Geist Mono · three.js (lazy-loaded 3D viewer) · TypeScript · Vitest ·
pnpm · Domain-Driven Design (bounded contexts — `iam`, `clients`, `vehicle-offers`, `credit-simulation`,
`shared` — each in domain / application / infrastructure / presentation layers).

## Requirements

- Node `^24.15` (an `.nvmrc` pins `24.15.0`; run `nvm use`)
- pnpm `>= 11.5` (enforced — `npm`/`yarn` are blocked)
- A running [AutoFinance API](../autofinance-api) for live data

## Getting started

```bash
pnpm install        # install dependencies
pnpm start          # dev server on http://localhost:4242/ (ng serve)
pnpm test           # unit tests (Vitest via the Angular builder)
pnpm build          # production build into dist/
```

## Documentation

| File / folder                              | Contents                                                              |
|--------------------------------------------|-----------------------------------------------------------------------|
| [`DESIGN.md`](DESIGN.md)                   | Design system: tokens, typography, components, do's and don'ts.       |
| [`NEXT-STEPS.md`](NEXT-STEPS.md)           | Roadmap and pending work.                                             |
| [`docs/product/`](docs/product/)           | What it is and for whom: brief, ubiquitous language, backlog.         |
| [`docs/ddd/`](docs/ddd/)                   | Domain model (DDD): bounded contexts, discovery, tactical model.      |
| [`docs/architecture/`](docs/architecture/) | Architecture notes (e.g. API error codes consumed by the client).    |
| [`docs/report/`](docs/report/)             | Academic-report material (formulas, algorithm, test datasets).        |
| [`AGENTS.md`](AGENTS.md)                   | Guide for AI agents working in the repository.                        |

## Status

**In progress**: the core advisor flows (auth, clients, vehicle offers, quotations) are implemented
against the API; some contexts are still being rounded out (see [`NEXT-STEPS.md`](NEXT-STEPS.md)).

## Academic context

Deliverable for the **Finanzas e Ingeniería Económica** course (UPC). This app is the UI half of the
system; the calculation engine and persistence live in the [AutoFinance API](../autofinance-api).
