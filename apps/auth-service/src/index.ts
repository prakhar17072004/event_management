import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import { sign } from '@utils/jwt';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from '@db/schema';


const app = express();
app.use(cors());
app.use(express.json());


const pool = new pg.Pool({
connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/event_platform'
});
const db = drizzle(pool);


app.post('/auth/signup', async (req, res) => {
const { email, password, role } = req.body;
const hash = await bcrypt.hash(password, 10);
await db.insert(users).values({ email, passwordHash: hash, role });
res.json({ ok: true });
});


app.post('/auth/login', async (req, res) => {
const { email, password } = req.body;
const user = await db.select().from(users).where(users.email.eq(email)).get();
if (!user) return res.status(401).json({ error: 'Invalid credentials' });
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
const token = sign({ id: user.id, email: user.email, role: user.role });
res.json({ token });
});


app.get('/auth/me', async (req, res) => {
// simple example: read token from header
const auth = req.headers.authorization?.split(' ')[1];
if (!auth) return res.status(401).json({ error: 'no token' });
try {
const payload = JSON.parse(Buffer.from(auth.split('.')[1], 'base64').toString());
res.json({ user: payload });
} catch (e) {
res.status(400).json({ error: 'invalid token' });
}
});


const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log('Auth service listening on', port));