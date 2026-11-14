from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base

class MissionLog(Base):
    __tablename__ = "mission_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    category = Column(String(50), index=True) # science, telemetry, navigation, hazard, system, comm
    severity = Column(String(20), default="info", index=True) # info, warning, error, critical
    description = Column(Text, nullable=False)
    mission_code = Column(String(50), nullable=True, index=True)
    data_source = Column(String(100), default="Mission Control Automated Monitor")
    user_action = Column(String(100), nullable=True)
