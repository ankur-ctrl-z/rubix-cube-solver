import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Env } from '../index'

export const solve = new Hono<{ Bindings: Env }>()

const solveSchema = z.object({
  state: z.string()
    .length(54, 'Cube state must be exactly 54 characters')
    .regex(/^[0-5]{54}$/, 'State must contain only digits 0-5')
})

solve.post('/', zValidator('json', solveSchema), async (c) => {
  try {
    const { state } = c.req.valid('json')
    
    const solverUrl = c.env.SOLVER_SERVICE_URL || 'http://localhost:8080'
    
    const response = await fetch(
      `${solverUrl}/solve?state=${state}`
    )
    
    const result = await response.json() as any

    if (result.status !== 'ok') {
      return c.json({ 
        status: 'error', 
        error: result.error || 'Solver failed' 
      }, 400)
    }

    return c.json({
      status:   'ok',
      solution: result.solution,
      moves:    result.moves,
      state:    state,
    })

  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      error: error.message 
    }, 500)
  }
})