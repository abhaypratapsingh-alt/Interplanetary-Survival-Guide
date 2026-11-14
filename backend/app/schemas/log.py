from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LogCreate(BaseModel):
    category: str = "science" # science, telemetry, navigation, hazard, system, comm
    severity: str = "info" # info, warning, error, critical
    description: str
    mission_code: Optional[str] = "MARS-2026-JZ"
    data_source: Optional[str] = "Manual Mission Control Dispatch"

class LogOut(BaseModel):
    id: int
    timestamp: datetime
    category: str
    severity: str
    description: str
    mission_code: Optional[str]
    data_source: str
    user_action: Optional[str]

    class Config:
        from_attributes = True

class SettingUpdate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SettingOut(BaseModel):
    key: str
    value: str
    description: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str = "admin"
