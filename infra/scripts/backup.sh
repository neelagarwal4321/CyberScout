#!/bin/bash
set -e
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"
echo "Creating backup: $BACKUP_FILE"
docker exec cyberscout-postgres pg_dump -U cyberscout cyberscout_db > "$BACKUP_FILE"
echo "Backup saved to $BACKUP_FILE"
