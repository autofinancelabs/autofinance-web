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

/** The preset label for a given day count, or null if it doesn't match a common preset. */
export function capitalizationLabel(days: number | null): string | null {
  if (days === null) {
    return null;
  }
  return capitalizationPresets.find(preset => preset.days === days)?.label ?? null;
}
