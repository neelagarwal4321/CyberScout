from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QueryRequest(BaseModel):
    query: str
    course_id: Optional[str] = None
    lesson_id: Optional[str] = None

class FeedbackRequest(BaseModel):
    query_id: str
    rating: int
    comment: Optional[str] = None
