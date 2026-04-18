import {Hono} from 'hono';
import {z} from 'zod';
import {cors} from 'hono/cors';

const app = new Hono();

app.use('*', cors());

app.get('/', (c) => 
	c.json({
		status : "Rubix Solver API running"
}))

app.post('/scan', async (c) => {
	const body = await c.req.json()
	return c.json({recieved: true, face: body.face});
})

app.post('solve', async (c) => {
	const body = await c.req.json()
	return c.json({solution: 'placeholder'})
})

export default app
