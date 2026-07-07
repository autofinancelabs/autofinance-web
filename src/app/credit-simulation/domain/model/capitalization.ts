/**
 * Capitalization frequency for a nominal rate, expressed as a **number of days** (30/360
 * convention) so any frequency is supported (the backend generalized it from a fixed enum to days).
 * These are the common presets for the UI; any positive integer is valid.
 */
export interface CapitalizationPreset {
  readonly label: string;
  readonly days: number;
}

export const capitalizationPresets: readonly CapitalizationPreset[] = [
  {label: 'Diaria', days: 1},
  {label: 'Mensual', days: 30},
  {label: 'Trimestral', days: 90},
  {label: 'Cuatrimestral', days: 120},
  {label: 'Semestral', days: 180},
  {label: 'Anual', days: 360},
];

/**
 * A rate-period preset. Its abbreviation depends on the rate type (nominal vs effective): e.g. a
 * monthly period is `TNM` for a nominal rate and `TEM` for an effective one. "Annual" (TNA/TEA) is
 * offered separately as the default (empty) choice, so it is not repeated here.
 */
export interface RatePeriodPreset {
  readonly days: number;
  readonly name: string;
  readonly nominalAbbr: string;
  readonly effectiveAbbr: string;
}

/**
 * Common presets for the **rate period** (the period a rate value is quoted over), in ascending
 * order. Any positive integer is valid via the "Otro (días)" option.
 */
export const ratePeriodPresets: readonly RatePeriodPreset[] = [
  {days: 30, name: 'Mensual', nominalAbbr: 'TNM', effectiveAbbr: 'TEM'},
  {days: 90, name: 'Trimestral', nominalAbbr: 'TNT', effectiveAbbr: 'TET'},
  {days: 120, name: 'Cuatrimestral', nominalAbbr: 'TNC', effectiveAbbr: 'TEC'},
  {days: 180, name: 'Semestral', nominalAbbr: 'TNS', effectiveAbbr: 'TES'},
];

/** The preset label for a given day count, or null if it doesn't match a common preset. */
export function capitalizationLabel(days: number | null): string | null {
  if (days === null) {
    return null;
  }
  return capitalizationPresets.find(preset => preset.days === days)?.label ?? null;
}
