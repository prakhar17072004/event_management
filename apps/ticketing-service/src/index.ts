import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { orders } from '@db/schema';


const app = express();
app.use(cors());
app.use(express.json());


const pool = new pg.Pool({
connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/event_platform'
});
const db = drizzle(pool);


app.post('/orders', async (req, res) => {
const { userId, ticketId } = req.body;
const result = await db.insert(orders).values({ userId, ticketId, status: 'pending' }).returning();
res.json({ order: result });
});


app.post('/orders/:id/pay', async (req, res) => {
const id = Number(req.params.id);
await db.update(orders).set({ status: 'paid' }).where(orders.id.eq(id));
res.json({ ok: true });
});


const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log('Ticketing service listening on', port));