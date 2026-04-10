import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { submissions, stageReviews, notifications } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/submissions/my  - student: their own submissions
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const subs = await db.select().from(submissions).where(eq(submissions.studentId, user.id));

    // Get stage reviews for each submission
    const subsWithReviews = await Promise.all(
      subs.map(async (sub) => {
        const reviews = await db.select().from(stageReviews).where(eq(stageReviews.submissionId, sub.id));
        return { ...sub, stageReviews: reviews };
      })
    );

    res.json({ submissions: subsWithReviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// GET /api/submissions/progress  - student: score summary
router.get("/progress", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const subs = await db.select().from(submissions).where(eq(submissions.studentId, user.id));

    const typeScores: Record<string, number | null> = {
      proposal: null,
      result: null,
      presentation: null,
      publication: null,
    };

    for (const sub of subs) {
      if (sub.score !== null && sub.score !== undefined) {
        const t = sub.type as string;
        if (typeScores[t] === null || (typeScores[t] as number) < sub.score) {
          typeScores[t] = sub.score;
        }
      }
    }

    const weights: Record<string, number> = {
      proposal: 0.35,
      result: 0.30,
      presentation: 0.20,
      publication: 0.15,
    };

    let totalScore = 0;
    let totalWeight = 0;
    for (const [type, score] of Object.entries(typeScores)) {
      if (score !== null) {
        totalScore += score * weights[type];
        totalWeight += weights[type];
      }
    }

    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    // Stage status
    const stageStatus: Record<string, string> = {
      department: "not_started",
      faculty: "not_started",
      board: "not_started",
    };

    for (const sub of subs) {
      const reviews = await db.select().from(stageReviews).where(eq(stageReviews.submissionId, sub.id));
      for (const review of reviews) {
        const stage = review.stage;
        if (review.status === "approved") stageStatus[stage] = "approved";
        else if (stageStatus[stage] !== "approved") stageStatus[stage] = review.status;
      }
    }

    res.json({
      scores: typeScores,
      overallScore: Math.round(overallScore * 10) / 10,
      stageStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// POST /api/submissions  - student: create submission
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { type, title, description, fileName, fileUrl } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({ error: "Type, title and description are required" });
    }

    const validTypes = ["proposal", "result", "presentation", "publication"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid submission type" });
    }

    const id = uuidv4();
    await db.insert(submissions).values({
      id,
      studentId: user.id,
      type,
      title,
      description,
      fileName: fileName || null,
      fileUrl: fileUrl || null,
      status: "pending",
      currentStage: "department",
    });

    // Create initial stage review for department
    await db.insert(stageReviews).values({
      id: uuidv4(),
      submissionId: id,
      stage: "department",
      status: "pending",
    });

    res.status(201).json({ message: "Submission created successfully", submissionId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create submission" });
  }
});

// GET /api/submissions  - admin: all submissions
router.get("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allSubs = await db.query.submissions.findMany({
      with: { },
    });

    // Join with user info manually
    const { users } = await import("../db/schema");
    const subsWithUsers = await Promise.all(
      (await db.select().from(submissions)).map(async (sub) => {
        const [student] = await db.select({
          id: users.id,
          fullName: users.fullName,
          regNumber: users.regNumber,
          level: users.level,
          department: users.department,
        }).from(users).where(eq(users.id, sub.studentId));
        const reviews = await db.select().from(stageReviews).where(eq(stageReviews.submissionId, sub.id));
        return { ...sub, student, stageReviews: reviews };
      })
    );

    res.json({ submissions: subsWithUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// PATCH /api/submissions/:id/review  - admin: review/score submission
router.patch("/:id/review", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, status, score, comment } = req.body;
    const admin = (req as any).user;

    if (!stage || !status) {
      return res.status(400).json({ error: "Stage and status are required" });
    }

    // Update or create stage review
    const existingReviews = await db.select().from(stageReviews)
      .where(and(eq(stageReviews.submissionId, id), eq(stageReviews.stage, stage)));

    const reviewData = {
      status,
      score: score ?? null,
      comment: comment ?? null,
      reviewedBy: admin.fullName,
      reviewedAt: new Date().toISOString(),
    };

    if (existingReviews.length > 0) {
      await db.update(stageReviews).set(reviewData)
        .where(and(eq(stageReviews.submissionId, id), eq(stageReviews.stage, stage)));
    } else {
      await db.insert(stageReviews).values({
        id: uuidv4(),
        submissionId: id,
        stage,
        ...reviewData,
      });
    }

    // Update submission main record
    const stageOrder = ["department", "faculty", "board"];
    let newStage = stage;
    let newStatus = status;

    if (status === "approved") {
      const currentIdx = stageOrder.indexOf(stage);
      if (currentIdx < stageOrder.length - 1) {
        newStage = stageOrder[currentIdx + 1];
        newStatus = "pending";
        // Create next stage review
        await db.insert(stageReviews).values({
          id: uuidv4(),
          submissionId: id,
          stage: newStage,
          status: "pending",
        });
      } else {
        newStatus = "approved"; // Final approval
      }
    }

    // Calculate score if provided
    let overallScore = score ?? undefined;

    await db.update(submissions).set({
      status: newStatus,
      currentStage: newStage,
      score: overallScore,
      reviewerComment: comment ?? undefined,
      updatedAt: new Date().toISOString(),
    }).where(eq(submissions.id, id));

    // Notify student
    const [sub] = await db.select().from(submissions).where(eq(submissions.id, id));
    if (sub) {
      const stageLabel = { department: "Department", faculty: "School Faculty", board: "Postgraduate Board" }[stage] || stage;
      const statusLabel = status === "approved" ? "approved ✅" : status === "revision" ? "needs revision ✏️" : "rejected ❌";
      await db.insert(notifications).values({
        id: uuidv4(),
        recipientId: sub.studentId,
        senderId: admin.id,
        title: `Submission ${statusLabel} at ${stageLabel}`,
        message: `Your submission "${sub.title}" has been ${statusLabel} at ${stageLabel} stage.${score ? ` Score: ${score}/100.` : ""}${comment ? ` Feedback: ${comment}` : ""}`,
      });
    }

    res.json({ message: "Review submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

export default router;
