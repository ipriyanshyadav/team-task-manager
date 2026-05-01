from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.db.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskList, TaskFilters
from app.models.task import TaskStatus, TaskPriority
from app.services import task_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/", response_model=TaskList)
def list_tasks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    assigned_to: Optional[int] = None,
    project_id: Optional[int] = None,
    due_before: Optional[date] = None,
    due_after: Optional[date] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filters = TaskFilters(
        status=status,
        priority=priority,
        assigned_to=assigned_to,
        project_id=project_id,
        due_before=due_before,
        due_after=due_after,
        search=search,
    )
    return task_service.get_tasks(db, current_user, filters, page, page_size)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return task_service.get_task(db, task_id, current_user)


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return task_service.create_task(db, data, current_user)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return task_service.update_task(db, task_id, data, current_user)


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return task_service.delete_task(db, task_id, current_user)
