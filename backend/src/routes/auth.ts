import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, regNumber, level, department, password } = req.body;

    if (!fullName || !email || !phone || !regNumber || !level || !department || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check existing
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const existingReg = await db.select().from(users).where(eq(users.regNumber, regNumber));
    if (existingReg.length > 0) {
      return res.status(409).json({ error: "Registration number already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();

    await db.insert(users).values({
      id,
      fullName,
      email,
      phone,
      regNumber,
      level,
      department,
      password: hashedPassword,
      role: "student",
    });

    req.session.userId = id;
    req.session.role = "student";

    res.status(201).json({
      message: "Registration successful",
      user: { id, fullName, email, phone, regNumber, level, department, role: "student" },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // identifier = email or regNumber

    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/Registration number and password are required" });
    }

    // Try email first, then regNumber
    let userList = await db.select().from(users).where(eq(users.email, identifier));
    if (userList.length === 0) {
      userList = await db.select().from(users).where(eq(users.regNumber, identifier));
    }

    if (userList.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userList[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    req.session.role = user.role;

    const { password: _, ...safeUser } = user;
    res.json({ message: "Login successful", user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/admin-login (separate admin login endpoint)
router.post("/admin-login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    req.session.userId = user.id;
    req.session.role = "admin";

    const { password: _, ...safeUser } = user;
    res.json({ message: "Admin login successful", user: safeUser });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Admin login failed" });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

export default router;
