package services

import (
	"context"
	"fmt"
	"net/url"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	smithyendpoints "github.com/aws/smithy-go/endpoints"
)

type PresignService struct {
	client *s3.PresignClient
	bucket string
}

type r2Resolver struct {
	accountID string
}

func (r *r2Resolver) ResolveEndpoint(ctx context.Context, params s3.EndpointParameters) (smithyendpoints.Endpoint, error) {
	u, _ := url.Parse(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", r.accountID))
	return smithyendpoints.Endpoint{URI: *u}, nil
}

func NewPresignService(accountID, accessKey, secretKey, bucket string) *PresignService {
	cfg := aws.Config{
		Credentials: credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
		Region:      "auto",
	}
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.EndpointResolverV2 = &r2Resolver{accountID: accountID}
	})
	presignClient := s3.NewPresignClient(client)
	return &PresignService{client: presignClient, bucket: bucket}
}

func (s *PresignService) GeneratePresignedURL(key string, expirySecs int) (string, time.Time, error) {
	req, err := s.client.PresignGetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(time.Duration(expirySecs)*time.Second))
	if err != nil {
		return "", time.Time{}, err
	}
	return req.URL, time.Now().Add(time.Duration(expirySecs) * time.Second), nil
}
