// src/domain/company/schemas.ts
// Zod-First: Runtime-Validierung aller Company-Daten.
// Importiert KEINE Framework-Abhängigkeiten.

import { z } from 'zod';

export const PlanStatusSchema = z.enum(['free', 'pro', 'enterprise']);

export const CompanySchema = z.object({
  id:          z.string().uuid(),
  name:        z.string().min(2).max(200),
  plan_status: PlanStatusSchema,
  created_at:  z.string().datetime(),
  updated_at:  z.string().datetime(),
});

export const CreateCompanySchema = CompanySchema.pick({
  name:        true,
  plan_status: true,
});

export const UpdateCompanySchema = CreateCompanySchema.partial();

// Abgeleitete TypeScript-Typen aus den Schemas (Single Source of Truth)
export type CompanyDTO         = z.infer<typeof CompanySchema>;
export type CreateCompanyDTO   = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyDTO   = z.infer<typeof UpdateCompanySchema>;
