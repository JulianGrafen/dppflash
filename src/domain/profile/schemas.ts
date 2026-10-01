// src/domain/profile/schemas.ts
import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'viewer']);

export const ProfileSchema = z.object({
  id:         z.string().uuid(),
  company_id: z.string().uuid(),
  role:       UserRoleSchema,
  full_name:  z.string().max(200).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateProfileSchema = ProfileSchema.pick({
  id:        true,
  company_id: true,
  role:       true,
  full_name:  true,
});

export const UpdateProfileSchema = ProfileSchema
  .pick({ role: true, full_name: true })
  .partial();

export type ProfileDTO        = z.infer<typeof ProfileSchema>;
export type CreateProfileDTO  = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileDTO  = z.infer<typeof UpdateProfileSchema>;
