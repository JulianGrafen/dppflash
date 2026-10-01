// src/domain/substance/schemas.ts
import { z } from 'zod';

// CAS-Nummer: optionales Format "[digits]-[2digits]-[1digit]"
const CasNumberSchema = z
  .string()
  .regex(/^\d{2,7}-\d{2}-\d$/, 'Ungültiges CAS-Format (z.B. 67-64-1)')
  .nullable();

const HttpUrlSchema = z
  .string()
  .url()
  .startsWith('https://', 'Nur HTTPS-URLs erlaubt')
  .nullable();

export const SubstanceSchema = z.object({
  id:           z.string().uuid(),
  company_id:   z.string().uuid(),
  qr_uuid:      z.string().uuid(),
  location_id:  z.string().uuid().nullable(),
  created_by:   z.string().uuid().nullable(),

  name:         z.string().min(1).max(300),
  manufacturer: z.string().min(1).max(200),
  cas_number:   CasNumberSchema,
  sdb_url:      HttpUrlSchema,
  ba_url:       HttpUrlSchema,
  last_review:  z.string().date().nullable(), // "YYYY-MM-DD"

  created_at:   z.string().datetime(),
  updated_at:   z.string().datetime(),
});

export const CreateSubstanceSchema = SubstanceSchema.omit({
  id:         true,
  qr_uuid:    true,
  created_at: true,
  updated_at: true,
});

export const UpdateSubstanceSchema = SubstanceSchema
  .pick({
    name: true, manufacturer: true, cas_number: true,
    sdb_url: true, ba_url: true, last_review: true, location_id: true,
  })
  .partial();

export const SubstancePublicViewSchema = z.object({
  qr_uuid:       z.string().uuid(),
  name:          z.string(),
  manufacturer:  z.string(),
  cas_number:    CasNumberSchema,
  sdb_url:       HttpUrlSchema,
  ba_url:        HttpUrlSchema,
  last_review:   z.string().date().nullable(),
  location_name: z.string().nullable(),
});

export type SubstanceDTO            = z.infer<typeof SubstanceSchema>;
export type CreateSubstanceDTO      = z.infer<typeof CreateSubstanceSchema>;
export type UpdateSubstanceDTO      = z.infer<typeof UpdateSubstanceSchema>;
export type SubstancePublicViewDTO  = z.infer<typeof SubstancePublicViewSchema>;
