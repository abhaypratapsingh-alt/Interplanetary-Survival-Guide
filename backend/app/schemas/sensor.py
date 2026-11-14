from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SensorReadingOut(BaseModel):
    id: int
    sensor_id: str
    sol: Optional[int]
    timestamp: datetime
    value: float
    status: str
    is_simulated: str

    class Config:
        from_attributes = True

class SensorBase(BaseModel):
    id: str
    name: str
    category: str
    instrument: Optional[str] = None
    unit: str
    description: Optional[str] = None
    provenance: Optional[str] = "NASA Archive / Derived Observation"
    min_nominal: Optional[float] = None
    max_nominal: Optional[float] = None
    status: Optional[str] = "nominal"
    current_value: Optional[float] = 0.0

class SensorOut(SensorBase):
    last_updated: datetime

    class Config:
        from_attributes = True

class SensorDetailOut(SensorOut):
    readings: List[SensorReadingOut] = []
