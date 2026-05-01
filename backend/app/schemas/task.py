from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from app.models.task import TaskStatus, TaskPriority
from app.schemas.auth import UserSummary


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[TaskStatus] = TaskStatus.todo
    priority: Optional[TaskPriority] = TaskPriority.medium
    due_date: Optional[date] = None


class TaskCreate(TaskBase):
    project_id: int
    assigned_to: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    project_id: int
    assigned_to: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    assignee: Optional[UserSummary] = None
    creator: Optional[UserSummary] = None

    class Config:
        from_attributes = True


class TaskList(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    page_size: int
    pages: int


class TaskFilters(BaseModel):
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assigned_to: Optional[int] = None
    due_before: Optional[date] = None
    due_after: Optional[date] = None
    search: Optional[str] = None
    project_id: Optional[int] = None
