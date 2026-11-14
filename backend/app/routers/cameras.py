from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.camera import CameraImage
from app.schemas.camera import CameraImageOut

router = APIRouter(prefix="/cameras", tags=["Cameras"])

@router.get("", response_model=list[str])
def list_cameras(db: Session = Depends(get_db)):
    # Distinct camera names
    results = db.query(CameraImage.camera_name).distinct().all()
    return [r[0] for r in results]

@router.get("/images", response_model=list[CameraImageOut])
def list_camera_images(
    camera_name: Optional[str] = None,
    sol: Optional[int] = None,
    featured_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(CameraImage)
    if camera_name and camera_name != "all":
        query = query.filter(CameraImage.camera_name == camera_name)
    if sol is not None:
        query = query.filter(CameraImage.sol == sol)
    if featured_only:
        query = query.filter(CameraImage.is_featured == 1)

    return query.order_by(CameraImage.id.desc()).limit(limit).all()
