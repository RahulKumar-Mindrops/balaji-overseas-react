import express from 'express'
import cors from 'cors'
import { pool } from './db/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import { createMaterialRoutes } from './modules/materials/material.routes.js'
import { createProductRoutes } from './modules/products/product.routes.js'
import { createBomRoutes } from './modules/bom/bom.routes.js'
import { createMrpRoutes } from './modules/mrp/mrp.routes.js'
import { createOrderRoutes } from './modules/orders/order.routes.js'

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/health', async (req, res, next) => {
    try {
      await pool.query('SELECT 1')
      res.json({ ok: true })
    } catch (e) {
      next(e)
    }
  })

  const v1 = express.Router()
  v1.use('/materials', createMaterialRoutes(pool))
  v1.use('/products', createProductRoutes(pool))
  v1.use('/products/:productId/bom', createBomRoutes(pool))
  v1.use('/mrp', createMrpRoutes())
  v1.use('/orders', createOrderRoutes(pool))

  app.use('/api/v1', v1)

  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not found' })
  })

  app.use(errorHandler)
  return app
}
