from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.core.database import Base

class HazardObservation(Base):
    __tablename__ = "hazard_observations"

    id = Column(Integer, primary_key=True, index=True)
    hazard_type = Column(String(50), index=True) # steep_slope, boulder_field, impact_crater, surface_roughness, dune_slip
    region = Column(String(100), default="Jezero Crater")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(String(20), default="moderate") # low, moderate, high, severe
    risk_score = Column(Float, default=0.0) # 0.0 to 1.0 (Calculated via 0.40*Slope + 0.35*Obstacle + 0.25*Terrain)
    slope_angle_deg = Column(Float, nullable=True)
    boulder_density_m2 = Column(Float, nullable=True)
    roughness_factor = Column(Float, nullable=True)
    confidence = Column(Float, default=0.85) # 0.0 to 1.0
    detected_by = Column(String(100), default="Mars Pathfinder Topographic Analyzer (MOLA/HiRISE Derived)")
    evidence_image_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
