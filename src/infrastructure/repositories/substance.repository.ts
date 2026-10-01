// src/infrastructure/repositories/substance.repository.ts
// Repository-Pattern mit Dependency Injection:
// Der Supabase-Client wird als Parameter übergeben – kein globaler Singleton.
// Dadurch lässt sich der Client in Tests durch einen Mock ersetzen.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types';
import {
  SubstanceSchema,
  SubstancePublicViewSchema,
  type SubstanceDTO,
  type CreateSubstanceDTO,
  type UpdateSubstanceDTO,
  type SubstancePublicViewDTO,
} from '@/domain/substance/schemas';

type DB = SupabaseClient<Database>;

// ---------------------------------------------------------------------------
// Lesen
// ---------------------------------------------------------------------------

/** Alle Gefahrstoffe einer Company – RLS stellt Tenant-Isolation sicher. */
export async function getSubstancesByCompany(
  db: DB,
  companyId: string,
): Promise<SubstanceDTO[]> {
  const { data, error } = await db
    .from('substances')
    .select('*')
    .eq('company_id', companyId)
    .order('name');

  if (error) throw new Error(`getSubstancesByCompany: ${error.message}`);

  return SubstanceSchema.array().parse(data);
}

/** Einzelner Gefahrstoff per ID. */
export async function getSubstanceById(
  db: DB,
  id: string,
): Promise<SubstanceDTO | null> {
  const { data, error } = await db
    .from('substances')
    .select('*')
    .eq('id', id)
    .single();

  if (error?.code === 'PGRST116') return null; // not found
  if (error) throw new Error(`getSubstanceById: ${error.message}`);

  return SubstanceSchema.parse(data);
}

/** Öffentlicher QR-Lookup – kein Auth erforderlich, kein company_id-Leak. */
export async function getSubstanceByQrUuid(
  db: DB,
  qrUuid: string,
): Promise<SubstancePublicViewDTO | null> {
  const { data, error } = await db
    .from('substance_qr_public')
    .select('*')
    .eq('qr_uuid', qrUuid)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw new Error(`getSubstanceByQrUuid: ${error.message}`);

  return SubstancePublicViewSchema.parse(data);
}

// ---------------------------------------------------------------------------
// Schreiben
// ---------------------------------------------------------------------------

export async function createSubstance(
  db: DB,
  input: CreateSubstanceDTO,
): Promise<SubstanceDTO> {
  const { data, error } = await db
    .from('substances')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`createSubstance: ${error.message}`);

  return SubstanceSchema.parse(data);
}

export async function updateSubstance(
  db: DB,
  id: string,
  input: UpdateSubstanceDTO,
): Promise<SubstanceDTO> {
  const { data, error } = await db
    .from('substances')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateSubstance: ${error.message}`);

  return SubstanceSchema.parse(data);
}

export async function deleteSubstance(db: DB, id: string): Promise<void> {
  const { error } = await db.from('substances').delete().eq('id', id);
  if (error) throw new Error(`deleteSubstance: ${error.message}`);
}
