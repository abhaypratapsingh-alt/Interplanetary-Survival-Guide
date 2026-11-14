from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from app.core.database import Base

class AppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String(80), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    description = Column(String(200), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
