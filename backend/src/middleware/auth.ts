import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    userId: string;
    role: string;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "Session invalid. Please log in again." });
    }
    (req as any).user = user;
    next();
  } catch {
    res.status(500).json({ error: "Auth check failed" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    (req as any).user = user;
    next();
  } catch {
    res.status(500).json({ error: "Auth check failed" });
  }
}
