import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { scan } from './routes/scan'
import { solve } from './routes/solve'
import { history } from './routes/history'

export type Env = {
  CV_SERVICE_URL: string
  SOLVER_SERVICE_URL: string
  DATABASE_URL: string
}

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('/*', cors())
app.use('/*', logger())

// Health check
app.get('/', (c) => c.json({ 
  status: 'Rubix Solver API running',
  version: '1.0.0'
}))

// Routes
app.route('/scan', scan)
app.route('/solve', solve)
app.route('/history', history)

export default app