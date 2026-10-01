// src/infrastructure/repositories/location.repository.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types';
import {
  LocationSchema,
  type LocationDTO,
  type CreateLocationDTO,
  type UpdateLocationDTO,
} from '@/domain/location/schemas';

type DB = SupabaseClient<Database>;

export async function getLocationsByCompany(
  db: DB,
  companyId: string,
): Promise<LocationDTO[]> {
  const { data, error } = await db
    .from('locations')
    .select('*')
    .eq('company_id', companyId)
    .order('name');

  if (error) throw new Error(`getLocationsByCompany: ${error.message}`);

  return LocationSchema.array().parse(data);
}

export async function createLocation(
  db: DB,
  input: CreateLocationDTO,
): Promise<LocationDTO> {
  const { data, error } = await db
    .from('locations')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`createLocation: ${error.message}`);

  return LocationSchema.parse(data);
}

export async function updateLocation(
  db: DB,
  id: string,
  input: UpdateLocationDTO,
): Promise<LocationDTO> {
  const { data, error } = await db
    .from('locations')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateLocation: ${error.message}`);

  return LocationSchema.parse(data);
}

export async function deleteLocation(db: DB, id: string): Promise<void> {
  const { error } = await db.from('locations').delete().eq('id', id);
  if (error) throw new Error(`deleteLocation: ${error.message}`);
}
