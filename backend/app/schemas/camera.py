from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CameraImageOut(BaseModel):
    id: int
    camera_name: str
    camera_full_name: Optional[str]
    rover: str
    sol: int
    earth_date: Optional[str]
    image_url: str
    thumbnail_url: Optional[str]
    title: Optional[str]
    description: Optional[str]
    target_feature: Optional[str]
    source_attribution: str
    is_featured: int
    created_at: datetime

    class Config:
        from_attributes = True
