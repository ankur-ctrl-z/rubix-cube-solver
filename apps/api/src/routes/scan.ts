import { Hono } from 'hono'
import { getDb } from '../lib/db'
import type { Env } from '../index'

export const scan = new Hono<{ Bindings: Env }>()

scan.post('/', async (c) => {
  try {
    const formData = await c.req.formData()
    const faceNames = ['top', 'left', 'front', 'right', 'back', 'bottom']

    for (const face of faceNames) {
      if (!formData.get(face)) {
        return c.json({
          status: 'error',
          error: `Missing face: ${face}. All 6 faces required.`
        }, 400)
      }
    }

    const cvServiceUrl = c.env.CV_SERVICE_URL || 'http://127.0.0.1:8000'
    const cvFormData   = new FormData()
    for (const face of faceNames) {
      const file = formData.get(face) as File
      cvFormData.append(face, file)
    }

    const cvResponse = await fetch(`${cvServiceUrl}/detect`, {
      method: 'POST',
      body: cvFormData,
    })
    const cvResult = await cvResponse.json() as any

    if (!cvResponse.ok) {
      return c.json({
        status: 'error',
        error: cvResult.detail || 'Color detection failed'
      }, 400)
    }

    // Get userId from header 
    const userId   = c.req.header('x-user-id') || null
    const sql      = getDb(c.env.DATABASE_URL)
    const moveCount = parseInt(cvResult.moves) || 0

    const saved = await sql`
      INSERT INTO "Scan" (id, "cubeState", solution, "moveCount", "userId", "createdAt")
      VALUES (
        gen_random_uuid(),
        ${cvResult.cube_state},
        ${cvResult.solution},
        ${moveCount},
        ${userId},
        NOW()
      )
      RETURNING id
    `

    return c.json({
      status:     'ok',
      id:         saved[0].id,
      cube_state: cvResult.cube_state,
      solution:   cvResult.solution,
      moves:      cvResult.moves,
      faces:      cvResult.faces,
    })

  } catch (error: any) {
    return c.json({
      status: 'error',
      error: error.message || 'Internal server error'
    }, 500)
  }
})