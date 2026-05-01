from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserSummary


class ActivityLogResponse(BaseModel):
    id: int
    action: str
    details: Optional[str] = None
    user_id: Optional[int] = None
    task_id: Optional[int] = None
    project_id: Optional[int] = None
    created_at: datetime
    user: Optional[UserSummary] = None

    class Config:
        from_attributes = True


class ActivityLogList(BaseModel):
    items: list[ActivityLogResponse]
    total: int
    page: int
    page_size: int
    pages: int
