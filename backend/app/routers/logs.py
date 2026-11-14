import io
import csv
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.log import MissionLog
from app.schemas.log import LogOut, LogCreate

router = APIRouter(prefix="/logs", tags=["Mission Logs"])

@router.get("", response_model=list[LogOut])
def list_logs(
    search: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(MissionLog)
    if category and category != "all":
        query = query.filter(MissionLog.category == category)
    if severity and severity != "all":
        query = query.filter(MissionLog.severity == severity)
    if search:
        query = query.filter(MissionLog.description.ilike(f"%{search}%"))

    return query.order_by(MissionLog.timestamp.desc()).limit(limit).all()

@router.post("", response_model=LogOut, status_code=status.HTTP_201_CREATED)
def create_log(
    log_in: LogCreate,
    db: Session = Depends(get_db)
):
    log = MissionLog(
        category=log_in.category,
        severity=log_in.severity,
        description=log_in.description,
        mission_code=log_in.mission_code,
        data_source=log_in.data_source,
        user_action="Manual Dispatch"
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/export/csv")
def export_logs_csv(db: Session = Depends(get_db)):
    logs = db.query(MissionLog).order_by(MissionLog.timestamp.desc()).limit(1000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "timestamp", "category", "severity", "description", "mission_code", "data_source"])

    for item in logs:
        writer.writerow([item.id, item.timestamp.isoformat(), item.category, item.severity, item.description, item.mission_code, item.data_source])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=mission_logs_{int(datetime.utcnow().timestamp())}.csv"}
    )
