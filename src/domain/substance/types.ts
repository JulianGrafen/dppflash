// src/domain/substance/types.ts
import type { Timestamps, UUID } from '../shared/types';

export interface Substance extends Timestamps {
  readonly id:          UUID;
  readonly company_id:  UUID;
  readonly qr_uuid:     UUID; // öffentlicher QR-Identifikator
  location_id:          UUID | null;
  created_by:           UUID | null;

  // Inhaltliche Pflichtfelder
  name:         string;
  manufacturer: string;

  // Optionale Felder
  cas_number:   string | null; // z.B. "67-64-1" (Aceton)
  sdb_url:      string | null; // Sicherheitsdatenblatt
  ba_url:       string | null; // Betriebsanweisung
  last_review:  string | null; // ISO 8601 date ("YYYY-MM-DD")
}

export type CreateSubstanceInput = Omit<
  Substance,
  'id' | 'qr_uuid' | 'created_at' | 'updated_at'
>;

export type UpdateSubstanceInput = Partial<
  Pick<Substance, 'name' | 'manufacturer' | 'cas_number' | 'sdb_url' | 'ba_url' | 'last_review' | 'location_id'>
>;

// Reduzierte View für QR-Scan (kein company_id-Leak an Anonymous)
export interface SubstancePublicView {
  readonly qr_uuid:       UUID;
  name:                   string;
  manufacturer:           string;
  cas_number:             string | null;
  sdb_url:                string | null;
  ba_url:                 string | null;
  last_review:            string | null;
  location_name:          string | null;
}
