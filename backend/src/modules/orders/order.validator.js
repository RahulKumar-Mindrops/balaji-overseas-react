import { z } from 'zod'

export const createOrderSchema = z.object({
  po_number: z.string().min(1).max(80).transform((s) => s.trim()),
  client_name: z.string().min(1).max(200).transform((s) => s.trim()),
  order_date: z.string().optional().nullable(), // YYYY-MM-DD
  shipment_date: z.string().optional().nullable(),
  status: z.string().max(50).optional(),
  items: z
    .array(
      z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
})

export const updateOrderSchema = z
  .object({
    po_number: z.string().min(1).max(80).optional(),
    client_name: z.string().min(1).max(200).optional(),
    order_date: z.string().optional().nullable(),
    shipment_date: z.string().optional().nullable(),
    status: z.string().max(50).optional(),
    items: z
      .array(
        z.object({
          product_id: z.number().int().positive(),
          quantity: z.number().int().positive(),
        })
      )
      .optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'At least one field required' })

export const bomOverrideUpsertSchema = z.object({
  bom_id: z.number().int().positive(),
  overridden_qty: z.number().positive(),
  notes: z.string().optional().nullable(),
})

