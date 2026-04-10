import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { notifications, users } from "../db/schema";
import { eq, or, isNull } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/notifications  - student: get their notifications (personal + broadcast)
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const allNotifs = await db.select().from(notifications);

    const myNotifs = allNotifs.filter(
      (n) => n.recipientId === user.id || n.recipientId === null
    ).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    res.json({ notifications: myNotifs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// GET /api/notifications/unread-count
router.get("/unread-count", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const allNotifs = await db.select().from(notifications);
    const count = allNotifs.filter(
      (n) => (n.recipientId === user.id || n.recipientId === null) && !n.isRead
    ).length;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to get count" });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, req.params.id));
    res.json({ message: "Marked as read" });
  } catch {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// POST /api/notifications  - admin: send notification
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;
    const { recipientId, title, message, sendToAll } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    if (sendToAll) {
      // Broadcast to all students
      await db.insert(notifications).values({
        id: uuidv4(),
        recipientId: null,
        senderId: admin.id,
        title,
        message,
      });
    } else {
      if (!recipientId) {
        return res.status(400).json({ error: "Recipient is required" });
      }
      await db.insert(notifications).values({
        id: uuidv4(),
        recipientId,
        senderId: admin.id,
        title,
        message,
      });
    }

    res.status(201).json({ message: "Notification sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// GET /api/notifications/all  - admin: see all notifications sent
router.get("/all", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allNotifs = await db.select().from(notifications)
      .orderBy(notifications.createdAt);
    res.json({ notifications: allNotifs.reverse() });
  } catch {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

export default router;
