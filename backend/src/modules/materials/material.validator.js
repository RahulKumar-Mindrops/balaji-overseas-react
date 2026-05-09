import { z } from 'zod'
import { ALLOWED_UNITS } from '../../constants.js'

const unitSchema = z.enum(ALLOWED_UNITS)

export const createMaterialSchema = z.object({
  material_code: z
    .string()
    .min(1)
    .max(50)
    .transform((s) => s.trim().toUpperCase()),
  material_name: z.string().min(1).max(200).trim(),
  category: z.string().max(100).optional().nullable(),
  unit: unitSchema,
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
})

export const updateMaterialSchema = z
  .object({
    material_code: z.string().min(1).max(50).optional(),
    material_name: z.string().min(1).max(200).optional(),
    category: z.string().max(100).optional().nullable(),
    unit: unitSchema.optional(),
    description: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'At least one field required' })
