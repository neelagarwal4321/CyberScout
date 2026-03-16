.PHONY: up down build logs ps health migrate ingest keys

# Start all services
up:
	cd infra && docker compose up -d

# Stop all services
down:
	cd infra && docker compose down

# Build all images
build:
	cd infra && docker compose build

# View logs
logs:
	cd infra && docker compose logs -f

# Show running containers
ps:
	cd infra && docker compose ps

# Health check all services
health:
	@for port in 3001 3002 3003 3004 3005 3006 3007 3008 3009; do \
		echo -n "Port $$port: "; \
		curl -sf http://localhost:$$port/health 2>/dev/null || echo "DOWN"; \
	done

# Run DB migration
migrate:
	docker exec cyberscout-postgres psql -U cyberscout -d cyberscout_db -f /migrations/0020_complete_platform_schema.sql

# Ingest AI content into Qdrant
ingest:
	cd services/ai-tutor && python scripts/ingest_content.py

# Generate new RSA keys
keys:
	mkdir -p infra/secrets
	openssl genrsa -out infra/secrets/jwt_private.pem 4096
	openssl rsa -in infra/secrets/jwt_private.pem -pubout -out infra/secrets/jwt_public.pem

# Install all Node.js service deps
install-node:
	for svc in auth user gamification payment live-class notification; do \
		cd services/$$svc && npm install && cd ../..; \
	done

# Build all Node.js services (TypeScript check)
build-node:
	for svc in auth user gamification payment live-class notification; do \
		echo "Building $$svc..." && cd services/$$svc && npm run build && cd ../..; \
	done

# Build Go service
build-go:
	cd services/course && go build ./...

# Dev: start infra only (postgres, redis, qdrant)
infra-only:
	cd infra && docker compose up -d postgres redis qdrant
