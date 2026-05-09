import { calculateForOrderId, calculateForOrderItems } from './mrp.service.js'

export function mrpController() {
  return {
    async calculate(req, res, next) {
      try {
        const { requirements, shortages } = await calculateForOrderItems(req.body.items)
        res.json({
          success: true,
          data: { requirements, shortages },
        })
      } catch (e) {
        next(e)
      }
    },

    async calculateForOrder(req, res, next) {
      try {
        const orderId = parseInt(req.params.orderId, 10)
        if (Number.isNaN(orderId)) throw new Error('Invalid order id')
        const { requirements, shortages } = await calculateForOrderId(orderId)
        res.json({ success: true, data: { requirements, shortages } })
      } catch (e) {
        next(e)
      }
    },
  }
}
