import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { messages, users } from "../db/schema";
import { eq, or } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/messages  - get messages for current user
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const allMessages = await db.select().from(messages);

    const myMessages = allMessages.filter(
      (m) => m.senderId === user.id || m.recipientId === user.id
    ).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    // Attach sender/recipient names
    const enriched = await Promise.all(myMessages.map(async (msg) => {
      const [sender] = await db.select({ id: users.id, fullName: users.fullName, role: users.role })
        .from(users).where(eq(users.id, msg.senderId));
      const [recipient] = await db.select({ id: users.id, fullName: users.fullName, role: users.role })
        .from(users).where(eq(users.id, msg.recipientId));
      return { ...msg, sender, recipient };
    }));

    res.json({ messages: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// GET /api/messages/unread-count
router.get("/unread-count", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const allMessages = await db.select().from(messages);
    const count = allMessages.filter(
      (m) => m.recipientId === user.id && !m.isRead
    ).length;
    res.json({ count });
  } catch {
    res.status(500).json({ error: "Failed to get count" });
  }
});

// POST /api/messages  - send a message (student -> admin or admin -> student)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const sender = (req as any).user;
    const { recipientId, subject, body } = req.body;

    if (!recipientId || !subject || !body) {
      return res.status(400).json({ error: "Recipient, subject and body are required" });
    }

    // Students can only message admins
    if (sender.role === "student") {
      const [recipient] = await db.select().from(users).where(eq(users.id, recipientId));
      if (!recipient || recipient.role !== "admin") {
        return res.status(400).json({ error: "Students can only message administrators" });
      }
    }

    await db.insert(messages).values({
      id: uuidv4(),
      senderId: sender.id,
      recipientId,
      subject,
      body,
    });

    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// POST /api/messages/to-admin  - shortcut: student sends to any admin
router.post("/to-admin", requireAuth, async (req: Request, res: Response) => {
  try {
    const sender = (req as any).user;
    const { subject, body } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ error: "Subject and body are required" });
    }

    // Find first admin
    const allUsers = await db.select().from(users);
    const admin = allUsers.find((u) => u.role === "admin");
    if (!admin) {
      return res.status(404).json({ error: "No administrator found" });
    }

    await db.insert(messages).values({
      id: uuidv4(),
      senderId: sender.id,
      recipientId: admin.id,
      subject,
      body,
    });

    res.status(201).json({ message: "Message sent to administrator" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// PATCH /api/messages/:id/read
router.patch("/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, req.params.id));
    res.json({ message: "Marked as read" });
  } catch {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

export default router;
