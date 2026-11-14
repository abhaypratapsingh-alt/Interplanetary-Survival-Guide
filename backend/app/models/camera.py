from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.core.database import Base

class CameraImage(Base):
    __tablename__ = "camera_images"

    id = Column(Integer, primary_key=True, index=True)
    camera_name = Column(String(50), index=True) # MASTCAM-Z, NAVCAM_LEFT, HAZCAM_FRONT, SUPERCAM, SHERLOC
    camera_full_name = Column(String(150))
    rover = Column(String(50), default="Perseverance")
    sol = Column(Integer, index=True)
    earth_date = Column(String(30))
    image_url = Column(Text, nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    title = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    target_feature = Column(String(100), nullable=True)
    source_attribution = Column(String(150), default="NASA/JPL-Caltech/ASU/MSSS")
    is_featured = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
