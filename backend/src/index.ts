import express from "express";
import session from "express-session";
import SqliteStore from "better-sqlite3-session-store";
import cors from "cors";
import path from "path";
import fs from "fs";
import * as dotenv from "dotenv";
import { initializeDatabase, db, sqlite } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import authRoutes from "./routes/auth";
import submissionRoutes from "./routes/submissions";
import notificationRoutes from "./routes/notifications";
import messageRoutes from "./routes/messages";
import adminRoutes from "./routes/admin";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "8080", 10);

console.log(`Starting ScholarsTrack API...`);
console.log(`PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`RAILWAY: ${process.env.RAILWAY_ENVIRONMENT || "not set"}`);

// ── Database ──────────────────────────────────────────────
initializeDatabase();

// ── Middleware ────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

// ── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: (_origin, cb) => cb(null, true),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

// ── Sessions with SQLite store (no MemoryStore warning) ───
const SessionStore = SqliteStore(session);
app.use(session({
  store: new SessionStore({
    client: sqlite,
    expired: {
      clear: true,
      intervalMs: 900_000, // clear expired sessions every 15 min
    },
  }),
  secret: process.env.SESSION_SECRET || "scholarstrack-change-in-production-xyz",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  },
}));

// ── Health checks ─────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "ScholarsTrack API",
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/",       (_req, res) => res.status(200).json({ status: "ok" }));

// ── API routes ────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/submissions",   submissionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages",      messageRoutes);
app.use("/api/admin",         adminRoutes);

// ── Serve frontend if co-deployed ─────────────────────────
const frontendDist = path.join(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// ── Seed admin ────────────────────────────────────────────
async function seedAdmin(): Promise<void> {
  try {
    const adminEmail    = process.env.ADMIN_EMAIL    || "admin@scholarstrack.edu";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@ScholarsTrack2024";
    const existing = await db.select().from(users).where(eq(users.email, adminEmail));
    if (existing.length === 0) {
      const hashed = await bcrypt.hash(adminPassword, 12);
      await db.insert(users).values({
        id:         uuidv4(),
        fullName:   "System Administrator",
        email:      adminEmail,
        phone:      "+000000000000",
        regNumber:  "ADMIN-001",
        level:      "admin",
        department: "Administration",
        password:   hashed,
        role:       "admin",
      });
      console.log(`✅ Admin created: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin exists: ${adminEmail}`);
    }
  } catch (err) {
    console.warn("⚠️  seedAdmin (non-fatal):", err);
  }
}

// ── Start server ──────────────────────────────────────────
const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 ScholarsTrack API listening on 0.0.0.0:${PORT}`);
  await seedAdmin();
});

server.on("error", (err: NodeJS.ErrnoException) => {
  console.error("❌ Server error:", err.message);
  process.exit(1);
});

// ── Graceful shutdown ─────────────────────────────────────
function shutdown(signal: string) {
  console.log(`${signal} — shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("❌ uncaughtException:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.warn("⚠️  unhandledRejection (non-fatal):", reason);
});

export default app;
