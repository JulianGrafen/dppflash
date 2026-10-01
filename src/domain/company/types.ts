// src/domain/company/types.ts
import type { Timestamps, UUID } from '../shared/types';

export type PlanStatus = 'free' | 'pro' | 'enterprise';

export interface Company extends Timestamps {
  readonly id: UUID;
  name: string;
  plan_status: PlanStatus;
}

export type CreateCompanyInput = Pick<Company, 'name' | 'plan_status'>;
export type UpdateCompanyInput = Partial<Pick<Company, 'name' | 'plan_status'>>;
