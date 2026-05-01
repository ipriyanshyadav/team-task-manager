from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_
from fastapi import HTTPException, status
from datetime import date
from app.models.task import Task, TaskStatus
from app.models.user import User, UserRole
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate, TaskFilters
from app.services.activity_service import log_action
import math


def _apply_filters(query, filters: TaskFilters):
    if filters.status:
        query = query.filter(Task.status == filters.status)
    if filters.priority:
        query = query.filter(Task.priority == filters.priority)
    if filters.assigned_to:
        query = query.filter(Task.assigned_to == filters.assigned_to)
    if filters.project_id:
        query = query.filter(Task.project_id == filters.project_id)
    if filters.due_before:
        query = query.filter(Task.due_date <= filters.due_before)
    if filters.due_after:
        query = query.filter(Task.due_date >= filters.due_after)
    if filters.search:
        search_term = f"%{filters.search}%"
        query = query.filter(
            or_(Task.title.ilike(search_term), Task.description.ilike(search_term))
        )
    return query


def get_tasks(
    db: Session,
    current_user: User,
    filters: TaskFilters,
    page: int = 1,
    page_size: int = 20,
):
    query = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator),
    )

    # Members can only see tasks assigned to them or created by them
    if current_user.role == UserRole.member:
        query = query.filter(
            or_(Task.assigned_to == current_user.id, Task.created_by == current_user.id)
        )

    query = _apply_filters(query, filters)
    total = query.count()
    items = query.order_by(Task.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


def get_task(db: Session, task_id: int, current_user: User):
    task = db.query(Task).options(
        joinedload(Task.assignee), joinedload(Task.creator)
    ).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if current_user.role == UserRole.member:
        if task.assigned_to != current_user.id and task.created_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return task


def create_task(db: Session, data: TaskCreate, current_user: User):
    # Check project exists
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Members cannot assign tasks to others
    assigned_to = data.assigned_to
    if current_user.role == UserRole.member:
        assigned_to = current_user.id

    task = Task(
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority,
        due_date=data.due_date,
        project_id=data.project_id,
        assigned_to=assigned_to,
        created_by=current_user.id,
    )
    db.add(task)
    db.flush()
    log_action(db, "task_created", user_id=current_user.id, task_id=task.id,
               project_id=data.project_id, details=f"Task '{data.title}' created")
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: int, data: TaskUpdate, current_user: User):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Members can only update their own tasks
    if current_user.role == UserRole.member:
        if task.assigned_to != current_user.id and task.created_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot update this task")
        # Members cannot reassign tasks
        if data.assigned_to is not None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Members cannot reassign tasks")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    log_action(db, "task_updated", user_id=current_user.id, task_id=task_id,
               project_id=task.project_id, details=f"Task '{task.title}' updated")
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int, current_user: User):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if current_user.role == UserRole.member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can delete tasks")

    title = task.title
    project_id = task.project_id
    db.delete(task)
    log_action(db, "task_deleted", user_id=current_user.id,
               project_id=project_id, details=f"Task '{title}' deleted")
    db.commit()
    return {"message": "Task deleted successfully"}
