import { z } from 'zod'

const mrpLine = z.union([
  z
    .object({
      product_id: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      item_code: z.string().min(1),
      quantity: z.number().int().positive(),
    })
    .strict(),
])

export const mrpCalculateSchema = z.object({
  items: z.array(mrpLine).min(1),
})
