from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base

class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    status = Column(String(30), default="active", index=True) # active, planned, completed, paused
    region = Column(String(100), default="Jezero Crater")
    sol_start = Column(Integer, default=1)
    sol_end = Column(Integer, nullable=True)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    objectives = Column(Text, nullable=True)
    scientific_targets = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    progress_percent = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = relationship("MissionTask", back_populates="mission", cascade="all, delete-orphan")

class MissionTask(Base):
    __tablename__ = "mission_tasks"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="observation") # observation, sampling, traverse, analysis
    status = Column(String(30), default="pending") # pending, in_progress, completed, failed
    priority = Column(String(20), default="medium") # low, medium, high, critical
    progress_percent = Column(Float, default=0.0)
    target_lat = Column(Float, nullable=True)
    target_lon = Column(Float, nullable=True)
    due_sol = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mission = relationship("Mission", back_populates="tasks")
