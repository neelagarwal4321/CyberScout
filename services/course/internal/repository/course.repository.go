package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Course struct {
	ID           string  `json:"id"`
	Slug         string  `json:"slug"`
	Title        string  `json:"title"`
	Description  *string `json:"description"`
	TierRequired string  `json:"tier_required"`
	Category     *string `json:"category"`
	Difficulty   int     `json:"difficulty"`
	IsPublished  bool    `json:"is_published"`
	SortOrder    int     `json:"sort_order"`
}

type Lesson struct {
	ID           string `json:"id"`
	CourseID     string `json:"course_id"`
	Title        string `json:"title"`
	ContentR2Key string `json:"content_r2_key"`
	ContentType  string `json:"content_type"`
	DurationMins *int   `json:"duration_mins"`
	TierRequired string `json:"tier_required"`
	SortOrder    int    `json:"sort_order"`
	XpReward     int    `json:"xp_reward"`
	HasQuiz      bool   `json:"has_quiz"`
	IsPublished  bool   `json:"is_published"`
}

type CourseRepository struct {
	pool *pgxpool.Pool
}

func NewCourseRepository(pool *pgxpool.Pool) *CourseRepository {
	return &CourseRepository{pool: pool}
}

func (r *CourseRepository) ListPublished(ctx context.Context, tier, category string, page, limit int) ([]Course, int, error) {
	offset := (page - 1) * limit
	rows, err := r.pool.Query(ctx,
		`SELECT id, slug, title, description, tier_required, category, difficulty, is_published, sort_order
		 FROM courses WHERE is_published = true
		 ORDER BY sort_order, created_at
		 LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var courses []Course
	for rows.Next() {
		var c Course
		err := rows.Scan(&c.ID, &c.Slug, &c.Title, &c.Description, &c.TierRequired, &c.Category, &c.Difficulty, &c.IsPublished, &c.SortOrder)
		if err != nil {
			return nil, 0, err
		}
		courses = append(courses, c)
	}

	var total int
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM courses WHERE is_published = true").Scan(&total)

	return courses, total, nil
}

func (r *CourseRepository) FindByID(ctx context.Context, id string) (*Course, []Lesson, error) {
	var c Course
	err := r.pool.QueryRow(ctx,
		`SELECT id, slug, title, description, tier_required, category, difficulty, is_published, sort_order
		 FROM courses WHERE id = $1`, id).
		Scan(&c.ID, &c.Slug, &c.Title, &c.Description, &c.TierRequired, &c.Category, &c.Difficulty, &c.IsPublished, &c.SortOrder)
	if err != nil {
		return nil, nil, err
	}

	rows, err := r.pool.Query(ctx,
		`SELECT id, course_id, title, content_r2_key, content_type, duration_mins, tier_required, sort_order, xp_reward, has_quiz, is_published
		 FROM lessons WHERE course_id = $1 AND is_published = true ORDER BY sort_order`, id)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var lessons []Lesson
	for rows.Next() {
		var l Lesson
		rows.Scan(&l.ID, &l.CourseID, &l.Title, &l.ContentR2Key, &l.ContentType, &l.DurationMins, &l.TierRequired, &l.SortOrder, &l.XpReward, &l.HasQuiz, &l.IsPublished)
		lessons = append(lessons, l)
	}

	return &c, lessons, nil
}

func (r *CourseRepository) FindLessonByID(ctx context.Context, id string) (*Lesson, error) {
	var l Lesson
	err := r.pool.QueryRow(ctx,
		`SELECT id, course_id, title, content_r2_key, content_type, duration_mins, tier_required, sort_order, xp_reward, has_quiz, is_published
		 FROM lessons WHERE id = $1`, id).
		Scan(&l.ID, &l.CourseID, &l.Title, &l.ContentR2Key, &l.ContentType, &l.DurationMins, &l.TierRequired, &l.SortOrder, &l.XpReward, &l.HasQuiz, &l.IsPublished)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

func (r *CourseRepository) CreateEnrollment(ctx context.Context, userID, courseID string) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO course_enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		userID, courseID)
	return err
}

func (r *CourseRepository) GetEnrolledCourseIDs(ctx context.Context, userID string) ([]string, error) {
	rows, err := r.pool.Query(ctx, `SELECT course_id FROM course_enrollments WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []string
	for rows.Next() {
		var id string
		rows.Scan(&id)
		ids = append(ids, id)
	}
	return ids, nil
}
