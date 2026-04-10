import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import * as dotenv from "dotenv";
import { initializeDatabase } from "./db";
import authRoutes from "./routes/auth";
import submissionRoutes from "./routes/submissions";
import notificationRoutes from "./routes/notifications";
import messageRoutes from "./routes/messages";
import adminRoutes from "./routes/admin";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize DB
initializeDatabase();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || "scholarstrack-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "ScholarsTrack API", version: "1.0.0" });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Seed admin on first run
async function seedAdmin() {
  try {
    const { db } = await import("./db");
    const { users } = await import("./db/schema");
    const { eq } = await import("drizzle-orm");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@scholarstrack.edu";
    const existing = await db.select().from(users).where(eq(users.email, adminEmail));
    
    if (existing.length === 0) {
      const adminPassword = process.env.ADMIN_PASSWORD || "Admin@ScholarsTrack2024";
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await db.insert(users).values({
        id: uuidv4(),
        fullName: "System Administrator",
        email: adminEmail,
        phone: "+000000000000",
        regNumber: "ADMIN-001",
        level: "admin",
        department: "Administration",
        password: hashedPassword,
        role: "admin",
      });
      console.log(`\n✅ Admin account created:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}\n`);
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}

app.listen(PORT, async () => {
  await seedAdmin();
  console.log(`\n🚀 ScholarsTrack API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
