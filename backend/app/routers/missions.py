from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.mission import Mission, MissionTask
from app.schemas.mission import (
    MissionOut,
    MissionCreate,
    MissionUpdate,
    TaskOut,
    TaskCreate,
    TaskUpdate,
)

router = APIRouter(prefix="/missions", tags=["Missions"])

@router.get("", response_model=list[MissionOut])
def list_missions(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Mission)
    if status and status != "all":
        query = query.filter(Mission.status == status)
    return query.order_by(Mission.id.asc()).all()

@router.post("", response_model=MissionOut, status_code=status.HTTP_201_CREATED)
def create_mission(
    mission_in: MissionCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    existing = db.query(Mission).filter(Mission.code == mission_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Mission with code '{mission_in.code}' already exists")

    mission = Mission(**mission_in.dict())
    db.add(mission)
    db.commit()
    db.refresh(mission)
    return mission

@router.get("/{mission_id}", response_model=MissionOut)
def get_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission

@router.put("/{mission_id}", response_model=MissionOut)
def update_mission(
    mission_id: int,
    mission_in: MissionUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    update_data = mission_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(mission, field, val)

    mission.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(mission)
    return mission

@router.delete("/{mission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mission(
    mission_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    db.delete(mission)
    db.commit()
    return None

# Task endpoints
@router.get("/{mission_id}/tasks", response_model=list[TaskOut])
def list_mission_tasks(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission.tasks

@router.post("/{mission_id}/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def add_mission_task(
    mission_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    task = MissionTask(mission_id=mission_id, **task_in.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    task = db.query(MissionTask).filter(MissionTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(task, field, val)

    db.commit()
    db.refresh(task)
    return task
