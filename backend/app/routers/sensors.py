import io
import csv
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.sensor import Sensor, SensorReading
from app.schemas.sensor import SensorOut, SensorReadingOut

router = APIRouter(prefix="/sensors", tags=["Sensors"])

@router.get("", response_model=list[SensorOut])
def list_sensors(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Sensor)
    if category and category != "all":
        query = query.filter(Sensor.category == category)
    return query.all()

@router.get("/{sensor_id}", response_model=SensorOut)
def get_sensor(sensor_id: str, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found")
    return sensor

@router.get("/{sensor_id}/history", response_model=list[SensorReadingOut])
def get_sensor_history(
    sensor_id: str,
    range: str = Query("24h", description="Time range: 1h, 24h, 7d, 30d"),
    limit: int = 100,
    db: Session = Depends(get_db)
):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found")

    now = datetime.utcnow()
    delta = timedelta(hours=24)
    if range == "1h":
        delta = timedelta(hours=1)
    elif range == "7d":
        delta = timedelta(days=7)
    elif range == "30d":
        delta = timedelta(days=30)

    start_time = now - delta
    readings = (
        db.query(SensorReading)
        .filter(SensorReading.sensor_id == sensor_id, SensorReading.timestamp >= start_time)
        .order_by(SensorReading.timestamp.asc())
        .limit(limit)
        .all()
    )
    return readings

@router.get("/export/csv")
def export_sensors_csv(
    sensor_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SensorReading)
    if sensor_id:
        query = query.filter(SensorReading.sensor_id == sensor_id)
    readings = query.order_by(SensorReading.timestamp.desc()).limit(1000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "sensor_id", "sol", "timestamp", "value", "status", "is_simulated"])

    for r in readings:
        writer.writerow([r.id, r.sensor_id, r.sol, r.timestamp.isoformat(), r.value, r.status, r.is_simulated])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=mars_sensor_readings_{int(datetime.utcnow().timestamp())}.csv"}
    )
