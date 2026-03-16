# CyberScout — COMPLETE BACKEND BUILD (One-Shot Claude Code Prompt)

> **This is the ONLY file you need.** Feed it to Claude Code. It replaces ALL previous backend specs.
> It merges the SDEL1 Engineering Blueprint (106 pages), the Backend Deep Dive (3400 lines),
> and the LangGraph Refactor Spec (1400 lines) into a single phased execution plan.
>
> Execute phases in order. Complete each fully before starting the next.
> After each phase, report what was built and ask if I want to review.

---

# TABLE OF PHASES

```
PHASE 1  — Teardown & Restructure (delete old, create new dirs, env setup)
PHASE 2  — PostgreSQL: Complete 17-Table Schema (7 Domain Layers)
PHASE 3  — Redis: All Data Structures & Streams
PHASE 4  — Auth Service (Node.js) — Google OAuth2, RS256 JWT, PKCE, Refresh Rotation
PHASE 5  — User & Subscription Service (Node.js) — Profile, Tier Management
PHASE 6  — Course Service (Go + Gin) — Catalog, R2 Signed URLs, Progress, Enrollments
PHASE 7  — AI Tutor Service (Python + FastAPI + LangChain + LangGraph) — Full RAG Pipeline
PHASE 8  — Gamification Service (Node.js) — Event-Driven XP, Badges, Leaderboard
PHASE 9  — Payment Service (Node.js) — Razorpay Orders + Webhooks + Idempotency
PHASE 10 — Live Class Service (Node.js) — Zoom SDK + Attendance Webhooks
PHASE 11 — Analytics Service (Python) — Dashboard Aggregation + Materialized Views
PHASE 12 — Notification Service (Node.js) — Brevo Email + In-App Notifications
PHASE 13 — Infrastructure: Docker Compose + Traefik + Health Checks
PHASE 14 — AI Knowledge Ingestion Pipeline (Qdrant + LangChain)
PHASE 15 — Frontend Updates (Tiers, Razorpay, Remove Mentors)
PHASE 16 — Redis Streams Event Wiring (All Consumers)
PHASE 17 — Testing & Verification
```

---

# GLOBAL CONTEXT — Read First

## Architecture (SDEL1 Target)

```
┌─────────────────────────────────────────────────────────────────────┐
│ CLIENT LAYER: [Android/RN]  [iOS/RN]  [Next.js Web]                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼─────────────────────────────────────┐
│ EDGE: Cloudflare (Free) — DDoS + CDN + TLS Termination             │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│ API GATEWAY: Traefik (on VPS) — Rate Limit + JWT Validate + Route   │
└──┬────┬────┬────┬────┬────┬────┬────┬────┬──────────────────────────┘
   │    │    │    │    │    │    │    │    │
 Auth  User Course AI  Gamif Pay  Live Analy Notif
 :3001 :3002 :3003 :3004 :3005 :3006 :3007 :3008 :3009
 Node  Node  Go    Py   Node  Node  Node  Py   Node
   │    │    │    │    │    │    │    │    │
   └────┴────┴────┴────┴────┴────┴────┴────┘
              │           │           │
   ┌──────────▼───┐ ┌────▼────┐ ┌───▼────┐
   │ PostgreSQL 16│ │ Redis 7 │ │ Qdrant │
   │ (17 tables)  │ │ (cache, │ │(vectors│
   │              │ │ streams)│ │  384d) │
   └──────────────┘ └─────────┘ └────────┘
         │                │
   ┌─────▼──────┐  ┌──────▼──────────┐
   │Cloudflare  │  │Redis Streams    │
   │R2 (content)│  │(event bus)      │
   └────────────┘  └─────────────────┘
```

## Subscription Tiers (SDEL1 — 4 Tiers, INR)

```
Tier          ₹/mo    Lessons              AI/day  Live Class         AI Max Tokens
────────────  ──────  ─────────────────── ──────  ─────────────────  ─────────────
Free          ₹0      First 2 per course   10      Recordings only    150
Beginner      ₹299    All beginner          50      1/month            400
Intermediate  ₹599    Beginner + Inter     100      4/month           1000
Pro           ₹999    Full catalog         ∞       Unlimited          2000
```

## Technology Stack Per Service

| Service | Language | Framework | DB Access | Port |
|---------|----------|-----------|-----------|------|
| auth | Node.js/TS | Express | Prisma + Redis | 3001 |
| user | Node.js/TS | Express | Prisma + Redis | 3002 |
| course | Go 1.22 | Gin | pgx + Redis | 3003 |
| ai-tutor | Python 3.11 | FastAPI | SQLAlchemy + Qdrant + Redis | 3004 |
| gamification | Node.js/TS | Express | Prisma + Redis | 3005 |
| payment | Node.js/TS | Express | Prisma + Redis | 3006 |
| live-class | Node.js/TS | Express | Prisma + Redis | 3007 |
| analytics | Python 3.11 | FastAPI | SQLAlchemy + Redis | 3008 |
| notification | Node.js/TS | Express | Prisma + Redis | 3009 |

---

# PHASE 1 — TEARDOWN & RESTRUCTURE

## 1A. Delete These Directories/Files

```
backend/services/api-gateway/          # Replaced by Traefik container
backend/services/billing-service/      # Replaced by payment/ (Razorpay not Stripe)
backend/services/live-service/         # Replaced by live-class/ (Zoom not Socket.io)
backend/services/mentor-service/       # NOT in SDEL1 scope — removed entirely
backend/services/chat-service/src/graph/    # Old LangGraph (moving to Python)
backend/services/chat-service/src/agents/   # Old custom agents
backend/services/chat-service/src/rag/      # Old RAG pipeline
backend/packages/auth-middleware/      # Rebuilt per-service (polyglot can't share)
backend/packages/validators/           # Rebuilt per-service
```

## 1B. Create New Structure

```
services/
├── auth/                    # Node.js :3001
│   ├── src/
│   │   ├── routes/auth.routes.ts
│   │   ├── controllers/auth.controller.ts
│   │   ├── services/
│   │   │   ├── google.service.ts
│   │   │   ├── jwt.service.ts
│   │   │   └── token.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── rateLimit.ts
│   │   ├── validators/auth.validator.ts
│   │   ├── events/publisher.ts
│   │   ├── utils/logger.ts
│   │   ├── utils/redis.ts
│   │   ├── config/index.ts
│   │   └── app.ts
│   ├── prisma/schema.prisma
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── user/                    # Node.js :3002 (same layout)
├── course/                  # Go :3003 (Go layout: cmd/ internal/ pkg/)
├── ai-tutor/                # Python :3004 (FastAPI layout: app/ scripts/)
├── gamification/            # Node.js :3005
├── payment/                 # Node.js :3006
├── live-class/              # Node.js :3007
├── analytics/               # Python :3008
└── notification/            # Node.js :3009

infra/
├── docker-compose.yml
├── docker-compose.prod.yml
├── traefik/traefik.yml
├── secrets/                 # jwt_private.pem, jwt_public.pem (gitignored)
└── scripts/backup.sh, migrate.sh, ingest-content.sh

.env.example
Makefile
```

## 1C. Generate RSA Keys for JWT

```bash
mkdir -p infra/secrets
openssl genrsa -out infra/secrets/jwt_private.pem 4096
openssl rsa -in infra/secrets/jwt_private.pem -pubout -out infra/secrets/jwt_public.pem
echo "infra/secrets/" >> .gitignore
```

## 1D. Create `.env.example`

```bash
NODE_ENV=development
PG_PASS=localdevpassword
REDIS_PASS=localredispass
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=changeme
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
GROQ_API_KEY=gsk_changeme
GROQ_MODEL=llama3-8b-8192
RAZORPAY_KEY_ID=rzp_test_changeme
RAZORPAY_KEY_SECRET=changeme
RAZORPAY_WEBHOOK_SECRET=changeme
BREVO_API_KEY=xkeysib-changeme
ZOOM_SDK_KEY=changeme
ZOOM_SDK_SECRET=changeme
ZOOM_WEBHOOK_SECRET=changeme
R2_ACCOUNT_ID=changeme
R2_ACCESS_KEY=changeme
R2_SECRET_KEY=changeme
R2_BUCKET=cyberscout-content
```

---

# PHASE 2 — POSTGRESQL SCHEMA (17 TABLES, 7 DOMAIN LAYERS)

Create `infra/migrations/0020_complete_platform_schema.sql`. Run it directly on PostgreSQL.

**All tables, constraints, indexes, triggers, enums, and materialized views are specified below. Implement EXACTLY as written — this is the SDEL1 authoritative schema.**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE subscription_tier AS ENUM ('free','beginner','intermediate','pro');
CREATE TYPE subscription_status AS ENUM ('active','cancelled','past_due','expired');

-- ═══ LAYER 1: IDENTITY ═══

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    tier subscription_tier NOT NULL DEFAULT 'free',
    xp_total INTEGER NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
    level SMALLINT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 8),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_xp ON users(xp_total DESC);
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    razorpay_sub_id VARCHAR(255) UNIQUE,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sub_period ON subscriptions(current_period_end)
    WHERE current_period_end IS NOT NULL;

CREATE TABLE xp_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL CHECK (delta <> 0),
    reason VARCHAR(100) NOT NULL,
    reference_id UUID,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_xp_user ON xp_ledger(user_id, created_at DESC);

CREATE TABLE ai_query_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    course_id UUID,
    lesson_id UUID,
    tokens_used INTEGER NOT NULL,
    quota_before INTEGER NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_aih_user ON ai_query_history(user_id, created_at DESC);

-- ═══ LAYER 2: BILLING ═══

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    razorpay_order_id VARCHAR(255) UNIQUE,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
    currency VARCHAR(5) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    tier_purchased subscription_tier,
    billing_period VARCHAR(10) NOT NULL DEFAULT 'monthly',
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    razorpay_event_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pay_user ON payments(user_id);
CREATE INDEX idx_pay_status ON payments(status);

-- ═══ LAYER 3: CONTENT ═══

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_r2 TEXT,
    tier_required subscription_tier NOT NULL DEFAULT 'free',
    category VARCHAR(100),
    difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_courses_pub ON courses(is_published) WHERE is_published = true;
CREATE INDEX idx_courses_tier ON courses(tier_required);
CREATE INDEX idx_courses_cat ON courses(category);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content_r2_key TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL DEFAULT 'markdown',
    duration_mins SMALLINT,
    tier_required subscription_tier NOT NULL DEFAULT 'free',
    sort_order INTEGER NOT NULL DEFAULT 0,
    xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
    has_quiz BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_les_course ON lessons(course_id, sort_order);

CREATE TABLE course_enrollments (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    xp_bonus_given BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, course_id)
);

-- ═══ LAYER 4: LEARNING ═══

CREATE TABLE user_progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    score SMALLINT CHECK (score IS NULL OR score BETWEEN 0 AND 100),
    xp_earned INTEGER NOT NULL DEFAULT 0,
    time_spent_secs INTEGER NOT NULL DEFAULT 0,
    attempt_count SMALLINT NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    last_position INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);
CREATE INDEX idx_prog_status ON user_progress(user_id, status);

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT,
    option_d TEXT,
    correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('a','b','c','d')),
    explanation TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_quiz_lesson ON quiz_questions(lesson_id, sort_order);

CREATE TABLE offline_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    enc_key_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);
CREATE INDEX idx_offline_exp ON offline_manifests(expires_at) WHERE revoked_at IS NULL;

-- ═══ LAYER 5: ENGAGEMENT ═══

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_r2_key TEXT,
    xp_bonus INTEGER NOT NULL DEFAULT 0 CHECK (xp_bonus >= 0),
    trigger_type VARCHAR(50) NOT NULL,
    trigger_value INTEGER,
    unlock_type VARCHAR(50) NOT NULL,
    unlock_value VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_achievements (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notified_at TIMESTAMPTZ,
    xp_credited INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, achievement_id)
);
CREATE INDEX idx_ua_user ON user_achievements(user_id, earned_at DESC);

CREATE TABLE leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scope VARCHAR(20) NOT NULL,
    rank INTEGER NOT NULL CHECK (rank > 0),
    xp_at_time INTEGER NOT NULL,
    snapshotted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_lb_scope ON leaderboard_snapshots(scope, rank);

-- ═══ LAYER 6: AI ═══

CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    tier_required subscription_tier NOT NULL DEFAULT 'free',
    token_count INTEGER NOT NULL CHECK (token_count > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    invalidated_at TIMESTAMPTZ
);
CREATE INDEX idx_kc_course ON knowledge_chunks(course_id);
CREATE INDEX idx_kc_lesson ON knowledge_chunks(lesson_id);
CREATE INDEX idx_kc_tier ON knowledge_chunks(tier_required);

CREATE TABLE ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES ai_query_history(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══ LAYER 7: LIVE CLASS ═══

CREATE TABLE live_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    zoom_meeting_id VARCHAR(100) NOT NULL UNIQUE,
    zoom_join_url TEXT NOT NULL,
    zoom_password VARCHAR(100),
    tier_required subscription_tier NOT NULL DEFAULT 'beginner',
    instructor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    starts_at TIMESTAMPTZ NOT NULL,
    duration_mins INTEGER NOT NULL CHECK (duration_mins > 0),
    max_participants INTEGER,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    recording_r2_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_lc_starts ON live_classes(starts_at);

CREATE TABLE zoom_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    zoom_participant_id VARCHAR(100),
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    duration_mins INTEGER,
    xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    attendance_valid BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE class_registrations (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, class_id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read, created_at DESC);

CREATE TABLE email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    template VARCHAR(100) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    brevo_msg_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══ MATERIALIZED VIEWS ═══
CREATE MATERIALIZED VIEW user_xp_totals AS
SELECT user_id, SUM(delta) AS total_xp FROM xp_ledger GROUP BY user_id;
CREATE UNIQUE INDEX ON user_xp_totals(user_id);

-- ═══ TRIGGERS ═══
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sub_updated BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_course_updated BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_progress_updated BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION sync_user_tier() RETURNS TRIGGER AS $$
BEGIN UPDATE users SET tier = NEW.tier WHERE id = NEW.user_id; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_sync_tier AFTER UPDATE OF tier ON subscriptions FOR EACH ROW EXECUTE FUNCTION sync_user_tier();

CREATE OR REPLACE FUNCTION update_user_xp() RETURNS TRIGGER AS $$
BEGIN UPDATE users SET xp_total = xp_total + NEW.delta WHERE id = NEW.user_id; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_xp_update AFTER INSERT ON xp_ledger FOR EACH ROW EXECUTE FUNCTION update_user_xp();
```

---

# PHASE 3 — REDIS DATA STRUCTURES

Implement these exact key patterns in every service that uses Redis:

```
# Auth
SET   refresh_token:{sha256_hash}     "{user_id}"          EX 604800
SET   jti_block:{jti}                 "1"                  EX 900

# Permissions (cached tier)
SET   perm:{user_id}                  "{tier}"             EX 300

# AI quotas
SET   ai:quota:{user_id}:{YYYY-MM-DD} {count}             EX 86400

# AI response cache
SET   resp_cache:{sha256(query+tier)} "{response_json}"    EX 3600

# Leaderboard
ZADD  leaderboard:global              {xp} {user_id}
ZADD  leaderboard:monthly:{YYYY-MM}   {xp} {user_id}

# Dashboard cache
SET   dashboard_cache:{user_id}       "{json}"             EX 300

# Rate limiting
INCR  rate:{ip}:{minute_bucket}       EXPIRE 60

# Redis Streams (event bus)
stream:lesson_completed
stream:course_enrolled
stream:payment_succeeded
stream:payment_failed
stream:badge_unlocked
stream:level_up
stream:class_attended
stream:login_streak
stream:user_registered
stream:subscription_upgraded
stream:ai_query_logged
```

---

# PHASE 4 — AUTH SERVICE (Node.js + Express :3001)

## Endpoints
```
POST /api/v1/auth/google/callback    Public    Google OAuth2 code exchange + PKCE
POST /api/v1/auth/refresh            Public    Rotate JWT via HttpOnly cookie
POST /api/v1/auth/logout             Auth      Revoke refresh + JTI blocklist
```

## Implementation Requirements

### Google OAuth2 Flow
1. Receive `code` + `code_verifier` (PKCE for mobile)
2. Exchange code for `id_token` at Google's token endpoint
3. Verify `id_token` signature against Google JWKS (cache keys 24h)
4. Extract `sub`, `email`, `name`, `picture` from id_token payload
5. Upsert user: INSERT on first login, UPDATE `last_login_at` on return
6. Load tier from Redis `perm:{user_id}` (fallback: query subscriptions table)
7. Issue RS256 JWT (15-min expiry): `{ sub, email, tier, iat, exp, jti }`
8. Issue refresh token: 256-bit random, store SHA-256 hash in Redis (7-day TTL)
9. Return JWT in response body, refresh token as HttpOnly Secure SameSite cookie
10. Publish `stream:user_registered` on first-time users

### RS256 JWT Implementation
```typescript
// jwt.service.ts
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

const PRIVATE_KEY = readFileSync(process.env.JWT_PRIVATE_KEY_FILE!, 'utf-8');
const PUBLIC_KEY = readFileSync(process.env.JWT_PUBLIC_KEY_FILE!, 'utf-8');

function signAccessToken(user: { id: string; email: string; tier: string }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, tier: user.tier },
    PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '15m', jwtid: crypto.randomUUID() }
  );
}

function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as JWTPayload;
}
```

### Refresh Token Rotation (Reuse Detection)
```typescript
// token.service.ts
async function refreshTokens(oldTokenHash: string) {
  const userId = await redis.get(`refresh_token:${oldTokenHash}`);
  if (!userId) throw new AppError('REFRESH_TOKEN_EXPIRED', 401);

  // Delete old token
  await redis.del(`refresh_token:${oldTokenHash}`);

  // Issue new pair
  const user = await prisma.users.findUnique({ where: { id: userId } });
  const newAccess = signAccessToken(user);
  const newRefresh = crypto.randomBytes(32).toString('hex');
  const newRefreshHash = crypto.createHash('sha256').update(newRefresh).digest('hex');

  await redis.set(`refresh_token:${newRefreshHash}`, userId, 'EX', 604800);

  return { accessToken: newAccess, refreshToken: newRefresh };
}
```

### Logout (JTI Blocklist)
```typescript
async function logout(jti: string, refreshTokenHash: string) {
  // Block the JWT ID for remaining TTL
  await redis.set(`jti_block:${jti}`, '1', 'EX', 900);
  // Delete refresh token
  await redis.del(`refresh_token:${refreshTokenHash}`);
}
```

### JWT Validation Middleware (shared pattern for all Node.js services)
```typescript
// middleware/auth.middleware.ts
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Missing token' } });

  try {
    const payload = verifyAccessToken(token);

    // Check JTI blocklist
    const blocked = await redis.get(`jti_block:${payload.jti}`);
    if (blocked) throw new Error('Token revoked');

    req.user = { id: payload.sub, email: payload.email, tier: payload.tier };
    next();
  } catch {
    return res.status(401).json({ error: { code: 'AUTH_INVALID', message: 'Invalid token' } });
  }
}
```

### Tier Guard Middleware
```typescript
function requireTier(minTier: string) {
  const tierRank = { free: 0, beginner: 1, intermediate: 2, pro: 3 };
  return (req, res, next) => {
    if (tierRank[req.user.tier] < tierRank[minTier]) {
      return res.status(403).json({
        error: { code: 'TIER_INSUFFICIENT', message: `Requires ${minTier} subscription`, upgrade_url: '/pricing' }
      });
    }
    next();
  };
}
```

### Event Publishing (Redis Streams)
```typescript
// events/publisher.ts
async function publishEvent(stream: string, data: Record<string, string>) {
  await redis.xadd(stream, '*', ...Object.entries(data).flat());
}

// Usage:
await publishEvent('stream:user_registered', {
  user_id: user.id, email: user.email, name: user.name, tier: 'free', timestamp: Date.now().toString()
});
```

### Graceful Shutdown (every Node.js service)
```typescript
async function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received');
  server.close();
  await new Promise(r => setTimeout(r, 5000));
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

# PHASE 5 — USER & SUBSCRIPTION SERVICE (Node.js :3002)

## Endpoints
```
GET   /api/v1/users/me                Auth Free+     User profile
PATCH /api/v1/users/me                Auth Free+     Update name, avatar
GET   /api/v1/users/me/subscription   Auth Free+     Subscription details
```

## Event Consumers
Consumes `stream:payment_succeeded` and `stream:payment_failed`:
- On `payment_succeeded`: UPDATE subscriptions SET tier, status=active, period dates
- On `payment_failed`: UPDATE subscriptions SET status=past_due
- Both: bust Redis `perm:{user_id}` cache

---

# PHASE 6 — COURSE SERVICE (Go + Gin :3003)

## Endpoints
```
GET   /api/v1/courses                 Auth Free+     Paginated catalog
GET   /api/v1/courses/:id             Auth Free+     Course + lessons
GET   /api/v1/lessons/:id/content     Auth tier-dep  Pre-signed R2 URL (5-min, IP-bound, watermarked)
POST  /api/v1/progress                Auth Free+     Upsert progress → publish lesson_completed
POST  /api/v1/courses/:id/enroll      Auth tier-dep  Create enrollment → publish course_enrolled
```

## Key Logic — Lesson Content Delivery
```go
// presign_service.go
func (s *PresignService) GetLessonContent(user User, lessonID string) (*LessonContent, error) {
    lesson := s.repo.FindByID(lessonID)
    if !lesson.IsPublished { return nil, ErrNotFound }

    userTierRank := TierRank[user.Tier]    // free=0, beginner=1, intermediate=2, pro=3
    lessonTierRank := TierRank[lesson.TierRequired]
    if userTierRank < lessonTierRank {
        return nil, ErrTierInsufficient
    }

    presignedURL := s.r2.GeneratePresignedURL(lesson.ContentR2Key, 300, user.IP)
    watermark := fmt.Sprintf("%s | %s", user.Name, user.ID)

    return &LessonContent{
        ContentURL: presignedURL,
        ExpiresAt:  time.Now().Add(5 * time.Minute),
        Watermark:  watermark,
    }, nil
}
```

## Key Logic — Progress with XP Events
```go
// On status=completed (first time only):
func (s *ProgressService) SyncProgress(userID, lessonID, status string, score int, timeSecs int) {
    // UPSERT user_progress
    // If newly completed:
    //   1. Award XP: INSERT xp_ledger (triggers auto-update users.xp_total)
    //   2. Publish stream:lesson_completed { user_id, lesson_id, course_id, score, xp_earned }
    //   3. Check if all lessons in course completed → set course_enrollments.completed_at
}
```

## JWT Validation in Go
```go
// middleware/auth.go — validate RS256 JWT using public key
func AuthMiddleware(publicKey *rsa.PublicKey) gin.HandlerFunc {
    return func(c *gin.Context) {
        token := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
        claims, err := jwt.ParseWithClaims(token, &Claims{}, func(t *jwt.Token) (interface{}, error) {
            return publicKey, nil
        })
        if err != nil { c.AbortWithStatus(401); return }
        // Check JTI blocklist in Redis
        blocked, _ := redis.Get(ctx, "jti_block:"+claims.JTI).Result()
        if blocked != "" { c.AbortWithStatus(401); return }
        c.Set("user", claims)
        c.Next()
    }
}
```

---

# PHASE 7 — AI TUTOR SERVICE (Python + FastAPI + LangChain + LangGraph :3004)

This is the most complex service. It implements the **multi-agentic RAG pipeline** using LangChain for the framework and LangGraph for the agent orchestration graph.

## Dependencies
```
pip install fastapi uvicorn langchain langchain-core langchain-community
pip install langgraph langchain-groq qdrant-client
pip install sentence-transformers sqlalchemy asyncpg aioredis pydantic
```

## Endpoints
```
POST /api/v1/ai/query       Auth SSE    RAG pipeline → streamed response
GET  /api/v1/ai/history     Auth        Past queries (paginated)
POST /api/v1/ai/feedback    Auth        Rate response (1-5)
```

## LangGraph State Definition

```python
# app/graph/state.py
from typing import TypedDict, Optional, List

class AgentState(TypedDict):
    user_id: str
    query: str
    user_tier: str  # free|beginner|intermediate|pro
    course_id: Optional[str]
    lesson_id: Optional[str]
    enrolled_course_ids: List[str]

    # Quota gate output
    quota_allowed: bool
    quota_remaining: int

    # Embedding output
    query_vector: Optional[List[float]]
    cache_hit: bool
    cached_response: Optional[str]

    # Retrieval output
    retrieved_chunks: List[dict]

    # Prompt construction output
    full_prompt: Optional[str]
    max_tokens: int

    # LLM output
    response_text: str
    tokens_used: int

    # Error
    error: Optional[str]
```

## LangGraph Pipeline

```python
# app/graph/pipeline.py
from langgraph.graph import StateGraph, END, START
from app.graph.state import AgentState
from app.graph.nodes import quota_gate, embed_query, retrieve_chunks, construct_prompt, stream_llm, audit_log, cache_write

def build_rag_graph():
    graph = StateGraph(AgentState)

    graph.add_node("quota_gate", quota_gate)
    graph.add_node("embed_query", embed_query)
    graph.add_node("retrieve_chunks", retrieve_chunks)
    graph.add_node("construct_prompt", construct_prompt)
    graph.add_node("stream_llm", stream_llm)
    graph.add_node("audit_log", audit_log)
    graph.add_node("cache_write", cache_write)

    graph.add_edge(START, "quota_gate")

    graph.add_conditional_edges("quota_gate", lambda s: "denied" if not s["quota_allowed"] else ("cache_hit" if s["cache_hit"] else "embed"), {
        "denied": END,
        "cache_hit": "audit_log",  # Skip retrieval+LLM, use cached response
        "embed": "embed_query",
    })

    graph.add_edge("embed_query", "retrieve_chunks")
    graph.add_edge("retrieve_chunks", "construct_prompt")
    graph.add_edge("construct_prompt", "stream_llm")
    graph.add_edge("stream_llm", "audit_log")
    graph.add_edge("audit_log", "cache_write")
    graph.add_edge("cache_write", END)

    return graph.compile()
```

## Graph Nodes (Every Agent)

### Node: Quota Gate
```python
# app/graph/nodes/quota_gate.py
async def quota_gate(state: AgentState) -> AgentState:
    tier_limits = {"free": 10, "beginner": 50, "intermediate": 100, "pro": 999999}
    limit = tier_limits[state["user_tier"]]

    date_key = datetime.now().strftime("%Y-%m-%d")
    redis_key = f"ai:quota:{state['user_id']}:{date_key}"
    current = int(await redis.get(redis_key) or 0)

    if current >= limit:
        return {**state, "quota_allowed": False, "quota_remaining": 0,
                "error": "QUOTA_EXCEEDED", "response_text": "Daily AI limit reached. Upgrade for more."}

    # Check response cache
    cache_key = hashlib.sha256(f"{state['query']}:{state['user_tier']}".encode()).hexdigest()
    cached = await redis.get(f"resp_cache:{cache_key}")
    if cached:
        return {**state, "quota_allowed": True, "cache_hit": True, "cached_response": cached,
                "response_text": cached, "quota_remaining": limit - current - 1}

    return {**state, "quota_allowed": True, "cache_hit": False, "quota_remaining": limit - current - 1}
```

### Node: Embed Query
```python
# app/graph/nodes/embed_query.py
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim, loaded once at startup

async def embed_query(state: AgentState) -> AgentState:
    vector = model.encode(state["query"]).tolist()  # ~5ms on CPU
    return {**state, "query_vector": vector}
```

### Node: Retrieve Chunks (Qdrant)
```python
# app/graph/nodes/retrieve_chunks.py
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchAny

client = QdrantClient(url=settings.QDRANT_URL)

TIER_RANK = {"free": ["free"], "beginner": ["free","beginner"],
             "intermediate": ["free","beginner","intermediate"], "pro": ["free","beginner","intermediate","pro"]}

async def retrieve_chunks(state: AgentState) -> AgentState:
    allowed_tiers = TIER_RANK[state["user_tier"]]

    filters = Filter(must=[
        FieldCondition(key="tier_required", match=MatchAny(any=allowed_tiers)),
    ])
    # Optionally scope to enrolled courses
    if state.get("enrolled_course_ids"):
        filters.must.append(
            FieldCondition(key="course_id", match=MatchAny(any=state["enrolled_course_ids"]))
        )
    # Scope to specific lesson for hint mode
    if state.get("lesson_id"):
        filters.must.append(
            FieldCondition(key="lesson_id", match=MatchAny(any=[state["lesson_id"]]))
        )

    results = client.search(
        collection_name=settings.QDRANT_COLLECTION,
        query_vector=state["query_vector"],
        query_filter=filters,
        limit=5,
        with_payload=True,
    )

    chunks = [{"text": r.payload["chunk_text"], "course_id": r.payload["course_id"],
               "lesson_id": r.payload["lesson_id"], "score": r.score} for r in results]

    return {**state, "retrieved_chunks": chunks}
```

### Node: Construct Prompt
```python
# app/graph/nodes/construct_prompt.py
from langchain_core.prompts import ChatPromptTemplate

TIER_MAX_TOKENS = {"free": 150, "beginner": 400, "intermediate": 1000, "pro": 2000}

SYSTEM_TEMPLATE = """You are a cybersecurity tutor on the CyberScout platform.
Answer ONLY using the context below. If the question is outside the provided context,
say "I can only help with topics covered in your enrolled courses."

User subscription tier: {tier}
If the question requires knowledge beyond their tier, give a brief 1-2 sentence answer
and suggest upgrading for the full explanation.

CONTEXT:
{context}

RULES:
- Be concise and educational
- Use code examples when relevant
- Never provide working exploit code for real systems
- Suggest related topics the student should explore next"""

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_TEMPLATE),
    ("human", "{query}"),
])

async def construct_prompt(state: AgentState) -> AgentState:
    context = "\n\n".join([f"[Source {i+1}]\n{c['text']}" for i, c in enumerate(state["retrieved_chunks"])])
    max_tokens = TIER_MAX_TOKENS[state["user_tier"]]

    formatted = prompt.format_messages(tier=state["user_tier"], context=context or "No relevant context found.", query=state["query"])

    return {**state, "full_prompt": formatted, "max_tokens": max_tokens}
```

### Node: Stream LLM (Groq)
```python
# app/graph/nodes/stream_llm.py
from langchain_groq import ChatGroq

llm = ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY, streaming=True)

async def stream_llm(state: AgentState) -> AgentState:
    # For the graph execution, we collect the full response.
    # Actual SSE streaming happens in the FastAPI endpoint layer.
    response = await llm.ainvoke(state["full_prompt"], max_tokens=state["max_tokens"])
    text = response.content
    tokens = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

    return {**state, "response_text": text, "tokens_used": tokens}
```

### Node: Audit Log
```python
# app/graph/nodes/audit_log.py
async def audit_log(state: AgentState) -> AgentState:
    # Increment quota
    date_key = datetime.now().strftime("%Y-%m-%d")
    await redis.incr(f"ai:quota:{state['user_id']}:{date_key}")
    await redis.expire(f"ai:quota:{state['user_id']}:{date_key}", 86400)

    # Write to PostgreSQL
    await db.execute(
        "INSERT INTO ai_query_history (user_id, query, response, course_id, lesson_id, tokens_used, quota_before, model_version) "
        "VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
        state["user_id"], state["query"], state["response_text"],
        state.get("course_id"), state.get("lesson_id"),
        state["tokens_used"], state["quota_remaining"], settings.GROQ_MODEL
    )

    # Publish event
    await redis.xadd("stream:ai_query_logged", {"user_id": state["user_id"], "tokens_used": str(state["tokens_used"])})

    return state
```

### Node: Cache Write
```python
async def cache_write(state: AgentState) -> AgentState:
    cache_key = hashlib.sha256(f"{state['query']}:{state['user_tier']}".encode()).hexdigest()
    await redis.set(f"resp_cache:{cache_key}", state["response_text"], ex=3600)
    return state
```

## FastAPI SSE Endpoint

```python
# app/routers/query.py
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from langchain_groq import ChatGroq

router = APIRouter()
rag_graph = build_rag_graph()
llm = ChatGroq(model=settings.GROQ_MODEL, streaming=True)

@router.post("/ai/query")
async def ai_query(request: Request, body: QueryRequest):
    user = request.state.user  # From JWT middleware

    # Run pre-LLM nodes (quota, embed, retrieve, prompt)
    initial_state = {
        "user_id": user.id, "query": body.query, "user_tier": user.tier,
        "course_id": body.course_id, "lesson_id": body.lesson_id,
        "enrolled_course_ids": await get_enrolled_courses(user.id),
        "quota_allowed": False, "quota_remaining": 0, "cache_hit": False,
        "cached_response": None, "query_vector": None, "retrieved_chunks": [],
        "full_prompt": None, "max_tokens": 150, "response_text": "", "tokens_used": 0, "error": None,
    }

    # Execute graph (non-streaming nodes)
    result = await rag_graph.ainvoke(initial_state)

    if result.get("error"):
        return StreamingResponse(error_stream(result["error"], result.get("quota_remaining", 0)), media_type="text/event-stream")

    if result["cache_hit"]:
        return StreamingResponse(cached_stream(result["cached_response"], result["quota_remaining"]), media_type="text/event-stream")

    # Stream from Groq
    async def generate():
        full_text = ""
        async for chunk in llm.astream(result["full_prompt"], max_tokens=result["max_tokens"]):
            token = chunk.content
            if token:
                full_text += token
                yield f"data: {json.dumps({'token': token})}\n\n"

        yield f"data: {json.dumps({'done': True, 'quota_remaining': result['quota_remaining'], 'tokens_used': len(full_text.split())})}\n\n"

        # Post-stream: audit + cache (fire and forget)
        asyncio.create_task(post_stream_tasks(result, full_text))

    return StreamingResponse(generate(), media_type="text/event-stream")
```

---

# PHASE 8 — GAMIFICATION SERVICE (Node.js :3005)

**Purely event-driven** — consumes Redis Streams, computes XP, awards badges, updates leaderboard.

## HTTP Endpoints (read-only)
```
GET /api/v1/gamification/leaderboard   Auth    ZREVRANGE from Redis sorted set
GET /api/v1/gamification/me            Auth    User's XP, level, badges, streak
```

## Event Consumer (core logic)
```typescript
// events/consumer.ts — runs on startup, loops forever
const STREAMS = ['stream:lesson_completed', 'stream:class_attended', 'stream:login_streak', 'stream:payment_succeeded'];

async function startConsumer() {
  // Create consumer groups (idempotent)
  for (const stream of STREAMS) {
    await redis.xgroup('CREATE', stream, 'gamification-consumers', '$', 'MKSTREAM').catch(() => {});
  }

  while (true) {
    const results = await redis.xreadgroup(
      'GROUP', 'gamification-consumers', 'worker-1',
      'COUNT', '10', 'BLOCK', '2000',
      'STREAMS', ...STREAMS, ...STREAMS.map(() => '>')
    );

    if (!results) continue;

    for (const [stream, messages] of results) {
      for (const [id, fields] of messages) {
        try {
          await processEvent(stream, fields);
          await redis.xack(stream, 'gamification-consumers', id);
        } catch (err) {
          logger.error({ err, stream, id }, 'Event processing failed');
        }
      }
    }
  }
}
```

## XP Computation
```typescript
const XP_TABLE = {
  lesson_completed: 50,
  course_completed: 500,
  class_attended: 75,
  badge_earned: 0,  // variable per badge
  login_streak_7: 100,
  login_streak_30: 500,
  quiz_90pct: 150,
};

async function awardXP(userId: string, delta: number, reason: string, referenceId?: string) {
  const currentXP = await prisma.users.findUnique({ where: { id: userId }, select: { xp_total: true } });
  const balanceAfter = currentXP.xp_total + delta;

  await prisma.xp_ledger.create({
    data: { user_id: userId, delta, reason, reference_id: referenceId, balance_after: balanceAfter }
  });
  // Trigger trg_xp_update auto-updates users.xp_total

  // Update leaderboard
  await redis.zadd('leaderboard:global', balanceAfter, userId);
  await redis.zadd(`leaderboard:monthly:${new Date().toISOString().slice(0,7)}`, balanceAfter, userId);

  // Check level-up
  await checkLevelUp(userId, balanceAfter);
}
```

## 8-Level System
```typescript
const LEVELS = [
  { level: 1, name: 'Script Kiddie', minXP: 0 },
  { level: 2, name: 'Packet Sniffer', minXP: 500 },
  { level: 3, name: 'Firewall Breaker', minXP: 1500 },
  { level: 4, name: 'Cipher Cracker', minXP: 3000 },
  { level: 5, name: 'Exploit Hunter', minXP: 5000 },
  { level: 6, name: 'Zero Day Finder', minXP: 8000 },
  { level: 7, name: 'Incident Commander', minXP: 12000 },
  { level: 8, name: 'Cyber Sentinel', minXP: 20000 },
];

async function checkLevelUp(userId: string, xp: number) {
  const newLevel = LEVELS.filter(l => xp >= l.minXP).pop();
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (newLevel && newLevel.level > user.level) {
    await prisma.users.update({ where: { id: userId }, data: { level: newLevel.level } });
    await publishEvent('stream:level_up', {
      user_id: userId, old_level: user.level.toString(),
      new_level: newLevel.level.toString(), level_name: newLevel.name
    });
  }
}
```

## Badge Evaluation
```typescript
async function evaluateBadges(userId: string, eventType: string, eventData: any) {
  const badges = await prisma.achievements.findMany({ where: { is_active: true, trigger_type: eventType } });

  for (const badge of badges) {
    const alreadyEarned = await prisma.user_achievements.findUnique({
      where: { user_id_achievement_id: { user_id: userId, achievement_id: badge.id } }
    });
    if (alreadyEarned) continue;

    const earned = await checkTrigger(userId, badge);
    if (earned) {
      await prisma.user_achievements.create({
        data: { user_id: userId, achievement_id: badge.id, xp_credited: badge.xp_bonus }
      });
      if (badge.xp_bonus > 0) await awardXP(userId, badge.xp_bonus, 'badge_earned', badge.id);
      await publishEvent('stream:badge_unlocked', {
        user_id: userId, badge_slug: badge.slug, badge_name: badge.name, xp_bonus: badge.xp_bonus.toString()
      });
    }
  }
}
```

---

# PHASE 9 — PAYMENT SERVICE (Node.js :3006)

## Endpoints
```
POST /api/v1/payments/order     Auth       Create Razorpay order
POST /api/v1/payments/webhook   Public     Razorpay webhook (HMAC-SHA256)
GET  /api/v1/payments/history   Auth       Payment history
```

## Razorpay Order Creation
```typescript
import Razorpay from 'razorpay';
const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

const TIER_PRICES = { beginner: 29900, intermediate: 59900, pro: 99900 }; // paise

async function createOrder(userId: string, tier: string) {
  const amount = TIER_PRICES[tier];
  if (!amount) throw new AppError('INVALID_TIER', 400);

  const order = await razorpay.orders.create({
    amount, currency: 'INR', receipt: `rcpt_${userId}_${Date.now()}`,
  });

  const idempotencyKey = `${order.id}_order_created`;
  await prisma.payments.create({
    data: { user_id: userId, razorpay_order_id: order.id, amount_paise: amount,
            tier_purchased: tier, idempotency_key: idempotencyKey, status: 'pending' }
  });

  return { razorpay_order_id: order.id, amount_paise: amount, currency: 'INR',
           razorpay_key_id: process.env.RAZORPAY_KEY_ID };
}
```

## Webhook Handler (HMAC-SHA256 + Idempotency)
```typescript
async function handleWebhook(req: RawRequest, res: Response) {
  // 1. Verify signature
  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.rawBody).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(req.rawBody);

  // 2. Idempotency check
  const idempKey = `${event.payload.payment?.entity?.order_id || event.payload.subscription?.entity?.id}_${event.event}`;
  const existing = await prisma.payments.findFirst({ where: { idempotency_key: idempKey } });
  if (existing && existing.status !== 'pending') {
    return res.status(200).json({ status: 'already_processed' });
  }

  // 3. Route by event type
  switch (event.event) {
    case 'payment.captured':
      await handlePaymentCaptured(event.payload.payment.entity);
      break;
    case 'payment.failed':
      await handlePaymentFailed(event.payload.payment.entity);
      break;
    case 'subscription.halted':
      await handleSubscriptionHalted(event.payload.subscription.entity);
      break;
  }

  return res.status(200).json({ status: 'received' });
}

async function handlePaymentCaptured(payment: any) {
  const paymentRecord = await prisma.payments.findFirst({ where: { razorpay_order_id: payment.order_id } });
  if (!paymentRecord) return;

  // Update payment status
  await prisma.payments.update({ where: { id: paymentRecord.id },
    data: { status: 'captured', razorpay_payment_id: payment.id, razorpay_event_payload: payment }
  });

  // Update subscription tier (atomic transaction)
  await prisma.$transaction([
    prisma.subscriptions.upsert({
      where: { user_id: paymentRecord.user_id },
      create: { user_id: paymentRecord.user_id, tier: paymentRecord.tier_purchased, status: 'active',
                current_period_start: new Date(), current_period_end: addMonths(new Date(), 1) },
      update: { tier: paymentRecord.tier_purchased, status: 'active',
                current_period_start: new Date(), current_period_end: addMonths(new Date(), 1),
                cancel_at_period_end: false },
    }),
  ]);
  // Trigger sync_user_tier auto-updates users.tier

  // Bust permission cache
  await redis.del(`perm:${paymentRecord.user_id}`);

  // Publish events
  await publishEvent('stream:payment_succeeded', {
    user_id: paymentRecord.user_id, amount_paise: paymentRecord.amount_paise.toString(),
    tier_purchased: paymentRecord.tier_purchased, razorpay_payment_id: payment.id
  });
  await publishEvent('stream:subscription_upgraded', {
    user_id: paymentRecord.user_id, new_tier: paymentRecord.tier_purchased
  });
}
```

---

# PHASE 10 — LIVE CLASS SERVICE (Node.js :3007)

## Endpoints
```
GET  /api/v1/live/classes              Auth beginner+   List upcoming/past classes
POST /api/v1/live/classes/:id/join     Auth tier-dep    Generate Zoom SDK JWT
POST /api/v1/live/classes/:id/register Auth tier-dep    Register for class
POST /api/v1/live/webhook              Public           Zoom attendance webhooks
```

## Zoom SDK JWT Generation
```typescript
import jwt from 'jsonwebtoken';

function generateZoomSDKJWT(meetingNumber: string, role: number = 0): string {
  return jwt.sign({
    sdkKey: process.env.ZOOM_SDK_KEY,
    mn: meetingNumber,
    role, // 0=attendee, 1=host
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 1800, // 30 min
    tokenExp: Math.floor(Date.now() / 1000) + 1800,
  }, process.env.ZOOM_SDK_SECRET!, { algorithm: 'HS256' });
}
```

## Zoom Webhook → Attendance
```typescript
async function handleZoomWebhook(event: any) {
  if (event.event === 'meeting.participant_joined') {
    const userId = await lookupUserByZoomParticipantId(event.payload.object.participant.id);
    await prisma.zoom_sessions.upsert({
      where: { /* user_id + class_id composite */ },
      create: { user_id: userId, class_id: classId, zoom_participant_id: event.payload.object.participant.id,
                joined_at: new Date(event.payload.object.participant.join_time) },
      update: { joined_at: new Date(event.payload.object.participant.join_time) },
    });
  }

  if (event.event === 'meeting.participant_left') {
    const session = await prisma.zoom_sessions.findFirst({ /* match */ });
    const durationMins = Math.floor((new Date(event.payload.object.participant.leave_time) - session.joined_at) / 60000);
    const valid = durationMins >= 15;

    await prisma.zoom_sessions.update({
      where: { id: session.id },
      data: { left_at: new Date(), duration_mins: durationMins, attendance_valid: valid, xp_earned: valid ? 75 : 0 }
    });

    if (valid) {
      await publishEvent('stream:class_attended', {
        user_id: session.user_id, class_id: session.class_id, duration_mins: durationMins.toString()
      });
    }
  }
}
```

---

# PHASE 11 — ANALYTICS SERVICE (Python :3008)

```
GET /api/v1/analytics/dashboard    Auth       Cached 5min, aggregated from PG
GET /api/v1/analytics/cohort       Admin      Cohort analytics
```

## Dashboard Aggregation
```python
@router.get("/analytics/dashboard")
async def get_dashboard(request: Request):
    user = request.state.user
    cached = await redis.get(f"dashboard_cache:{user.id}")
    if cached: return json.loads(cached)

    data = {
        "user": {"name": user.name, "tier": user.tier, "avatar_url": user.avatar_url},
        "xp": await get_xp_data(user.id),
        "leaderboard_rank": await redis.zrevrank("leaderboard:global", user.id),
        "streak": await get_streak(user.id),
        "courses_enrolled": await count_enrollments(user.id),
        "lessons_completed": await count_completed(user.id),
        "recent_achievements": await get_recent_badges(user.id, limit=5),
        "weekly_xp_chart": await get_weekly_xp(user.id),
        "upcoming_live_classes": await get_upcoming_classes(user.id),
    }

    await redis.set(f"dashboard_cache:{user.id}", json.dumps(data), ex=300)
    return data
```

---

# PHASE 12 — NOTIFICATION SERVICE (Node.js :3009)

```
GET   /api/v1/notifications           Auth     Paginated notifications
PATCH /api/v1/notifications/:id/read  Auth     Mark as read
```

## Event Consumers
Consumes: `stream:badge_unlocked`, `stream:level_up`, `stream:payment_succeeded`, `stream:payment_failed`, `stream:user_registered`

For each event: INSERT into `notifications` table + dispatch Brevo email via API.

```typescript
const BREVO_TEMPLATES = {
  user_registered: { templateId: 1, subject: 'Welcome to CyberScout!' },
  payment_succeeded: { templateId: 2, subject: 'Payment Confirmed' },
  badge_unlocked: { templateId: 3, subject: 'New Badge Earned!' },
  level_up: { templateId: 4, subject: 'Level Up!' },
};

async function sendEmail(userId: string, template: string, variables: Record<string, string>) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  const config = BREVO_TEMPLATES[template];

  const result = await brevoClient.send({
    to: [{ email: user.email, name: user.name }],
    templateId: config.templateId,
    params: variables,
  });

  await prisma.email_log.create({
    data: { user_id: userId, template, to_email: user.email,
            subject: config.subject, brevo_msg_id: result.messageId, status: 'sent', sent_at: new Date() }
  });
}
```

---

# PHASE 13 — DOCKER COMPOSE + TRAEFIK

Create `infra/docker-compose.yml` with all 9 services + PostgreSQL + Redis + Qdrant + Traefik.

Each service:
- Has its own `Dockerfile` (Node.js → `node:20-alpine`, Go → `golang:1.22-alpine` multi-stage, Python → `python:3.11-slim`)
- Connects to `cybersec-net` bridge network
- Has `restart: unless-stopped`
- Has Traefik labels for path-based routing
- Depends on postgres + redis (+ qdrant for ai-tutor)

Traefik handles TLS via Let's Encrypt ACME, rate limiting (100 req/min per IP), and JWT validation can be done via Traefik middleware or per-service.

**See the SDEL1 refactor spec Part 9 for the complete docker-compose.yml — implement it exactly.**

---

# PHASE 14 — AI KNOWLEDGE INGESTION (Qdrant + LangChain)

Create `services/ai-tutor/scripts/ingest_content.py`:

```python
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from langchain.text_splitter import RecursiveCharacterTextSplitter
import psycopg2, uuid

model = SentenceTransformer("all-MiniLM-L6-v2")
qdrant = QdrantClient(url="http://qdrant:6333")
splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)

# Create collection
qdrant.recreate_collection("cybersec_knowledge",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE))

# Fetch lessons from PG
conn = psycopg2.connect(dsn)
cur = conn.cursor()
cur.execute("SELECT l.id, l.course_id, l.title, l.tier_required, l.content_r2_key FROM lessons l WHERE l.is_published = true")

for lesson_id, course_id, title, tier, content_key in cur.fetchall():
    # Load content from R2 (or local for dev)
    content = load_from_r2(content_key)
    chunks = splitter.split_text(content)

    for i, chunk_text in enumerate(chunks):
        point_id = str(uuid.uuid4())
        vector = model.encode(chunk_text).tolist()

        # Upsert to Qdrant
        qdrant.upsert("cybersec_knowledge", [PointStruct(
            id=point_id, vector=vector,
            payload={"course_id": str(course_id), "lesson_id": str(lesson_id),
                     "tier_required": tier, "chunk_text": chunk_text, "chunk_index": i}
        )])

        # Mirror to PostgreSQL
        cur.execute("INSERT INTO knowledge_chunks (id, course_id, lesson_id, chunk_index, chunk_text, tier_required, token_count) "
                    "VALUES (%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING",
                    (point_id, course_id, lesson_id, i, chunk_text, tier, len(chunk_text.split())))

conn.commit()
```

---

# PHASE 15 — FRONTEND UPDATES

1. **Update `mobile/src/utils/constants.js`**: Change tiers to `free/beginner/intermediate/pro`
2. **Update `SubscriptionScreen`**: 4 plans with ₹ pricing
3. **Remove** `MentorListScreen`, `BookingScreen` — not in SDEL1 scope
4. **Update** `useSubscription` hook for 4-tier hierarchy
5. **Add Razorpay Checkout** integration (replace any Stripe references)
6. **Update ChatScreen**: Show `quota_remaining` from SSE `done` event

---

# PHASE 16 — REDIS STREAMS EVENT WIRING

Verify every consumer is wired:

| Stream | Consumer Service | Consumer Group |
|--------|-----------------|----------------|
| stream:lesson_completed | gamification, notification, analytics | gamification-consumers, notification-consumers, analytics-consumers |
| stream:course_enrolled | gamification | gamification-consumers |
| stream:payment_succeeded | user, notification, analytics | user-consumers, notification-consumers, analytics-consumers |
| stream:payment_failed | notification | notification-consumers |
| stream:badge_unlocked | notification | notification-consumers |
| stream:level_up | notification | notification-consumers |
| stream:class_attended | gamification | gamification-consumers |
| stream:login_streak | gamification | gamification-consumers |
| stream:user_registered | notification, analytics | notification-consumers, analytics-consumers |
| stream:subscription_upgraded | auth (cache bust), notification | auth-consumers, notification-consumers |
| stream:ai_query_logged | analytics | analytics-consumers |

---

# PHASE 17 — TESTING & VERIFICATION

1. **All Docker containers start**: `docker compose up -d && docker compose ps`
2. **Health checks pass**: `curl localhost:300{1..9}/health`
3. **PostgreSQL migration ran**: all 17 tables exist
4. **Redis connects**: `redis-cli -a $REDIS_PASS ping`
5. **Qdrant collection exists**: `curl localhost:6333/collections/cybersec_knowledge`
6. **Auth flow works**: Google OAuth → JWT → refresh → logout
7. **Tier gating works**: Free user blocked from beginner content
8. **AI query works**: POST /ai/query returns SSE stream
9. **Gamification events flow**: lesson_completed → XP awarded → leaderboard updated
10. **Payment webhook works**: Razorpay webhook → tier updated
11. **TypeScript compiles**: `npm run build` in every Node.js service
12. **Go builds**: `go build ./...` in course service
13. **Python runs**: `uvicorn app.main:app` in ai-tutor and analytics

**Report what was built, what's working, and what needs manual API key setup.**
