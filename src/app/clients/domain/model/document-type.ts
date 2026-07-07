/**
 * Identity document type for a Peruvian client: national ID (DNI), foreigner card
 * (CE) or passport. Mirrors the backend `DocumentType` enum; the document (type +
 * number) identifies the client within a dealership and is immutable once set.
 *
 * Modeled as a const object + derived union (no enum) to match the codebase's
 * type-first style (see `shared/infrastructure/api-error-code.ts`).
 */
export const DocumentType = {
  DNI: 'DNI',
  CE: 'CE',
  PASAPORTE: 'PASAPORTE',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

/** All document types, in display order (for selects and summaries). */
export const documentTypes: readonly DocumentType[] = [
  DocumentType.DNI,
  DocumentType.CE,
  DocumentType.PASAPORTE,
];
