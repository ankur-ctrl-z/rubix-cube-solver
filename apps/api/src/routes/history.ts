import { Hono } from 'hono'
import { getDb } from '../lib/db'
import type { Env } from '../index'

export const history = new Hono<{ Bindings: Env }>()

history.get('/', async (c) => {
  try {
    const sql    = getDb(c.env.DATABASE_URL)
    const userId = c.req.header('x-user-id') || null

    if (!userId) {
      return c.json({ status: 'ok', scans: [] })
    }

    const scans = await sql`
      SELECT id, "cubeState", solution, "moveCount", "createdAt"
      FROM "Scan"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 20
    `

    return c.json({ status: 'ok', scans })

  } catch (error: any) {
    return c.json({ status: 'error', error: error.message }, 500)
  }
}) 

history.get('/:id', async (c) => {
  try {
    const sql    = getDb(c.env.DATABASE_URL)
    const id     = c.req.param('id')
    const userId = c.req.header('x-user-id') || null

    const scans = await sql`
      SELECT * FROM "Scan"
      WHERE id = ${id} AND "userId" = ${userId}
    `

    if (scans.length === 0) {
      return c.json({ status: 'error', error: 'Scan not found' }, 404)
    }

    return c.json({ status: 'ok', scan: scans[0] })

  } catch (error: any) {
    return c.json({ status: 'error', error: error.message }, 500)
  }
})