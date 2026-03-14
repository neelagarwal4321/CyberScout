# CLAUDE.md — CyberScout Project Intelligence

## What This Project Is
**CyberScout** is a mobile-first cybersecurity learning platform.
- **Frontend:** React Native (Expo managed workflow)
- **Backend:** Node.js/TypeScript microservices (6 services + API gateway)
- **AI:** Multi-agentic RAG pipeline for the chatbot
- **Subscription tiers:** Free / Pro ($19/mo) / Max ($49/mo)

## Current State
The project has Figma designs exported into `figma-exports/` alongside existing React Native code scaffolding in `mobile/`. The goal is to rebuild/refine the frontend to pixel-match the Figma exports, build the full backend, wire everything together, and ultimately containerize the whole system.

---

## Critical Rules — READ FIRST

1. **TypeScript everywhere** in backend. Frontend stays `.jsx` (React Native + Expo convention).
2. **Never hardcode secrets.** Use `.env` files. Reference `process.env.VAR_NAME`.
3. **Every API response** must use the standard envelope: `{ data: T }` for success, `{ error: { code, message, statusCode, requestId } }` for errors.
4. **All list endpoints** must support pagination: `?page=1&perPage=20&sort=created_at&order=desc`.
5. **UUID v7** for all primary keys (`crypto.randomUUID()` or `uuid` package).
6. **Zod validation** on every request body and query parameter at the controller level.
7. **Prisma** is the ORM. Schema lives in `backend/packages/db-client/prisma/schema.prisma`.
8. **Redis** for sessions, caching, rate limiting, pub/sub between services.
9. **All inter-service calls** use HMAC-signed internal endpoints, not JWT.
10. **Tests** go in `__tests__/` directories adjacent to source, suffixed `.test.ts`.

---

## Project Structure

```
cyberscout/
├── CLAUDE.md                          # THIS FILE
├── README.md                          # Full documentation (3000+ lines)
├── figma-exports/                     # Figma Make exported designs (VISUAL TRUTH)
│
├── mobile/                            # React Native frontend (Expo)
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── src/
│       ├── assets/
│       ├── components/                # Reusable UI (PascalCase.jsx)
│       ├── context/                   # AuthContext, ThemeContext, ChatContext, CourseContext
│       ├── hooks/                     # useAuth, useSubscription, useChat
│       ├── navigation/                # AppNavigator (AuthStack ↔ MainTabs)
│       ├── screens/                   # auth/, dashboard/, courses/, chat/, mentorship/, profile/, settings/
│       ├── services/                  # api.js (base client), mockData.js
│       ├── theme/                     # colors.js, typography.js, spacing.js
│       └── utils/                     # constants.js, formatters.js, validators.js
│
├── backend/                           # Node.js/TypeScript microservices
│   ├── docker-compose.yml             # Local dev: all services + PG + Redis
│   ├── .env.example
│   ├── package.json                   # Workspace root (npm workspaces)
│   ├── tsconfig.base.json
│   ├── packages/                      # Shared libraries
│   │   ├── shared-types/              # TypeScript interfaces
│   │   ├── db-client/                 # Prisma client + schema + migrations + seed
│   │   ├── auth-middleware/           # JWT verify, requireTier, requireRole, rateLimit
│   │   ├── error-handler/            # AppError, errorCodes, express error middleware
│   │   ├── logger/                   # Pino with request-id context
│   │   ├── redis-client/             # Redis client + pub/sub + cache helpers
│   │   └── validators/               # Zod schemas (auth, course, chat, common)
│   ├── services/
│   │   ├── api-gateway/     :3000     # Express proxy, CORS, Helmet, route→service
│   │   ├── auth-service/    :3001     # Login, signup, OAuth, tokens, 2FA
│   │   ├── course-service/  :3002     # Courses, lectures, enrollment, progress, reviews
│   │   ├── chat-service/    :3003     # Multi-agentic RAG chatbot + SSE streaming
│   │   ├── billing-service/ :3004     # Stripe subscriptions + webhooks
│   │   ├── live-service/    :3005     # Live sessions + Socket.io real-time chat
│   │   └── mentor-service/  :3006     # Mentor profiles, booking, availability
│   └── scripts/
│
├── docker-compose.yml                 # Root-level: full system orchestration (LATER)
└── .github/workflows/
```

---

## Design System

### Colors (Dark Theme Default)
| Token | Hex | Usage |
|-------|-----|-------|
| bg | #0A0E1A | Screen backgrounds |
| bgSecondary | #111629 | Tab bar, secondary panels |
| surface | #1E2545 | Cards |
| border | #2A3362 | Borders, dividers |
| textPrimary | #EAEEFF | Headings, body |
| textSecondary | #8B95C9 | Labels, descriptions |
| textMuted | #5A6599 | Placeholders |
| cyan | #00E5FF | Primary CTA, active states |
| green | #39FF14 | Success, completed |
| red | #FF3B5C | Errors, live badges |
| orange | #FF9F1C | Streak, ratings |
| purple | #A855F7 | AI, premium features |
| gold | #FFD700 | Max tier |

### Typography
- Headings: Monospace (terminal aesthetic)
- Body: System sans-serif
- Defined in `mobile/src/theme/typography.js`

### Figma Source of Truth
When Figma exports and existing code disagree, **Figma wins** for visual design.

---

## Subscription Tiers

| Feature | Free | Pro | Max |
|---------|------|-----|-----|
| AI chatbot | 50/day | Unlimited | Unlimited + priority |
| Recorded lectures | Module 1 only | Full | Full |
| Live lectures | ❌ | ✅ | ✅ |
| 1:1 mentorship | ❌ | ❌ | 4/month |
| Certificates | ❌ | ✅ | ✅ |

Frontend: `useSubscription()` + `<FeatureGate>`. Backend: `requireTier()` middleware.

---

## Multi-Agentic RAG (Chat Service)

```
Message → RouterAgent → GuardrailAgent → RetrievalAgent → TeachingAgent → AssessmentAgent?
```

- Router: intent classification
- Guardrail: blocks off-topic / harmful
- Retrieval: vector search (Pinecone), hybrid dense+sparse, cross-encoder rerank
- Teaching: Socratic dialogue, adapts to level, cites sources
- Assessment: optional quiz generation, mastery tracking

Sources: OWASP, NIST, MITRE ATT&CK, CIS Benchmarks, course content.

---

## Key API Contracts

```
AUTH:
  POST /api/auth/signup     → { accessToken, refreshToken, user }
  POST /api/auth/login      → { accessToken, refreshToken, user }
  POST /api/auth/refresh    → { accessToken, refreshToken }

COURSES:
  GET  /api/courses          → paginated list
  GET  /api/courses/:id      → course + syllabus
  POST /api/courses/:id/enroll
  PUT  /api/courses/:id/progress

CHAT:
  POST /api/chat/message     → SSE stream (content, citations, suggestedTopics, quiz?)
  GET  /api/chat/conversations

BILLING:
  POST /api/subscription/upgrade → Stripe checkout URL
  POST /api/subscription/cancel

PROFILE:
  GET  /api/profile
  PUT  /api/profile
  GET  /api/certificates
```

Response envelope always: `{ data }` or `{ error: { code, message, statusCode, requestId } }`

---

## Containerization (LATER — Do Not Build Yet)

When instructed, each backend service gets a multi-stage Dockerfile. Root `docker-compose.yml` orchestrates all services + PG + Redis. **Wait for explicit instruction.**

---

## File Naming
| Location | Convention | Example |
|----------|-----------|---------|
| Frontend screens | PascalCase.jsx | `DashboardScreen.jsx` |
| Frontend components | PascalCase.jsx | `CourseCard.jsx` |
| Frontend hooks | camelCase.js | `useSubscription.js` |
| Backend routes | kebab-case.ts | `auth-routes.ts` |
| Backend controllers | PascalCase.ts | `AuthController.ts` |
| Backend services | PascalCase.ts | `AuthService.ts` |
| Backend tests | *.test.ts | `auth.unit.test.ts` |
