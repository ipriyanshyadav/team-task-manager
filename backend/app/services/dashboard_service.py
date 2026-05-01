from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.models.task import Task, TaskStatus
from app.models.user import User, UserRole
from app.models.project import Project


def get_dashboard_stats(db: Session, current_user: User):
    base = db.query(Task)
    if current_user.role == UserRole.member:
        from sqlalchemy import or_
        base = base.filter(
            or_(Task.assigned_to == current_user.id, Task.created_by == current_user.id)
        )

    total = base.count()
    completed = base.filter(Task.status == TaskStatus.done).count()
    in_progress = base.filter(Task.status == TaskStatus.in_progress).count()
    pending = total - completed
    today = date.today()
    overdue = base.filter(
        Task.due_date < today, Task.status != TaskStatus.done
    ).count()

    total_projects = db.query(func.count(Project.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar() if current_user.role == UserRole.admin else None

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "in_progress_tasks": in_progress,
        "overdue_tasks": overdue,
        "total_projects": total_projects,
        "total_users": total_users or 0,
    }


def get_user_task_summaries(db: Session):
    users = db.query(User).filter(User.is_active is True).all()
    summaries = []
    for user in users:
        total = db.query(func.count(Task.id)).filter(Task.assigned_to == user.id).scalar()
        completed = db.query(func.count(Task.id)).filter(
            Task.assigned_to == user.id, Task.status == TaskStatus.done
        ).scalar()
        summaries.append({
            "user_id": user.id,
            "user_name": user.name,
            "total_tasks": total,
            "completed_tasks": completed,
            "pending_tasks": total - completed,
        })
    return summaries


def get_project_task_summaries(db: Session):
    projects = db.query(Project).all()
    summaries = []
    for project in projects:
        total = db.query(func.count(Task.id)).filter(Task.project_id == project.id).scalar()
        completed = db.query(func.count(Task.id)).filter(
            Task.project_id == project.id, Task.status == TaskStatus.done
        ).scalar()
        in_progress = db.query(func.count(Task.id)).filter(
            Task.project_id == project.id, Task.status == TaskStatus.in_progress
        ).scalar()
        todo = db.query(func.count(Task.id)).filter(
            Task.project_id == project.id, Task.status == TaskStatus.todo
        ).scalar()
        summaries.append({
            "project_id": project.id,
            "project_name": project.name,
            "total_tasks": total,
            "completed_tasks": completed,
            "in_progress_tasks": in_progress,
            "todo_tasks": todo,
        })
    return summaries
