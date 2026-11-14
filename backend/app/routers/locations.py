from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.location import ExplorationLocation

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("")
def list_locations(
    search: Optional[str] = None,
    feature_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ExplorationLocation)
    if search:
        query = query.filter(ExplorationLocation.name.ilike(f"%{search}%"))
    if feature_type and feature_type != "all":
        query = query.filter(ExplorationLocation.feature_type == feature_type)
    return query.all()

@router.get("/{location_id}")
def get_location(location_id: str, db: Session = Depends(get_db)):
    loc = db.query(ExplorationLocation).filter(ExplorationLocation.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return loc
