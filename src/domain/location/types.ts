// src/domain/location/types.ts
import type { Timestamps, UUID } from '../shared/types';

export interface Location extends Timestamps {
  readonly id:         UUID;
  readonly company_id: UUID;
  name:                string;
  description:         string | null;
}

export type CreateLocationInput = Pick<Location, 'company_id' | 'name' | 'description'>;
export type UpdateLocationInput = Partial<Pick<Location, 'name' | 'description'>>;
