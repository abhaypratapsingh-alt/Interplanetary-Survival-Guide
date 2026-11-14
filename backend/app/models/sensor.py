from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String(50), primary_key=True, index=True) # e.g. "MEDA-TEMP", "MEDA-PRES", "RAD-FLUX"
    name = Column(String(100), nullable=False)
    category = Column(String(50), index=True) # atmospheric, radiation, environmental, power, mechanical
    instrument = Column(String(100)) # e.g. "MEDA (Mars Environmental Dynamics Analyzer)"
    unit = Column(String(20), nullable=False) # e.g. "°C", "Pa", "µSv/day", "m/s", "W/m²"
    description = Column(Text, nullable=True)
    provenance = Column(String(100), default="NASA Perseverance MEDA / MSL REMS Archive")
    min_nominal = Column(Float, nullable=True)
    max_nominal = Column(Float, nullable=True)
    status = Column(String(20), default="nominal") # nominal, warning, critical, offline
    current_value = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    readings = relationship("SensorReading", back_populates="sensor", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False, index=True)
    sol = Column(Integer, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    value = Column(Float, nullable=False)
    status = Column(String(20), default="nominal")
    is_simulated = Column(String(10), default="false") # "true" or "false"

    sensor = relationship("Sensor", back_populates="readings")
