/**
 * Base class for form components in the presentation layer.
 *
 * Provides Spanish validation messages keyed by the error `kind` produced by
 * Signal Forms validators (`@angular/forms/signals`). Client-side validation is
 * a UX aid only: the backend remains the source of truth and validates again.
 */
export abstract class BaseForm {
  /** Maps a Signal Forms validation error kind to a Spanish message factory. */
  private readonly messages: Record<string, (field: string) => string> = {
    required: field => `El campo ${field} es obligatorio.`,
    email: field => `El campo ${field} no es un correo electrónico válido.`,
    min: field => `El valor de ${field} es demasiado bajo.`,
    max: field => `El valor de ${field} es demasiado alto.`,
    minLength: field => `El campo ${field} es demasiado corto.`,
    maxLength: field => `El campo ${field} es demasiado largo.`,
    pattern: field => `El formato del campo ${field} no es válido.`,
  };

  /**
   * Returns the Spanish validation message for a given error kind and field label.
   * @param fieldLabel - Human-readable field name shown to the user.
   * @param errorKind - The `kind` of the Signal Forms validation error.
   * @returns The localized error message.
   * @protected
   */
  protected messageFor(fieldLabel: string, errorKind: string): string {
    const factory = this.messages[errorKind];
    return factory ? factory(fieldLabel) : `El campo ${fieldLabel} no es válido.`;
  }
}
