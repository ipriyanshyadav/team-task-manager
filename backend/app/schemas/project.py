from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserSummary


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: int
    created_by: Optional[int]
    created_at: datetime
    creator: Optional[UserSummary] = None
    task_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ProjectList(BaseModel):
    items: list[ProjectResponse]
    total: int
    page: int
    page_size: int
    pages: int
