from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.database import get_db
from app.schemas.activity_log import ActivityLogList, ActivityLogResponse
from app.models.activity_log import ActivityLog
from app.api.deps import get_current_user
from app.models.user import User
import math

router = APIRouter(prefix="/activity", tags=["Activity Logs"])


@router.get("/", response_model=ActivityLogList)
def get_activity_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    project_id: Optional[int] = None,
    user_id: Optional[int] = None,
    task_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ActivityLog).options(joinedload(ActivityLog.user))

    if project_id:
        query = query.filter(ActivityLog.project_id == project_id)
    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    if task_id:
        query = query.filter(ActivityLog.task_id == task_id)

    query = query.order_by(ActivityLog.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [ActivityLogResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }
