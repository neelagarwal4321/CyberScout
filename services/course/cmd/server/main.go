package main

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cyberscout/course-service/internal/handlers"
	"github.com/cyberscout/course-service/internal/middleware"
	"github.com/cyberscout/course-service/internal/repository"
	"github.com/cyberscout/course-service/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func main() {
	ctx := context.Background()

	// Database
	pool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Cannot connect to postgres: %v", err)
	}
	defer pool.Close()

	// Redis
	opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))
	if err != nil {
		log.Fatalf("Cannot parse redis URL: %v", err)
	}
	rdb := redis.NewClient(opt)
	defer rdb.Close()

	// JWT public key
	pubKeyBytes, err := os.ReadFile(os.Getenv("JWT_PUBLIC_KEY_FILE"))
	if err != nil {
		log.Fatalf("Cannot read JWT public key: %v", err)
	}
	block, _ := pem.Decode(pubKeyBytes)
	pubKeyIface, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		log.Fatalf("Cannot parse JWT public key: %v", err)
	}
	publicKey := pubKeyIface.(*rsa.PublicKey)

	// Repos + services
	courseRepo := repository.NewCourseRepository(pool)
	presignSvc := services.NewPresignService(
		os.Getenv("R2_ACCOUNT_ID"),
		os.Getenv("R2_ACCESS_KEY"),
		os.Getenv("R2_SECRET_KEY"),
		os.Getenv("R2_BUCKET"),
	)
	progressSvc := services.NewProgressService(pool, rdb)

	// Router
	r := gin.New()
	r.Use(gin.Recovery())

	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok", "service": "course"}) })

	v1 := r.Group("/api/v1", middleware.AuthMiddleware(publicKey, rdb))
	{
		courseHandler := handlers.NewCourseHandler(courseRepo, presignSvc, progressSvc, rdb)
		v1.GET("/courses", courseHandler.ListCourses)
		v1.GET("/courses/:id", courseHandler.GetCourse)
		v1.POST("/courses/:id/enroll", courseHandler.EnrollCourse)
		v1.GET("/lessons/:id/content", courseHandler.GetLessonContent)
		v1.POST("/progress", courseHandler.SyncProgress)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3003"
	}

	srv := &http.Server{Addr: fmt.Sprintf(":%s", port), Handler: r}

	go func() {
		log.Printf("Course service listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down...")

	ctxTimeout, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(ctxTimeout)
}
