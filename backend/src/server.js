import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createApp } from './app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const PORT = parseInt(process.env.PORT || '3001', 10)
const app = createApp()

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
