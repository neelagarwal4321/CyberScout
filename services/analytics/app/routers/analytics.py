import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Request
from app.utils.redis import get_redis
from app.utils.db import get_pool

router = APIRouter()

async def get_xp_data(pool, user_id: str) -> dict:
    row = await pool.fetchrow("SELECT xp_total, level FROM users WHERE id = $1", user_id)
    return {"total": row["xp_total"] if row else 0, "level": row["level"] if row else 1}

async def get_streak(pool, user_id: str) -> int:
    # Count consecutive days with xp_ledger entries
    rows = await pool.fetch(
        "SELECT DISTINCT DATE(created_at) as day FROM xp_ledger WHERE user_id = $1 ORDER BY day DESC LIMIT 30",
        user_id
    )
    streak = 0
    today = datetime.now().date()
    for i, row in enumerate(rows):
        expected = today - timedelta(days=i)
        if row["day"] == expected:
            streak += 1
        else:
            break
    return streak

async def count_enrollments(pool, user_id: str) -> int:
    row = await pool.fetchrow("SELECT COUNT(*) as c FROM course_enrollments WHERE user_id = $1", user_id)
    return row["c"] if row else 0

async def count_completed(pool, user_id: str) -> int:
    row = await pool.fetchrow("SELECT COUNT(*) as c FROM user_progress WHERE user_id = $1 AND status = 'completed'", user_id)
    return row["c"] if row else 0

async def get_recent_badges(pool, user_id: str, limit: int = 5) -> list:
    rows = await pool.fetch(
        """SELECT a.name, a.slug, ua.earned_at FROM user_achievements ua
           JOIN achievements a ON a.id = ua.achievement_id
           WHERE ua.user_id = $1 ORDER BY ua.earned_at DESC LIMIT $2""",
        user_id, limit
    )
    return [{"name": r["name"], "slug": r["slug"], "earned_at": r["earned_at"].isoformat()} for r in rows]

async def get_weekly_xp(pool, user_id: str) -> list:
    rows = await pool.fetch(
        """SELECT DATE(created_at) as day, SUM(delta) as xp
           FROM xp_ledger WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
           GROUP BY day ORDER BY day""",
        user_id
    )
    return [{"day": str(r["day"]), "xp": r["xp"]} for r in rows]

async def get_upcoming_classes(pool, user_id: str) -> list:
    rows = await pool.fetch(
        """SELECT lc.id, lc.title, lc.starts_at, lc.duration_mins
           FROM live_classes lc
           JOIN class_registrations cr ON cr.class_id = lc.id AND cr.user_id = $1
           WHERE lc.starts_at > NOW() AND lc.is_published = true
           ORDER BY lc.starts_at LIMIT 3""",
        user_id
    )
    return [{"id": str(r["id"]), "title": r["title"], "starts_at": r["starts_at"].isoformat(), "duration_mins": r["duration_mins"]} for r in rows]

@router.get("/analytics/dashboard")
async def get_dashboard(request: Request):
    user = request.state.user
    redis = await get_redis()

    cached = await redis.get(f"dashboard_cache:{user.id}")
    if cached:
        return json.loads(cached)

    pool = await get_pool()

    data = {
        "user": {"id": user.id, "email": user.email, "tier": user.tier},
        "xp": await get_xp_data(pool, user.id),
        "leaderboard_rank": await redis.zrevrank("leaderboard:global", user.id),
        "streak": await get_streak(pool, user.id),
        "courses_enrolled": await count_enrollments(pool, user.id),
        "lessons_completed": await count_completed(pool, user.id),
        "recent_achievements": await get_recent_badges(pool, user.id, limit=5),
        "weekly_xp_chart": await get_weekly_xp(pool, user.id),
        "upcoming_live_classes": await get_upcoming_classes(pool, user.id),
    }

    await redis.set(f"dashboard_cache:{user.id}", json.dumps(data, default=str), ex=300)
    return {"data": data}

@router.get("/analytics/cohort")
async def get_cohort(request: Request):
    # Admin-only cohort analytics
    pool = await get_pool()
    rows = await pool.fetch(
        """SELECT tier, COUNT(*) as count, AVG(xp_total) as avg_xp
           FROM users WHERE is_active = true AND deleted_at IS NULL
           GROUP BY tier"""
    )
    return {"data": [{"tier": r["tier"], "count": r["count"], "avg_xp": float(r["avg_xp"] or 0)} for r in rows]}
