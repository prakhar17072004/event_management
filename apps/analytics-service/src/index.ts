// apps/analytics-service/src/index.ts
import express from "express";
import cors from "cors";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { analytics } from "@db/schema"; // shared schema

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://admin:admin@postgres:5432/mydb", // matches docker-compose.yml
});
const db = drizzle(pool);

// ---------------- Routes ----------------

// Create new analytics event
app.post("/analytics", async (req, res) => {
  try {
    const { userId, eventType, metadata } = req.body;

    if (!userId || !eventType) {
      return res.status(400).json({ error: "userId and eventType are required" });
    }

    const [result] = await db
      .insert(analytics)
      .values({
        userId,
        eventType,
        metadata: metadata || {},
        createdAt: new Date(),
      })
      .returning();

    res.status(201).json(result);
  } catch (err) {
    console.error("❌ Error inserting analytics event:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all analytics events
app.get("/analytics", async (_req, res) => {
  try {
    const events = await db.select().from(analytics);
    res.json(events);
  } catch (err) {
    console.error("❌ Error fetching analytics events:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "analytics-service" });
});

// Start server
const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`✅ Analytics service running on port ${PORT}`);
});
