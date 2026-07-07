---
version: alpha
name: AutoFinance
description: >-
  Design system for AutoFinance — the vehicle-credit quotation tool that
  dealership sales advisors use to build French-method payment schedules with
  the Compra Inteligente (cuotón) modality and SBS transparency indicators.
  Tokens below are the light theme; dark-theme overrides are documented in the
  Colors section. Values are taken verbatim from src/styles.css (the source of
  truth) and are expressed in oklch, as the codebase does.
colors:
  background: oklch(1 0 0)
  foreground: oklch(0.129 0.042 264.695)
  card: oklch(1 0 0)
  card-foreground: oklch(0.129 0.042 264.695)
  popover: oklch(1 0 0)
  popover-foreground: oklch(0.129 0.042 264.695)
  primary: oklch(0.5 0.105 200)
  primary-foreground: oklch(0.985 0.005 200)
  secondary: oklch(0.968 0.007 247.896)
  secondary-foreground: oklch(0.208 0.042 265.755)
  muted: oklch(0.968 0.007 247.896)
  muted-foreground: oklch(0.554 0.046 257.417)
  accent: oklch(0.968 0.007 247.896)
  accent-foreground: oklch(0.208 0.042 265.755)
  destructive: oklch(0.577 0.245 27.325)
  success: oklch(0.52 0.13 155)
  success-foreground: oklch(0.985 0.01 155)
  warning: oklch(0.72 0.15 75)
  warning-foreground: oklch(0.27 0.05 75)
  border: oklch(0.929 0.013 255.508)
  input: oklch(0.929 0.013 255.508)
  ring: oklch(0.5 0.105 200)
typography:
  headline-lg:
    fontFamily: '{typography.fontFamilies.sans}'
    fontSize: 1.5rem
    fontWeight: 500
    letterSpacing: -0.025em
  body-md:
    fontFamily: '{typography.fontFamilies.sans}'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: '{typography.fontFamilies.sans}'
    fontSize: 0.875rem
    fontWeight: 400
  label-md:
    fontFamily: '{typography.fontFamilies.sans}'
    fontSize: 0.875rem
    fontWeight: 500
  figure-md:
    fontFamily: '{typography.fontFamilies.mono}'
    fontSize: 0.875rem
    fontWeight: 400
    fontFeature: 'tnum'
  fontFamilies:
    sans: "'Geist Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    mono: "'Geist Mono Variable', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
rounded:
  none: 0rem
  sm: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  full: 9999px
spacing:
  base: 0.25rem
  page-padding: 1.5rem
  content-max-width: 48rem
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    rounded: '{rounded.md}'
    typography: '{typography.label-md}'
  card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.card-foreground}'
    rounded: '{rounded.lg}'
  indicator-positive:
    backgroundColor: color-mix(in oklch, {colors.success} 10%, transparent)
    textColor: '{colors.success}'
    rounded: '{rounded.full}'
    typography: '{typography.figure-md}'
  indicator-negative:
    backgroundColor: color-mix(in oklch, {colors.destructive} 10%, transparent)
    textColor: '{colors.destructive}'
    rounded: '{rounded.full}'
    typography: '{typography.figure-md}'
---

# AutoFinance — Design System

## Overview

AutoFinance is the **vehicle-credit quotation tool used by dealership sales
advisors** in Peru. Its purpose, taken from the live UI, is to be a
*"Plataforma de simulación de crédito vehicular para concesionarias"* — an
instrument for building French-method payment schedules under the **Compra
Inteligente (cuotón)** modality, applying grace periods and costs, and surfacing
the **SBS transparency indicators (TCEA, VAN, TIR) from the debtor's
perspective**.

The personality follows from that job: **calm, precise, financial-grade**. This
is a professional back-office instrument operated by an advisor in front of a
buyer, not a consumer marketing app. The interface should read as **trustworthy
and exact** — generous whitespace, restrained color, and figures that line up.
Numbers are the product. Every monetary amount and rate is a result the advisor
will defend to a customer, so the visual system gives **numeric output more
typographic care than decorative chrome**.

The product is **bilingual by convention**: the UI copy is **Spanish**
(Peruvian credit vocabulary — *cuota*, *cuotón*, *gracia*, *desgravamen*),
while code identifiers and these design tokens are **English**. The interface
ships **light and dark themes** (the dark theme toggles via a `.dark` class on
the document root) and must meet **WCAG AA** contrast and full AXE
accessibility, as mandated by the project's engineering guidelines.

The brand mark is a pair of stacked upward chevrons in teal — a quiet "growth /
upward" signal — locked up with the wordmark **Auto** (in the foreground color)
+ **Finance** (in the primary teal). Logo assets live in `public/`:
`autofinance-logo-light.{png,webp}` and `autofinance-logo-dark.{png,webp}`.

## Colors

The palette is **slate neutrals + a single deep teal brand color**, with three
semantic colors that carry real domain meaning in this product. All values are
the exact `oklch` tokens defined in `src/styles.css`; descriptive names below
are for prose only.

### Brand & neutrals (light theme)

| Token | Value | Role |
| --- | --- | --- |
| `primary` — *Deep Teal* | `oklch(0.5 0.105 200)` | Brand color. Primary buttons, links, focus `ring`, active nav, the "Finance" half of the wordmark. |
| `primary-foreground` | `oklch(0.985 0.005 200)` | Text/icons on primary fills. |
| `background` | `oklch(1 0 0)` | App canvas (white). |
| `foreground` — *Slate Ink* | `oklch(0.129 0.042 264.695)` | Default body text; the "Auto" half of the wordmark. |
| `card` / `popover` | `oklch(1 0 0)` | Surface for grouped content (schedules, indicator panels). |
| `muted` / `secondary` / `accent` | `oklch(0.968 0.007 247.896)` | Subtle slate fills for secondary buttons, zebra rows, chips. |
| `muted-foreground` | `oklch(0.554 0.046 257.417)` | Secondary/supporting text (taglines, captions, table sub-labels). |
| `border` / `input` | `oklch(0.929 0.013 255.508)` | Hairlines, dividers, field outlines. |
| `ring` | `oklch(0.5 0.105 200)` | Focus ring (equals primary). |

### Semantic colors (domain-bound)

These are not generic status colors — in AutoFinance each maps to a specific
financial concept, as already used on the home view:

| Token | Value | Domain meaning |
| --- | --- | --- |
| `success` — *Emerald* | `oklch(0.52 0.13 155)` | **VAN positivo** (financing favorable vs. the debtor's COK). Example chip: `VAN +4,436.18`. |
| `destructive` — *Red* | `oklch(0.577 0.245 27.325)` | **VAN negativo** and destructive actions (delete). Example chip: `VAN −9,420.70`. |
| `warning` — *Amber* | `oklch(0.72 0.15 75)` | **Liquidación del cuotón** (the balloon settlement row) and cautionary states. |

`success-foreground` (`oklch(0.985 0.01 155)`) and `warning-foreground`
(`oklch(0.27 0.05 75)`) are the on-color text tokens. Positive/negative
indicators are rendered as **tinted chips** — the semantic color at ~10% over
transparent for the fill, full strength for the text — so a screenful of
results stays calm rather than alarming.

### Dark theme overrides

The dark theme (`:root.dark`) keeps the same token names with these key shifts:
`background` → `oklch(0.129 0.042 264.695)`, `foreground` →
`oklch(0.984 0.003 247.858)`, `card`/`popover` → `oklch(0.208 0.042 265.755)`,
`primary` → **lighter aqua teal** `oklch(0.7 0.12 200)` with a dark
`primary-foreground` `oklch(0.2 0.04 200)`. Semantics brighten to hold contrast:
`success` `oklch(0.7 0.14 158)`, `destructive` `oklch(0.704 0.191 22.216)`,
`warning` `oklch(0.8 0.14 75)`. Borders/inputs become translucent white
(`oklch(1 0 0 / 10%)` and `/ 15%`). Use the logo's dark variant on dark
surfaces.

## Typography

Two typefaces, both variable, wired in `angular.json`:

- **Geist Variable** (`--font-sans`) — all UI text.
- **Geist Mono Variable** (`--font-mono`) — **all figures**: amounts, rates,
  percentages, schedule cells, indicator values.

The split is deliberate and load-bearing: prose is proportional Geist; anything
numeric is mono with **tabular figures** (`tabular-nums` / `tnum`) so columns of
*cuotas*, *saldos*, and rates align vertically and digits don't jitter as
values update.

| Level | Family | Size / Weight | Usage (observed) |
| --- | --- | --- | --- |
| `headline-lg` | sans | 1.5rem / 500, tracking `-0.025em` | Page title (`AutoFinance`, "Acerca de AutoFinance"). |
| `body-md` | sans | 1rem / 400, line-height 1.5 | Default paragraph copy. |
| `body-sm` | sans | 0.875rem / 400 | Dense table text, helper copy. |
| `label-md` | sans | 0.875rem / 500 | Buttons, nav links, field labels, chip labels. |
| `caption` | sans | 0.875rem / 400, `muted-foreground` | Taglines and secondary descriptions. |
| `figure-md` | **mono** | 0.875rem / 400, `tnum` | Inline monetary/rate figures (e.g. `+4,436.18`). |
| `figure-table` | **mono** | 0.875rem / 400, `tnum`, right-aligned | Numeric cells of the cronograma. |

Keep the scale shallow and quiet — a single prominent headline per view, with
hierarchy carried mostly by weight, color (`foreground` vs `muted-foreground`),
and the sans/mono contrast rather than many sizes.

## Layout

A **centered, single-column, max-width** model — not a dashboard grid. Observed
container pattern: `mx-auto max-w-3xl space-y-8 p-6` (a ~`48rem` content column,
`1.5rem` page padding, `2rem` vertical rhythm between sections).

- **Spacing scale**: the Tailwind 4 default 4px base (`0.25rem` unit). Common
  steps in use: `gap-3` (0.75rem) between controls, `space-y-3` within a
  section, `space-y-8` between sections.
- **Containment**: group related output (a schedule, an indicators panel) into
  `card` surfaces; let the page background separate them. Forms and result
  tables share the same centered column so the advisor reads top-to-bottom:
  configuration → cronograma → indicadores.
- **Header / footer**: a flex app header (`AutoFinance` title at left, primary
  nav pushed right via `margin-left: auto`) over a `router-outlet`, with a
  full-width footer line (*"Copyright © 2026 AutoFinance…"*).
- **Tables are first-class.** The cronograma can run 36–60+ rows; design for
  long, scannable, right-aligned numeric tables with a sticky header rather than
  card grids.

## Elevation & Depth

The system is **flat and border-first**, inheriting the Spartan/Helm aesthetic.
Hierarchy comes from **hairline borders (`border`) and surface/background
contrast**, not heavy shadows. Every element applies the `border` color and a
`ring/50` outline by default (`* { @apply border-border outline-ring/50 }`).

- **Cards / popovers**: separate from the canvas by a 1px `border` and (in light
  mode) a same-as-background or near-white fill; in dark mode the `card` surface
  is a lighter slate than the `background`.
- **Shadows**: reserved and subtle — only for genuinely floating layers
  (popover, dropdown, dialog) provided by the CDK overlay. Avoid decorative
  drop shadows on inline cards.
- **Focus**: a visible `ring` (primary teal) is the primary depth/affordance cue
  for keyboard users and must never be removed.

## Shapes

A **soft, consistent radius** anchored on `--radius: 0.5rem`.

| Scale | Value | Applied to |
| --- | --- | --- |
| `rounded.sm` | 0.25rem | Inner/nested elements, small insets. |
| `rounded.md` | 0.375rem | Buttons, inputs, default controls. |
| `rounded.lg` | 0.5rem | Cards, popovers, larger containers (the base `--radius`). |
| `rounded.full` | 9999px | Indicator chips/pills (VAN, liquidación del cuotón). |

Corners are uniformly rounded — no mixing sharp and round on the same element.
Pills are reserved for status/indicator chips; rectangular `md` radius is the
default for everything interactive.

## Components

Built on **@spartan-ng/helm** primitives (the `shared/presentation/ui` library)
with Class Variance Authority variants. Style guidance per atom:

- **Buttons** (`hlmBtn`). Variants: `default` (primary teal fill — the main
  action, e.g. *"Generar simulación"*), `outline` (bordered, transparent — e.g.
  *"Guardar"*), `secondary` (muted slate fill — e.g. *"Reabrir"*), `ghost`
  (no chrome, for low-emphasis), `destructive` (red, delete), `link` (inline
  text action). Sizes: `xs, sm, default, lg`, plus icon-only `icon, icon-xs,
  icon-sm, icon-lg`. One primary action per view; everything else outline/
  secondary/ghost. Label typography is `label-md`.
- **Cards** (`hlm-card` with `-header / -title / -description / -content /
  -footer / -action`). The container for a cronograma, an indicators panel, or
  a form group. `rounded.lg`, 1px border, no decorative shadow.
- **Indicator chips / pills**. The signature component. A rounded-full pill with
  a tinted semantic background and a leading glyph: `↑` + green figure for VAN
  positivo, `↓` + red figure for VAN negativo, `●` + amber label for
  *Liquidación del cuotón*. The numeric portion is always mono + `tabular-nums`.
- **Navigation links**. `label-md`; the active route uses the primary teal
  (`routerLinkActive="active"`).
- **Input fields** (forthcoming, Signal Forms). `md` radius, `input` border,
  `ring` focus. Validation messages are Spanish, sourced from the shared
  `BaseForm` catalogue (e.g. *"El campo {x} es obligatorio."*). Errors use the
  `destructive` color on the field and message.
- **Data tables (cronograma)**. Hairline row dividers (`border`), optional muted
  zebra rows (`muted`), right-aligned mono numeric columns, sticky header row.
  The balloon-settlement row may be marked with the `warning` accent.
- **Footer**. Single muted line, full width, `muted-foreground`.

## Do's and Don'ts

**Do**
- Render **every** amount, rate, and percentage in **Geist Mono with
  `tabular-nums`** so figures align and stay legible.
- Use the semantic colors for their **domain meaning**: green = VAN positivo,
  red = VAN negativo / destructive, amber = liquidación del cuotón / caution.
- Pull copy from the product, in **Spanish** (e.g. *"Generar simulación"*,
  *"Plataforma de simulación de crédito vehicular para concesionarias"*).
- Keep one centered `max-w-3xl` column; lead each view with a single
  `headline-lg` title and a `muted-foreground` tagline.
- Reference colors through the semantic CSS variables / tokens
  (`bg-primary`, `text-success`, `border-border`) so light/dark themes both work.
- Use `NgOptimizedImage` for the logo and serve the theme-appropriate variant
  (light logo on light, dark logo on dark).
- Maintain a visible focus `ring` and WCAG AA contrast in both themes.

**Don't**
- Don't introduce new hues. The palette is slate + one teal + three semantics.
  No additional brand colors, gradients, or accent rainbows.
- Don't put monetary or rate figures in the proportional sans font, and don't
  mix tabular and non-tabular figures in the same column.
- Don't lean on drop shadows for inline hierarchy — use borders and surface
  contrast; reserve shadow for true overlays.
- Don't hard-code hex/oklch values in components; always go through tokens so
  dark mode and theming hold.
- Don't color a VAN figure by anything other than its sign, and don't use red
  purely decoratively (it reads as a negative result).
- Don't surface raw backend `detail` strings or internal error text; map the
  RFC 9457 `code` to Spanish copy.
- Don't crowd the layout — preserve the `space-y-8` section rhythm; financial
  density should come from well-aligned tables, not cramped chrome.
