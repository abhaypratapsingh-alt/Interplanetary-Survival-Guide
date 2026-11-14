from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "observation"
    status: Optional[str] = "pending"
    priority: Optional[str] = "medium"
    progress_percent: Optional[float] = 0.0
    target_lat: Optional[float] = None
    target_lon: Optional[float] = None
    due_sol: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress_percent: Optional[float] = None

class TaskOut(TaskBase):
    id: int
    mission_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MissionBase(BaseModel):
    code: str
    name: str
    status: Optional[str] = "active"
    region: Optional[str] = "Jezero Crater"
    sol_start: Optional[int] = 1
    sol_end: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    objectives: Optional[str] = None
    scientific_targets: Optional[str] = None
    notes: Optional[str] = None
    progress_percent: Optional[float] = 0.0

class MissionCreate(MissionBase):
    pass

class MissionUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    region: Optional[str] = None
    sol_end: Optional[int] = None
    objectives: Optional[str] = None
    scientific_targets: Optional[str] = None
    notes: Optional[str] = None
    progress_percent: Optional[float] = None

class MissionOut(MissionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    tasks: List[TaskOut] = []

    class Config:
        from_attributes = True
