from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.project import Project
from app.models.task import Task
from app.models.user import User, UserRole
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.activity_service import log_action
import math


def get_projects(db: Session, page: int = 1, page_size: int = 20):
    query = db.query(Project)
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for proj in items:
        task_count = db.query(func.count(Task.id)).filter(Task.project_id == proj.id).scalar()
        proj_dict = ProjectResponse.model_validate(proj)
        proj_dict.task_count = task_count
        result.append(proj_dict)

    return {
        "items": result,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


def get_project(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    task_count = db.query(func.count(Task.id)).filter(Task.project_id == project_id).scalar()
    resp = ProjectResponse.model_validate(project)
    resp.task_count = task_count
    return resp


def create_project(db: Session, data: ProjectCreate, user_id: int):
    project = Project(name=data.name, description=data.description, created_by=user_id)
    db.add(project)
    db.flush()
    log_action(db, "project_created", user_id=user_id, project_id=project.id, details=f"Project '{data.name}' created")
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project_id: int, data: ProjectUpdate, user_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    log_action(db, "project_updated", user_id=user_id, project_id=project_id, details=f"Project '{project.name}' updated")
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: int, user_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    name = project.name
    db.delete(project)
    log_action(db, "project_deleted", user_id=user_id, details=f"Project '{name}' deleted")
    db.commit()
    return {"message": "Project deleted successfully"}
