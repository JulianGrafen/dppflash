// src/domain/profile/types.ts
import type { Timestamps, UUID } from '../shared/types';

export type UserRole = 'admin' | 'viewer';

export interface Profile extends Timestamps {
  readonly id:         UUID; // = auth.users.id
  readonly company_id: UUID;
  role:                UserRole;
  full_name:           string | null;
}

export type CreateProfileInput = Pick<Profile, 'id' | 'company_id' | 'role' | 'full_name'>;
export type UpdateProfileInput = Partial<Pick<Profile, 'role' | 'full_name'>>;
