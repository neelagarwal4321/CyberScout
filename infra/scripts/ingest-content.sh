#!/bin/bash
set -e
echo "Running AI content ingestion..."
docker exec cyberscout-ai-tutor python scripts/ingest_content.py
echo "Ingestion complete."
