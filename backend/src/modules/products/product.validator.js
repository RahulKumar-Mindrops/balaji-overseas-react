import { z } from 'zod'
import { ALLOWED_UNITS, BOM_TYPES, PACKING_TYPES, ITEM_CODE_REGEX } from '../../constants.js'
import { bomLineSchema } from '../bom/bom.validator.js'

const packingLineSchema = z
  .object({
    packing_type: z.enum(PACKING_TYPES),
    material_name: z.string().max(200).optional().nullable(),
    quantity: z.number().nonnegative().optional().nullable(),
    unit: z.enum(ALLOWED_UNITS).optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .superRefine((row, ctx) => {
    const hasMat = !!(row.material_name && row.material_name.trim())
    if (hasMat) {
      if (row.quantity == null || row.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'quantity must be > 0 when material_name is set',
          path: ['quantity'],
        })
      }
      if (!row.unit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'unit required when material_name is set',
          path: ['unit'],
        })
      }
    }
  })

export const createProductSchema = z.object({
  item_code: z
    .string()
    .min(1)
    .max(50)
    .transform((s) => s.trim().toUpperCase())
    .refine((s) => ITEM_CODE_REGEX.test(s), {
      message: 'item_code must match XX-XXX-000 (uppercase)',
    }),
  product_name: z.string().trim().min(3).max(200),
  category: z.string().max(100).optional().nullable(),
  marble_type: z.string().max(100).optional().nullable(),
  color: z.string().max(100).optional().nullable(),
  thickness_mm: z.number().nonnegative().optional().nullable(),
  size_length_mm: z.number().nonnegative().optional().nullable(),
  size_width_mm: z.number().nonnegative().optional().nullable(),
  size_height_mm: z.number().nonnegative().optional().nullable(),
  has_wood: z.boolean().optional(),
  has_mdf: z.boolean().optional(),
  has_metal: z.boolean().optional(),
  has_glass: z.boolean().optional(),
  has_fabric: z.boolean().optional(),
  has_custom: z.boolean().optional(),
  is_active: z.boolean().optional(),
  bom: z.array(bomLineSchema).default([]),
  packing: z.array(packingLineSchema).default([]),
})

export const updateProductSchema = z
  .object({
    item_code: z
      .string()
      .min(1)
      .max(50)
      .transform((s) => s.trim().toUpperCase())
      .refine((s) => ITEM_CODE_REGEX.test(s), {
        message: 'item_code must match XX-XXX-000 (uppercase)',
      })
      .optional(),
    product_name: z.string().trim().min(3).max(200).optional(),
    category: z.string().max(100).optional().nullable(),
    marble_type: z.string().max(100).optional().nullable(),
    color: z.string().max(100).optional().nullable(),
    thickness_mm: z.number().nonnegative().optional().nullable(),
    size_length_mm: z.number().nonnegative().optional().nullable(),
    size_width_mm: z.number().nonnegative().optional().nullable(),
    size_height_mm: z.number().nonnegative().optional().nullable(),
    has_wood: z.boolean().optional(),
    has_mdf: z.boolean().optional(),
    has_metal: z.boolean().optional(),
    has_glass: z.boolean().optional(),
    has_fabric: z.boolean().optional(),
    has_custom: z.boolean().optional(),
    is_active: z.boolean().optional(),
    packing: z.array(packingLineSchema).optional(),
    bom: z.array(bomLineSchema).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'At least one field required' })

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  q: z.string().optional(),
  include_inactive: z.enum(['true', 'false']).optional(),
})

export const suggestItemCodeQuerySchema = z.object({
  category: z.string().min(1).max(100),
  material_key: z.string().min(1).max(50),
})
