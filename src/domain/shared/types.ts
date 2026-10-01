// src/domain/shared/types.ts
// Basis-Typen, die von allen Domain-Modulen geteilt werden.
// Kein Framework-Import — reines TypeScript.

export type UUID = string & { readonly _brand: 'UUID' };

export type Timestamps = {
  readonly created_at: string; // ISO 8601
  readonly updated_at: string;
};

// Hilfstyp: alles außer readonly timestamps (für CREATE-Operationen)
export type WithoutTimestamps<T> = Omit<T, keyof Timestamps>;

// Hilfstyp: Partial ohne id + timestamps (für UPDATE-Operationen)
export type UpdatePayload<T> = Partial<Omit<T, 'id' | keyof Timestamps>>;
