from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import (
    Sensor,
    SensorReading,
    Mission,
    CameraImage,
    HazardObservation,
    MissionLog,
    ScientificDataset,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # 1. Sensors overview
    sensors = db.query(Sensor).all()
    sensors_list = []
    for s in sensors:
        # Get recent 10 readings for sparkline
        recent_readings = (
            db.query(SensorReading.value)
            .filter(SensorReading.sensor_id == s.id)
            .order_by(SensorReading.timestamp.desc())
            .limit(10)
            .all()
        )
        sparkline = [r[0] for r in reversed(recent_readings)]
        sensors_list.append({
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "unit": s.unit,
            "current_value": s.current_value,
            "status": s.status,
            "provenance": s.provenance,
            "sparkline": sparkline,
            "last_updated": s.last_updated
        })

    # 2. Active Camera
    featured_image = (
        db.query(CameraImage)
        .filter(CameraImage.is_featured == 1)
        .order_by(CameraImage.id.desc())
        .first()
    )
    if not featured_image:
        featured_image = db.query(CameraImage).first()

    # 3. Active Mission
    active_mission = (
        db.query(Mission)
        .filter(Mission.status == "active")
        .order_by(Mission.id.asc())
        .first()
    )

    # 4. Hazards Summary
    total_hazards = db.query(HazardObservation).count()
    high_risk_hazards = db.query(HazardObservation).filter(HazardObservation.severity.in_(["high", "severe"])).count()

    # 5. Recent Logs
    recent_logs = (
        db.query(MissionLog)
        .order_by(MissionLog.timestamp.desc())
        .limit(5)
        .all()
    )

    # 6. Active Dataset
    active_dataset = (
        db.query(ScientificDataset)
        .filter(ScientificDataset.id == "nasa-viking-mdim21")
        .first()
    )

    # 7. Subsystems health summary
    subsystems_health = [
        {"name": "Power (MMRTG & Battery)", "status": "nominal", "value": "98.4%", "icon": "battery-charging"},
        {"name": "Deep Space Comm (X-band)", "status": "nominal", "value": "15.4 dB SNR", "icon": "radio"},
        {"name": "Science Cameras (Mastcam/SuperCam)", "status": "nominal", "value": "All Online", "icon": "camera"},
        {"name": "Mobility (Drive Actuators)", "status": "nominal", "value": "6/6 Motors Active", "icon": "navigation"},
        {"name": "Autonomous Navigation (AutoNav)", "status": "nominal", "value": "Hazard Scan OK", "icon": "shield-check"},
        {"name": "Ground Radar (RIMFAX)", "status": "nominal", "value": "Profile Active", "icon": "activity"},
    ]

    return {
        "mission_clock": {
            "current_sol": 1042,
            "local_mean_solar_time": "14:26:08 LMST",
            "utc_timestamp": "2024-01-28T14:26:08Z",
            "earth_mars_distance_km": 225480000,
            "one_way_light_time_min": 12.54
        },
        "rover_telemetry": {
            "name": "Perseverance (Mars 2020)",
            "location": "Jezero Crater Delta Margin",
            "coordinates": {"latitude": 18.4447, "longitude": 77.4508},
            "elevation_m": -2570.0,
            "odometer_km": 28.45,
            "samples_cached": 24,
            "samples_remaining": 14
        },
        "sensors": sensors_list,
        "active_camera": featured_image,
        "active_mission": active_mission,
        "hazard_summary": {
            "total_count": total_hazards,
            "high_risk_count": high_risk_hazards,
            "status": "caution" if high_risk_hazards > 0 else "clear"
        },
        "subsystems_health": subsystems_health,
        "recent_logs": recent_logs,
        "active_dataset": active_dataset
    }
