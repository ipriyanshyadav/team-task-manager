from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog


def log_action(
    db: Session,
    action: str,
    user_id: int = None,
    task_id: int = None,
    project_id: int = None,
    details: str = None,
):
    log = ActivityLog(
        action=action,
        user_id=user_id,
        task_id=task_id,
        project_id=project_id,
        details=details,
    )
    db.add(log)
    # Don't commit here - let the calling service manage transaction
