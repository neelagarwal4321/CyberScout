package services

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type ProgressService struct {
	pool *pgxpool.Pool
	rdb  *redis.Client
}

func NewProgressService(pool *pgxpool.Pool, rdb *redis.Client) *ProgressService {
	return &ProgressService{pool: pool, rdb: rdb}
}

func (s *ProgressService) SyncProgress(ctx context.Context, userID, lessonID, status string, score, timeSecs int) error {
	// Check if already completed
	var prevStatus string
	s.pool.QueryRow(ctx, `SELECT status FROM user_progress WHERE user_id = $1 AND lesson_id = $2`, userID, lessonID).Scan(&prevStatus)

	now := time.Now()
	var completedAt *time.Time
	if status == "completed" {
		completedAt = &now
	}

	_, err := s.pool.Exec(ctx, `
		INSERT INTO user_progress (user_id, lesson_id, status, score, time_spent_secs, completed_at, attempt_count)
		VALUES ($1, $2, $3, $4, $5, $6, 1)
		ON CONFLICT (user_id, lesson_id) DO UPDATE SET
			status = EXCLUDED.status,
			score = COALESCE(EXCLUDED.score, user_progress.score),
			time_spent_secs = user_progress.time_spent_secs + EXCLUDED.time_spent_secs,
			attempt_count = user_progress.attempt_count + 1,
			completed_at = COALESCE(user_progress.completed_at, EXCLUDED.completed_at),
			updated_at = NOW()`,
		userID, lessonID, status, score, timeSecs, completedAt)
	if err != nil {
		return err
	}

	// Award XP on first completion
	if status == "completed" && prevStatus != "completed" {
		var xpReward int
		var courseID string
		s.pool.QueryRow(ctx, `SELECT xp_reward, course_id FROM lessons WHERE id = $1`, lessonID).Scan(&xpReward, &courseID)

		// Get current balance
		var currentXP int
		s.pool.QueryRow(ctx, `SELECT xp_total FROM users WHERE id = $1`, userID).Scan(&currentXP)
		balanceAfter := currentXP + xpReward

		_, err = s.pool.Exec(ctx, `
			INSERT INTO xp_ledger (user_id, delta, reason, reference_id, balance_after)
			VALUES ($1, $2, 'lesson_completed', $3::uuid, $4)`,
			userID, xpReward, lessonID, balanceAfter)
		if err != nil {
			return err
		}

		// Publish event
		s.rdb.XAdd(ctx, &redis.XAddArgs{
			Stream: "stream:lesson_completed",
			Values: map[string]interface{}{
				"user_id": userID, "lesson_id": lessonID, "course_id": courseID,
				"score": fmt.Sprintf("%d", score), "xp_earned": fmt.Sprintf("%d", xpReward),
				"timestamp": fmt.Sprintf("%d", now.Unix()),
			},
		})
	}

	return nil
}
