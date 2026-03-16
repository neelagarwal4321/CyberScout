"""
AI Knowledge Ingestion Pipeline — loads lessons from PostgreSQL, chunks them,
embeds with sentence-transformers, and upserts into Qdrant.
Run: python scripts/ingest_content.py
"""
import os, uuid, asyncio
import asyncpg
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from langchain.text_splitter import RecursiveCharacterTextSplitter

DATABASE_URL = os.environ["DATABASE_URL"]
QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")
COLLECTION = os.environ.get("QDRANT_COLLECTION", "cybersec_knowledge")

model = SentenceTransformer("all-MiniLM-L6-v2")
qdrant = QdrantClient(url=QDRANT_URL)
splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)

async def main():
    qdrant.recreate_collection(COLLECTION, vectors_config=VectorParams(size=384, distance=Distance.COSINE))
    print(f"Collection '{COLLECTION}' (re)created")

    conn = await asyncpg.connect(DATABASE_URL)
    lessons = await conn.fetch(
        "SELECT l.id, l.course_id, l.title, l.tier_required, l.content_r2_key FROM lessons l WHERE l.is_published = true"
    )
    print(f"Found {len(lessons)} published lessons")

    for lesson in lessons:
        lesson_id = str(lesson["id"])
        course_id = str(lesson["course_id"])
        tier = lesson["tier_required"]
        # In prod, load from R2. For dev, use placeholder text.
        content = f"[{lesson['title']}] — Content loaded from R2 key: {lesson['content_r2_key']}"
        chunks = splitter.split_text(content)

        points = []
        for i, chunk_text in enumerate(chunks):
            point_id = str(uuid.uuid4())
            vector = model.encode(chunk_text).tolist()
            points.append(PointStruct(
                id=point_id, vector=vector,
                payload={"course_id": course_id, "lesson_id": lesson_id,
                         "tier_required": tier, "chunk_text": chunk_text, "chunk_index": i}
            ))
            await conn.execute(
                """INSERT INTO knowledge_chunks (id, course_id, lesson_id, chunk_index, chunk_text, tier_required, token_count)
                   VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING""",
                uuid.UUID(point_id), uuid.UUID(course_id), uuid.UUID(lesson_id),
                i, chunk_text, tier, len(chunk_text.split())
            )

        if points:
            qdrant.upsert(COLLECTION, points=points)
            print(f"  Ingested lesson {lesson_id}: {len(points)} chunks")

    await conn.close()
    print("Ingestion complete")

if __name__ == "__main__":
    asyncio.run(main())
