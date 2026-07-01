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
  {label: 'Semestral', days: 180},
  {label: 'Anual', days: 360},
];

/**
 * Common presets for the **rate period** (the period a rate value is quoted over). "Annual" is
 * offered separately as the default (empty) choice, so it is not repeated here. Any positive integer
 * is valid via the "Otro (días)" option.
 */
export const ratePeriodPresets: readonly CapitalizationPreset[] = [
  {label: 'Mensual', days: 30},
  {label: 'Trimestral', days: 90},
  {label: 'Semestral', days: 180},
];

/** The preset label for a given day count, or null if it doesn't match a common preset. */
export function capitalizationLabel(days: number | null): string | null {
  if (days === null) {
    return null;
  }
  return capitalizationPresets.find(preset => preset.days === days)?.label ?? null;
}
