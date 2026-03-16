package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/cyberscout/course-service/internal/middleware"
	"github.com/cyberscout/course-service/internal/repository"
	"github.com/cyberscout/course-service/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type CourseHandler struct {
	repo        *repository.CourseRepository
	presignSvc  *services.PresignService
	progressSvc *services.ProgressService
	rdb         *redis.Client
}

func NewCourseHandler(repo *repository.CourseRepository, presign *services.PresignService, progress *services.ProgressService, rdb *redis.Client) *CourseHandler {
	return &CourseHandler{repo: repo, presignSvc: presign, progressSvc: progress, rdb: rdb}
}

func (h *CourseHandler) ListCourses(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	tier := c.Query("tier")
	category := c.Query("category")

	courses, total, err := h.repo.ListPublished(c.Request.Context(), tier, category, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"courses": courses, "total": total, "page": page, "limit": limit}})
}

func (h *CourseHandler) GetCourse(c *gin.Context) {
	course, lessons, err := h.repo.FindByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "Course not found"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"course": course, "lessons": lessons}})
}

func (h *CourseHandler) GetLessonContent(c *gin.Context) {
	user := c.MustGet("user").(*middleware.UserInfo)
	lesson, err := h.repo.FindLessonByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "Lesson not found"}})
		return
	}

	if !lesson.IsPublished {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "Lesson not found"}})
		return
	}

	tierRank := middleware.TierRank
	if tierRank[user.Tier] < tierRank[lesson.TierRequired] {
		c.JSON(http.StatusForbidden, gin.H{"error": gin.H{"code": "TIER_INSUFFICIENT", "message": "Upgrade to access this content", "upgrade_url": "/pricing"}})
		return
	}

	presignedURL, expiresAt, err := h.presignSvc.GeneratePresignedURL(lesson.ContentR2Key, 300)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "PRESIGN_ERROR", "message": "Failed to generate content URL"}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"content_url":  presignedURL,
		"expires_at":   expiresAt,
		"content_type": lesson.ContentType,
		"watermark":    user.Email,
	}})
}

func (h *CourseHandler) EnrollCourse(c *gin.Context) {
	user := c.MustGet("user").(*middleware.UserInfo)
	courseID := c.Param("id")

	course, _, err := h.repo.FindByID(c.Request.Context(), courseID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "Course not found"}})
		return
	}

	tierRank := middleware.TierRank
	if tierRank[user.Tier] < tierRank[course.TierRequired] {
		c.JSON(http.StatusForbidden, gin.H{"error": gin.H{"code": "TIER_INSUFFICIENT", "message": "Upgrade to enroll"}})
		return
	}

	if err := h.repo.CreateEnrollment(c.Request.Context(), user.ID, courseID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to enroll"}})
		return
	}

	h.rdb.XAdd(context.Background(), &redis.XAddArgs{
		Stream: "stream:course_enrolled",
		Values: map[string]interface{}{"user_id": user.ID, "course_id": courseID},
	})

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"enrolled": true, "course_id": courseID}})
}

func (h *CourseHandler) SyncProgress(c *gin.Context) {
	user := c.MustGet("user").(*middleware.UserInfo)

	var body struct {
		LessonID string `json:"lesson_id" binding:"required"`
		Status   string `json:"status" binding:"required"`
		Score    int    `json:"score"`
		TimeSecs int    `json:"time_spent_secs"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	if err := h.progressSvc.SyncProgress(c.Request.Context(), user.ID, body.LessonID, body.Status, body.Score, body.TimeSecs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to sync progress"}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"synced": true}})
}
