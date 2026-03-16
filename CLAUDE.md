# CyberScout — CLAUDE.md

## ⚠️ CRITICAL: DO NOT TOUCH FRONTEND
The React Native frontend lives at the project root. These files are FROZEN:
- `./App.js`, `./app.json`, `./package.json` (root)
- `./src/**` — entire frontend source tree
All backend work goes in `./services/` and `./infra/` ONLY.

---

## Architecture

```
CLIENT (React Native) → Cloudflare CDN → Traefik (:80/:443)
                                              │
        ┌─────────────────────────────────────┤
        │         PATH-BASED ROUTING          │
        ├─────────┬────────┬──────┬──────────┤
      auth      user    course   ai-tutor   gamif
      :3001     :3002   :3003    :3004      :3005
      Node      Node     Go      Python     Node
        ├────────┬────────┬──────────────────┤
      payment  live    analytics  notification
      :3006    :3007    :3008      :3009
      Node     Node    Python      Node
        │        │        │
   ┌────┴────┐ ┌─┴──┐  ┌──┴───┐
   │PostgreSQL│ │Redis│  │Qdrant│
   │(17 tables│ │  7  │  │384-d │
   └──────────┘ └─────┘  └──────┘
```

## Subscription Tiers (INR)
| Tier         | ₹/mo | AI/day | Live Classes    |
|--------------|------|--------|-----------------|
| free         | ₹0   | 10     | Recordings only |
| beginner     | ₹299 | 50     | 1/month         |
| intermediate | ₹599 | 100    | 4/month         |
| pro          | ₹999 | ∞      | Unlimited       |

## Technology Stack
| Service       | Lang          | Framework   | Port |
|---------------|---------------|-------------|------|
| auth          | Node.js/TS    | Express     | 3001 |
| user          | Node.js/TS    | Express     | 3002 |
| course        | Go 1.22       | Gin         | 3003 |
| ai-tutor      | Python 3.11   | FastAPI     | 3004 |
| gamification  | Node.js/TS    | Express     | 3005 |
| payment       | Node.js/TS    | Express     | 3006 |
| live-class    | Node.js/TS    | Express     | 3007 |
| analytics     | Python 3.11   | FastAPI     | 3008 |
| notification  | Node.js/TS    | Express     | 3009 |

## Key Design Decisions
- **Auth**: Google OAuth2 + PKCE only (no email/password). RS256 JWT (15m access, 7d refresh)
- **Payments**: Razorpay (INR paise) — NOT Stripe
- **AI**: Groq llama3-8b-8192 streaming + Qdrant 384-dim vectors + sentence-transformers/all-MiniLM-L6-v2 (local CPU)
- **Events**: Redis Streams XADD/XREADGROUP — NOT pub/sub
- **Gateway**: Traefik — NOT an Express proxy service
- **JWT signing**: RSA 4096-bit private key in `infra/secrets/` (gitignored)

## Directory Layout
```
services/auth/         Node.js :3001 — Google OAuth, RS256 JWT
services/user/         Node.js :3002 — Profile, Subscription
services/course/       Go :3003     — Catalog, R2 pre-signed URLs, Progress
services/ai-tutor/     Python :3004 — LangGraph RAG, Groq SSE streaming
services/gamification/ Node.js :3005 — XP, Badges, Leaderboard
services/payment/      Node.js :3006 — Razorpay orders + webhooks
services/live-class/   Node.js :3007 — Zoom SDK JWT, Attendance
services/analytics/    Python :3008 — Dashboard aggregation
services/notification/ Node.js :3009 — Brevo email + in-app
infra/
  docker-compose.yml   All 13 containers
  traefik/             Traefik config
  secrets/             jwt_private.pem, jwt_public.pem (gitignored)
  migrations/          0020_complete_platform_schema.sql (17 tables)
  scripts/             migrate.sh, backup.sh, ingest-content.sh
```

## Redis Key Patterns
```
refresh_token:{sha256}      → user_id          (EX 604800)
jti_block:{jti}             → "1"              (EX 900)
perm:{user_id}              → tier             (EX 300)
ai:quota:{user_id}:{date}   → count            (EX 86400)
resp_cache:{sha256}         → response_json    (EX 3600)
leaderboard:global          → ZADD {xp} {uid}
leaderboard:monthly:{YYYY-MM}
dashboard_cache:{user_id}   → json             (EX 300)
rate:{ip}:{minute_bucket}   → count            (EX 60)
```

## Redis Streams Event Bus
| Stream                   | Published by | Consumed by              |
|--------------------------|-------------|--------------------------|
| stream:lesson_completed  | course      | gamification, notification, analytics |
| stream:course_enrolled   | course      | gamification             |
| stream:payment_succeeded | payment     | user, notification, analytics |
| stream:payment_failed    | payment     | notification             |
| stream:badge_unlocked    | gamification| notification             |
| stream:level_up          | gamification| notification             |
| stream:class_attended    | live-class  | gamification             |
| stream:login_streak      | auth        | gamification             |
| stream:user_registered   | auth        | notification, analytics  |
| stream:subscription_upgraded | payment | auth (cache bust), notification |
| stream:ai_query_logged   | ai-tutor    | analytics                |

## XP / Level System
| Level | Name              | Min XP |
|-------|-------------------|--------|
| 1     | Script Kiddie     | 0      |
| 2     | Packet Sniffer    | 500    |
| 3     | Firewall Breaker  | 1,500  |
| 4     | Cipher Cracker    | 3,000  |
| 5     | Exploit Hunter    | 5,000  |
| 6     | Zero Day Finder   | 8,000  |
| 7     | Incident Commander| 12,000 |
| 8     | Cyber Sentinel    | 20,000 |

## Developer Commands
```bash
make up           # Start all Docker services
make down         # Stop everything
make health       # Curl all 9 /health endpoints
make migrate      # Run SQL migration on running postgres
make ingest       # Run AI content ingestion
make infra-only   # Start only postgres+redis+qdrant
```

## API Response Envelope
All endpoints return:
- Success: `{ "data": T }`
- Error: `{ "error": { "code": string, "message": string, "statusCode": number } }`

## Environment Setup
1. Copy `.env.example` → `.env` and fill in secrets
2. RSA keys are in `infra/secrets/` (generated, gitignored)
3. Start infra: `docker compose -f infra/docker-compose.yml up -d`
4. Run migration: `make migrate`
5. Ingest AI content: `make ingest` (after adding lessons to DB)
