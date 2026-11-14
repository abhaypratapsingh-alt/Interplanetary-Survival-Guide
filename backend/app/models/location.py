from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.core.database import Base

class ExplorationLocation(Base):
    __tablename__ = "exploration_locations"

    id = Column(String(60), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    feature_type = Column(String(50)) # crater, delta, mountain, canyon, plain, landing_site
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    altitude_m = Column(Float, default=0.0)
    diameter_km = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    geological_context = Column(Text, nullable=True)
    mission_connection = Column(String(150), nullable=True)
    iau_id = Column(String(50), nullable=True)
    dataset_coverage = Column(String(200), default="HiRISE, CTX, MOLA, THEMIS")
    created_at = Column(DateTime, default=datetime.utcnow)
