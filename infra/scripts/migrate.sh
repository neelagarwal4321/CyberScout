#!/bin/bash
set -e
echo "Running database migration..."
docker exec cyberscout-postgres psql -U cyberscout -d cyberscout_db -f /migrations/0020_complete_platform_schema.sql
echo "Migration complete."
