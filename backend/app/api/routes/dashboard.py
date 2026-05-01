from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.dashboard import DashboardStats
from app.services import dashboard_service
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_service.get_dashboard_stats(db, current_user)


@router.get("/user-summaries")
def get_user_summaries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    return dashboard_service.get_user_task_summaries(db)


@router.get("/project-summaries")
def get_project_summaries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_service.get_project_task_summaries(db)
