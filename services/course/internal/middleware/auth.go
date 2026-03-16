package middleware

import (
	"context"
	"crypto/rsa"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
)

type Claims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Tier  string `json:"tier"`
	jwt.RegisteredClaims
}

type UserInfo struct {
	ID    string
	Email string
	Tier  string
}

const TierRankKey = "tierRank"

var TierRank = map[string]int{"free": 0, "beginner": 1, "intermediate": 2, "pro": 3}

func AuthMiddleware(publicKey *rsa.PublicKey, rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "AUTH_REQUIRED", "message": "Missing token", "statusCode": 401}})
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &Claims{}
		parsed, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
			return publicKey, nil
		}, jwt.WithValidMethods([]string{"RS256"}))

		if err != nil || !parsed.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "AUTH_INVALID", "message": "Invalid token", "statusCode": 401}})
			return
		}

		// Check JTI blocklist
		jti := claims.ID
		blocked, _ := rdb.Get(context.Background(), "jti_block:"+jti).Result()
		if blocked != "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "TOKEN_REVOKED", "message": "Token revoked", "statusCode": 401}})
			return
		}

		c.Set("user", &UserInfo{ID: claims.Sub, Email: claims.Email, Tier: claims.Tier})
		c.Next()
	}
}

func RequireTier(minTier string) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := c.MustGet("user").(*UserInfo)
		if TierRank[user.Tier] < TierRank[minTier] {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": gin.H{"code": "TIER_INSUFFICIENT", "message": "Requires " + minTier + " subscription", "upgrade_url": "/pricing", "statusCode": 403}})
			return
		}
		c.Next()
	}
}
