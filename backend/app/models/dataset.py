from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.core.database import Base

class ScientificDataset(Base):
    __tablename__ = "scientific_datasets"

    id = Column(String(80), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    layer_type = Column(String(50)) # wmts_imagery, dem_elevation, thermal_ir, hyperspectral
    instrument = Column(String(100)) # CTX, HiRISE, MOLA, THEMIS, CRISM, Viking MDIM
    mission = Column(String(100)) # Mars Reconnaissance Orbiter, Mars Global Surveyor, 2001 Mars Odyssey
    resolution = Column(String(50)) # "0.25 m/pixel", "6 m/pixel", "463 m/pixel"
    crs = Column(String(100), default="urn:ogc:def:crs:IAU2000::49918 (Equirectangular)")
    wmts_url = Column(Text, nullable=True)
    wmts_layer_name = Column(String(100), nullable=True)
    capabilities_url = Column(Text, nullable=True)
    source_agency = Column(String(100), default="NASA / USGS / JPL")
    coverage_status = Column(String(50), default="available") # available, partial, offline_prototype
    description = Column(Text, nullable=True)
    default_opacity = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
