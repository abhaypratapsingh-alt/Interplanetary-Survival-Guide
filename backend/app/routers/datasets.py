from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.dataset import ScientificDataset

router = APIRouter(prefix="/datasets", tags=["Scientific Datasets"])

@router.get("")
def list_datasets(
    layer_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ScientificDataset)
    if layer_type and layer_type != "all":
        query = query.filter(ScientificDataset.layer_type == layer_type)
    return query.all()

@router.get("/{dataset_id}")
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    ds = db.query(ScientificDataset).filter(ScientificDataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds
