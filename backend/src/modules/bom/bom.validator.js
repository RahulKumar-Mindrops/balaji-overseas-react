import { z } from 'zod'
import { ALLOWED_UNITS, BOM_TYPES } from '../../constants.js'

const bomLineCore = {
  raw_material_id: z.number().int().positive().optional().nullable(),
  custom_material_name: z.string().max(200).optional().nullable(),
  custom_unit: z.string().max(20).optional().nullable(),
  quantity_per_unit: z.number().positive(),
  unit: z.enum(ALLOWED_UNITS),
  bom_type: z.enum(BOM_TYPES).optional(),
  notes: z.string().optional().nullable(),
}

export const bomLineSchema = z
  .object(bomLineCore)
  .superRefine((row, ctx) => {
    const hasRm = row.raw_material_id != null
    const hasCustom = !!(row.custom_material_name && String(row.custom_material_name).trim())
    if (!hasRm && !hasCustom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either raw_material_id or custom_material_name is required',
      })
    }
    if (hasRm && hasCustom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide raw_material_id OR custom_material_name, not both',
      })
    }
    if (hasCustom && (!row.custom_unit || !String(row.custom_unit).trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'custom_unit is required when using custom_material_name',
        path: ['custom_unit'],
      })
    }
  })

export const bomBulkSchema = z.object({
  bom: z.array(bomLineSchema).min(0),
})

export const createBomLineSchema = bomLineSchema

export const updateBomLineSchema = z
  .object({
    raw_material_id: z.number().int().positive().optional().nullable(),
    custom_material_name: z.string().max(200).optional().nullable(),
    custom_unit: z.string().max(20).optional().nullable(),
    quantity_per_unit: z.number().positive().optional(),
    unit: z.enum(ALLOWED_UNITS).optional(),
    bom_type: z.enum(BOM_TYPES).optional(),
    notes: z.string().optional().nullable(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'At least one field required' })
