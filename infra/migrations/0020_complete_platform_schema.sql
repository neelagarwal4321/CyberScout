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