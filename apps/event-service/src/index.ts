import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { events, tickets } from '@db/schema';


const app = express();
app.use(cors());
app.use(express.json());


const pool = new pg.Pool({
connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/event_platform'
});
const db = drizzle(pool);


app.post('/events', async (req, res) => {
const { organizerId, title, description, startDate, endDate, location } = req.body;
const result = await db.insert(events).values({ organizerId, title, description, startDate, endDate, location }).returning();
res.json({ event: result });
});


app.get('/events', async (req, res) => {
const all = await db.select().from(events).all();
res.json({ events: all });
});


app.post('/events/:id/tickets', async (req, res) => {
const eventId = Number(req.params.id);
const { type, price, quantity } = req.body;
await db.insert(tickets).values({ eventId, type, price, quantity });
res.json({ ok: true });
});


const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log('Event service listening on', port));