import { Hono } from 'hono'
import { getDb } from '../lib/db'
import type { Env } from '../index'

export const history = new Hono<{ Bindings: Env }>()

history.get('/', async (c) => {
  try {
    const sql = getDb(c.env.DATABASE_URL)
    const scans = await sql`
      SELECT id, "cubeState", solution, "moveCount", "createdAt"
      FROM "Scan"
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
    const sql = getDb(c.env.DATABASE_URL)
    const id = c.req.param('id')
    const scans = await sql`
      SELECT * FROM "Scan" WHERE id = ${id}
    `
    if (scans.length === 0) {
      return c.json({ status: 'error', error: 'Scan not found' }, 404)
    }
    return c.json({ status: 'ok', scan: scans[0] })
  } catch (error: any) {
    return c.json({ status: 'error', error: error.message }, 500)
  }
})