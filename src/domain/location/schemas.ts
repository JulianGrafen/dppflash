// src/domain/location/schemas.ts
import { z } from 'zod';

export const LocationSchema = z.object({
  id:          z.string().uuid(),
  company_id:  z.string().uuid(),
  name:        z.string().min(1).max(200),
  description: z.string().nullable(),
  created_at:  z.string().datetime(),
  updated_at:  z.string().datetime(),
});

export const CreateLocationSchema = LocationSchema.pick({
  company_id:  true,
  name:        true,
  description: true,
});

export const UpdateLocationSchema = LocationSchema
  .pick({ name: true, description: true })
  .partial();

export type LocationDTO        = z.infer<typeof LocationSchema>;
export type CreateLocationDTO  = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationDTO  = z.infer<typeof UpdateLocationSchema>;
