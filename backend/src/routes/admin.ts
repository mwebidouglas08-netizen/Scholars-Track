import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { users, submissions, messages } from "../db/schema";
import { eq, ne } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/admin/users  - list all students
router.get("/users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      regNumber: users.regNumber,
      level: users.level,
      department: users.department,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users);

    res.json({ users: allUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/admin/users  - add a student
router.post("/users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, regNumber, level, department, password, role } = req.body;

    if (!fullName || !email || !phone || !regNumber || !level || !department || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

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
      phone: phone || "",
      regNumber,
      level,
      department,
      password: hashedPassword,
      role: role || "student",
    });

    res.status(201).json({ message: "User created successfully", userId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PATCH /api/admin/users/:id  - update a user
router.patch("/users/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, level, department, role } = req.body;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (level) updateData.level = level;
    if (department) updateData.department = department;
    if (role) updateData.role = role;

    await db.update(users).set(updateData).where(eq(users.id, id));
    res.json({ message: "User updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const admin = (req as any).user;
    if (id === admin.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    await db.delete(users).where(eq(users.id, id));
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// GET /api/admin/dashboard  - stats overview
router.get("/dashboard", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    const allSubs = await db.select().from(submissions);
    const allMessages = await db.select().from(messages);

    const students = allUsers.filter((u) => u.role === "student");
    const byLevel = {
      bachelor: students.filter((s) => s.level === "bachelor").length,
      masters: students.filter((s) => s.level === "masters").length,
      phd: students.filter((s) => s.level === "phd").length,
    };

    const pending = allSubs.filter((s) => s.status === "pending").length;
    const approved = allSubs.filter((s) => s.status === "approved").length;
    const unreadMessages = allMessages.filter((m) => !m.isRead && 
      allUsers.find(u => u.id === m.recipientId && u.role === "admin")).length;

    const avgScore = allSubs.filter((s) => s.score !== null).length > 0
      ? allSubs.filter((s) => s.score !== null).reduce((acc, s) => acc + (s.score || 0), 0) /
        allSubs.filter((s) => s.score !== null).length
      : 0;

    res.json({
      totalStudents: students.length,
      totalAdmins: allUsers.filter((u) => u.role === "admin").length,
      totalSubmissions: allSubs.length,
      pendingReviews: pending,
      approvedSubmissions: approved,
      unreadMessages,
      avgScore: Math.round(avgScore * 10) / 10,
      byLevel,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// GET /api/admin/admins  - list admins
router.get("/admins", requireAdmin, async (req: Request, res: Response) => {
  try {
    const admins = await db.select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.role, "admin"));
    res.json({ admins });
  } catch {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

export default router;
