// src/infrastructure/repositories/profile.repository.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types';
import {
  ProfileSchema,
  type ProfileDTO,
  type UpdateProfileDTO,
} from '@/domain/profile/schemas';

type DB = SupabaseClient<Database>;

export async function getProfileById(
  db: DB,
  userId: string,
): Promise<ProfileDTO | null> {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw new Error(`getProfileById: ${error.message}`);

  return ProfileSchema.parse(data);
}

export async function getProfilesByCompany(
  db: DB,
  companyId: string,
): Promise<ProfileDTO[]> {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('company_id', companyId)
    .order('full_name');

  if (error) throw new Error(`getProfilesByCompany: ${error.message}`);

  return ProfileSchema.array().parse(data);
}

export async function updateProfile(
  db: DB,
  userId: string,
  input: UpdateProfileDTO,
): Promise<ProfileDTO> {
  const { data, error } = await db
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`updateProfile: ${error.message}`);

  return ProfileSchema.parse(data);
}
