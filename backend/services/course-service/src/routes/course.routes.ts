import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '@cyberscout/db-client';
import { AppError } from '@cyberscout/error-handler';
import { requireAuth } from '@cyberscout/auth-middleware';
import type { RedisClient, PubSubClient } from '@cyberscout/redis-client';
import type { User } from '@cyberscout/shared-types';
import crypto from 'crypto';

// ── Internal client for calling auth-service ─────────────────────────────────
class InternalClient {
  constructor(private baseUrl: string, private hmacKey: string) {}

  private sign(path: string, timestamp: string): string {
    return crypto.createHmac('sha256', this.hmacKey).update(`${path}:${timestamp}`).digest('hex');
  }

  async get<T>(path: string): Promise<T> {
    const timestamp = Date.now().toString();
    const signature = this.sign(path, timestamp);
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'X-Internal-Signature': signature, 'X-Internal-Timestamp': timestamp },
    });
    if (!res.ok) throw new Error(`Internal call failed: ${res.status}`);
    const json = (await res.json()) as { data: T };
    return json.data;
  }
}

// ── Validation schemas ────────────────────────────────────────────────────────
const ProgressSchema = z.object({
  completed: z.boolean(),
  watchedSeconds: z.number().int().min(0).optional(),
});

const FilterSchema = z.object({
  track: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tier: z.enum(['free', 'pro', 'max']).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ── Recommendation scoring ────────────────────────────────────────────────────
function scoreRecommendation(
  course: any,
  user: User,
  mastery: any[],
  enrolledIds: Set<string>,
): number {
  let score = 0;

  const prereqsMet = (course.prerequisites as string[]).every(
    (prereqId: string) => enrolledIds.has(prereqId),
  );
  if (prereqsMet) score += 30;
  else if ((course.prerequisites as string[]).length > 0) score -= 50;

  const topicMastery = mastery.find((m: any) => m.topic === course.track);
  if (topicMastery) {
    score += Math.max(0, 50 - topicMastery.masteryScore) * 0.4;
  } else {
    score += 15;
  }

  const levelMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
  const userLevel = levelMap[user.level] ?? 1;
  const courseLevel = levelMap[course.difficulty] ?? 1;
  const levelDiff = courseLevel - userLevel;
  if (levelDiff === 0) score += 20;
  else if (levelDiff === 1) score += 15;
  else if (levelDiff === -1) score += 5;
  else score -= 10;

  score += Math.min(10, course.enrolledCount / 500);

  const ageInDays = (Date.now() - new Date(course.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays < 30) score += 8;
  else if (ageInDays < 90) score += 3;

  if (Array.isArray(user.interests) && user.interests.includes(course.track)) score += 12;

  return score;
}

function generateReason(course: any, user: User, mastery: any[]): string {
  const topicMastery = mastery.find((m: any) => m.topic === course.track);
  if (topicMastery && topicMastery.masteryScore < 40) return 'Your weakest area — great time to start';
  if (Array.isArray(user.interests) && user.interests.includes(course.track))
    return `Matches your interest in ${course.track.replace('-', ' ')}`;
  if (course.enrolledCount > 3000) return `Popular with ${course.enrolledCount.toLocaleString()} students`;
  return `Builds on your ${user.level} foundation`;
}

// ── Router factory ────────────────────────────────────────────────────────────
export function courseRoutes(redis: RedisClient, pubsub: PubSubClient): Router {
  const router = Router();
  const authClient = new InternalClient(
    process.env['AUTH_SERVICE_URL'] ?? 'http://localhost:3001',
    process.env['INTERNAL_HMAC_KEY'] ?? 'dev-hmac-key',
  );

  // ── GET /courses ─────────────────────────────────────────────────────────
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = FilterSchema.parse(req.query);
      const skip = (query.page - 1) * query.limit;

      const where: any = { published: true };
      if (query.track) where.track = query.track;
      if (query.difficulty) where.difficulty = query.difficulty;
      if (query.tier) where.tier = query.tier;
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { tags: { has: query.search.toLowerCase() } },
        ];
      }

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          skip,
          take: query.limit,
          orderBy: [{ enrolledCount: 'desc' }, { createdAt: 'desc' }],
          include: { _count: { select: { modules: true } } },
        }),
        prisma.course.count({ where }),
      ]);

      res.json({
        data: courses,
        meta: { total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) },
      });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /courses/:id ─────────────────────────────────────────────────────
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await prisma.course.findUnique({
        where: { id: req.params['id'] },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: { lectures: { orderBy: { order: 'asc' } } },
          },
        },
      });
      if (!course) throw new AppError('COURSE_NOT_FOUND', 404);
      res.json({ data: course });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /courses/:id/enroll ──────────────────────────────────────────────
  router.post('/:id/enroll', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.sub;
      const courseId = req.params['id'];

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) throw new AppError('COURSE_NOT_FOUND', 404);

      // Tier access check
      const tierOrder: Record<string, number> = { free: 0, pro: 1, max: 2 };
      const userTierLevel = tierOrder[req.user!.tier] ?? 0;
      const courseTierLevel = tierOrder[course.tier] ?? 0;
      if (courseTierLevel > userTierLevel) throw new AppError('COURSE_REQUIRES_UPGRADE', 403);

      const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
      if (existing) {
        return res.json({ data: existing });
      }

      const enrollment = await prisma.enrollment.create({
        data: { userId, courseId },
      });

      // Increment enrolled count
      await prisma.course.update({
        where: { id: courseId },
        data: { enrolledCount: { increment: 1 } },
      });

      // Publish event for other services
      await pubsub.publish('events:course.enrolled', { userId, courseId });

      res.status(201).json({ data: enrollment });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /courses/:id/lectures/:lid/progress ──────────────────────────────
  router.post(
    '/:id/lectures/:lid/progress',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user!.sub;
        const courseId = req.params['id'];
        const lectureId = req.params['lid'];
        const body = ProgressSchema.parse(req.body);

        // Verify enrollment
        const enrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId } },
        });
        if (!enrollment) throw new AppError('COURSE_NOT_ENROLLED', 403);

        const progress = await prisma.lectureProgress.upsert({
          where: { userId_lectureId: { userId, lectureId } },
          create: {
            userId,
            lectureId,
            enrollmentId: enrollment.id,
            completed: body.completed,
            watchedSeconds: body.watchedSeconds ?? 0,
            completedAt: body.completed ? new Date() : null,
          },
          update: {
            completed: body.completed,
            watchedSeconds: body.watchedSeconds,
            completedAt: body.completed ? new Date() : undefined,
          },
        });

        if (body.completed) {
          // Check if all lectures in the course are done
          const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
            include: { module: { include: { course: { include: { modules: { include: { lectures: true } } } } } } },
          });

          if (lecture) {
            const allLectures = lecture.module.course.modules.flatMap((m: any) => m.lectures);
            const completedCount = await prisma.lectureProgress.count({
              where: { userId, lectureId: { in: allLectures.map((l: any) => l.id) }, completed: true },
            });

            if (completedCount >= allLectures.length) {
              await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { completedAt: new Date() },
              });
              await pubsub.publish('events:course.completed', { userId, courseId });
            }

            // Publish lecture.completed for mastery tracking in chat-service
            await pubsub.publish('events:lecture.completed', {
              userId,
              lectureId,
              courseId,
              topic: lecture.module.course.track,
            });
          }
        }

        // Update last accessed
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { lastAccessedAt: new Date() },
        });

        res.json({ data: progress });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── GET /courses/dashboard/summary ───────────────────────────────────────
  // Note: this conflicts with /:id pattern — mount separately at /dashboard/summary
  router.get('/dashboard/summary', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.sub;
      const cacheKey = `dashboard:${userId}`;

      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ data: JSON.parse(cached) });

      // Fetch user from auth-service
      const user = await authClient.get<User>(`/internal/users/${userId}`);

      const [enrollments, mastery, weekActivity] = await Promise.all([
        prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: { select: { id: true, title: true, track: true, durationHours: true } },
            lectureProgress: { where: { completed: true } },
          },
          orderBy: { lastAccessedAt: 'desc' },
        }),
        prisma.topicMastery.findMany({ where: { userId } }),
        prisma.lectureProgress.findMany({
          where: {
            userId,
            completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          orderBy: { completedAt: 'asc' },
        }),
      ]);

      // Current course = most recently accessed, not completed
      const currentEnrollment = enrollments.find((e: any) => !e.completedAt);
      const currentCourse = currentEnrollment
        ? {
            id: currentEnrollment.course.id,
            title: currentEnrollment.course.title,
            progress:
              currentEnrollment.lectureProgress.length > 0
                ? Math.round(
                    (currentEnrollment.lectureProgress.length /
                      Math.max(1, currentEnrollment.lectureProgress.length)) *
                      100,
                  )
                : 0,
          }
        : null;

      // Weekly activity — count completions per day of week (0=Sun … 6=Sat)
      const weekActivityMap = new Array(7).fill(0);
      for (const lp of weekActivity) {
        if (lp.completedAt) {
          const day = new Date(lp.completedAt).getDay();
          weekActivityMap[day]++;
        }
      }

      // Recommendations
      const enrolledIds = new Set(enrollments.map((e: any) => e.courseId));
      const tierOrder: Record<string, number> = { free: 0, pro: 1, max: 2 };
      const userTierLevel = tierOrder[user.tier] ?? 0;

      const allCourses = await prisma.course.findMany({
        where: {
          published: true,
          id: { notIn: Array.from(enrolledIds) as string[] },
          tier: { in: ['free', 'pro', 'max'].slice(0, userTierLevel + 1) },
        },
        take: 50,
      });

      const recommendations = allCourses
        .map((course: any) => ({
          courseId: course.id,
          title: course.title,
          track: course.track,
          reason: generateReason(course, user, mastery),
          score: scoreRecommendation(course, user, mastery, enrolledIds),
        }))
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5);

      const summary = {
        user: {
          name: user.name,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          tier: user.tier,
        },
        currentCourse,
        completedCourses: enrollments.filter((e: any) => e.completedAt).length,
        weekActivity: weekActivityMap,
        recommendations,
        topicMastery: mastery.map((m: any) => ({ topic: m.topic, score: m.masteryScore })),
      };

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(summary));
      res.json({ data: summary });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
