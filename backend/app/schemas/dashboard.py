from pydantic import BaseModel
from typing import List


class TaskStatusCount(BaseModel):
    status: str
    count: int


class TaskPriorityCount(BaseModel):
    priority: str
    count: int


class DashboardStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    overdue_tasks: int
    total_projects: int
    total_users: int


class UserTaskSummary(BaseModel):
    user_id: int
    user_name: str
    total_tasks: int
    completed_tasks: int
    pending_tasks: int


class ProjectTaskSummary(BaseModel):
    project_id: int
    project_name: str
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    todo_tasks: int
