from datetime import datetime, timedelta
import random
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models import (
    Mission,
    Astronaut,
    AstronautTelemetry,
    MineralDiscovery,
    MissionEvent,
    HealthAlert,
)
from app.schemas.mission_control import (
    AdminMissionDetailOut,
    AdminMissionCreate,
    AdminMissionUpdate,
    AstronautOut,
    AstronautTelemetryOut,
    MineralDiscoveryOut,
    MineralDiscoveryCreate,
    MissionEventOut,
    MissionEventCreate,
    HealthAlertOut,
)

router = APIRouter(prefix="/mission-control", tags=["Admin Mission Control"])

# 1. Fetch all missions (with admin filters)
@router.get("/missions", response_model=List[AdminMissionDetailOut])
def get_admin_missions(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    query = db.query(Mission)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Mission.status == status_filter.lower())
    
    missions = query.order_by(Mission.created_at.desc()).all()
    results = []
    for m in missions:
        # Build astronaut models with latest telemetry
        astro_outs = []
        for a in m.astronauts:
            latest_tel = (
                db.query(AstronautTelemetry)
                .filter(AstronautTelemetry.astronaut_id == a.id)
                .order_by(AstronautTelemetry.timestamp.desc())
                .first()
            )
            alerts = (
                db.query(HealthAlert)
                .filter(HealthAlert.astronaut_id == a.id)
                .order_by(HealthAlert.timestamp.desc())
                .limit(5)
                .all()
            )
            astro_outs.append(AstronautOut(
                id=a.id,
                mission_id=a.mission_id,
                name=a.name,
                callsign=a.callsign,
                role=a.role,
                blood_type=a.blood_type,
                avatar_url=a.avatar_url,
                status=a.status,
                suit_id=a.suit_id,
                latest_telemetry=AstronautTelemetryOut.from_orm(latest_tel) if latest_tel else None,
                alerts=[HealthAlertOut.from_orm(al) for al in alerts]
            ))

        results.append(AdminMissionDetailOut(
            id=m.id,
            code=m.code,
            name=m.name,
            status=m.status,
            region=m.region or "Jezero Crater",
            destination_planet=getattr(m, "destination_planet", "Mars") or "Mars",
            created_by_admin=getattr(m, "created_by_admin", "abhay1307") or "abhay1307",
            target_coordinates_lat=getattr(m, "target_coordinates_lat", 18.38) or 18.38,
            target_coordinates_lon=getattr(m, "target_coordinates_lon", 77.58) or 77.58,
            start_date=m.start_date or datetime.utcnow(),
            end_date=m.end_date,
            duration_days=getattr(m, "duration_days", 45) or 45,
            last_telemetry_update=getattr(m, "last_telemetry_update", datetime.utcnow()) or datetime.utcnow(),
            objectives=m.objectives,
            scientific_targets=m.scientific_targets,
            notes=m.notes,
            progress_percent=m.progress_percent or 0.0,
            astronauts=astro_outs,
            mineral_discoveries=[MineralDiscoveryOut.from_orm(md) for md in m.mineral_discoveries],
            events=[MissionEventOut.from_orm(ev) for ev in m.events]
        ))
    return results

# 2. Fetch single mission detail
@router.get("/missions/{mission_id}", response_model=AdminMissionDetailOut)
def get_admin_mission(
    mission_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    m = db.query(Mission).filter(Mission.id == mission_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    astro_outs = []
    for a in m.astronauts:
        latest_tel = (
            db.query(AstronautTelemetry)
            .filter(AstronautTelemetry.astronaut_id == a.id)
            .order_by(AstronautTelemetry.timestamp.desc())
            .first()
        )
        alerts = (
            db.query(HealthAlert)
            .filter(HealthAlert.astronaut_id == a.id)
            .order_by(HealthAlert.timestamp.desc())
            .limit(10)
            .all()
        )
        astro_outs.append(AstronautOut(
            id=a.id,
            mission_id=a.mission_id,
            name=a.name,
            callsign=a.callsign,
            role=a.role,
            blood_type=a.blood_type,
            avatar_url=a.avatar_url,
            status=a.status,
            suit_id=a.suit_id,
            latest_telemetry=AstronautTelemetryOut.from_orm(latest_tel) if latest_tel else None,
            alerts=[HealthAlertOut.from_orm(al) for al in alerts]
        ))

    return AdminMissionDetailOut(
        id=m.id,
        code=m.code,
        name=m.name,
        status=m.status,
        region=m.region or "Jezero Crater",
        destination_planet=getattr(m, "destination_planet", "Mars") or "Mars",
        created_by_admin=getattr(m, "created_by_admin", "abhay1307") or "abhay1307",
        target_coordinates_lat=getattr(m, "target_coordinates_lat", 18.38) or 18.38,
        target_coordinates_lon=getattr(m, "target_coordinates_lon", 77.58) or 77.58,
        start_date=m.start_date or datetime.utcnow(),
        end_date=m.end_date,
        duration_days=getattr(m, "duration_days", 45) or 45,
        last_telemetry_update=getattr(m, "last_telemetry_update", datetime.utcnow()) or datetime.utcnow(),
        objectives=m.objectives,
        scientific_targets=m.scientific_targets,
        notes=m.notes,
        progress_percent=m.progress_percent or 0.0,
        astronauts=astro_outs,
        mineral_discoveries=[MineralDiscoveryOut.from_orm(md) for md in m.mineral_discoveries],
        events=[MissionEventOut.from_orm(ev) for ev in m.events]
    )

# 3. Create new mission with admin ownership
@router.post("/missions", response_model=AdminMissionDetailOut)
def create_admin_mission(
    req: AdminMissionCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    existing = db.query(Mission).filter(Mission.code == req.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mission code already exists")
    
    new_m = Mission(
        code=req.code,
        name=req.name,
        status=req.status or "active",
        region=req.region or "Jezero Crater",
        destination_planet=req.destination_planet or "Mars",
        created_by_admin=admin["username"],
        target_coordinates_lat=req.target_coordinates_lat,
        target_coordinates_lon=req.target_coordinates_lon,
        duration_days=req.duration_days or 60,
        objectives=req.objectives,
        scientific_targets=req.scientific_targets,
        notes=req.notes,
        start_date=datetime.utcnow(),
        last_telemetry_update=datetime.utcnow()
    )
    db.add(new_m)
    db.flush()

    # Automatically log mission creation event
    ev = MissionEvent(
        mission_id=new_m.id,
        event_type="creation",
        title=f"Mission {new_m.code} Initialized",
        description=f"Created by Lead Flight Director {admin['username']}. Destination: {new_m.destination_planet} ({new_m.region}).",
        severity="success",
        coordinates_lat=new_m.target_coordinates_lat,
        coordinates_lon=new_m.target_coordinates_lon
    )
    db.add(ev)
    db.commit()
    db.refresh(new_m)
    return get_admin_mission(new_m.id, db, admin)

# 4. Astronaut live telemetry stream / history
@router.get("/astronauts/{astronaut_id}/telemetry", response_model=List[AstronautTelemetryOut])
def get_astronaut_telemetry_history(
    astronaut_id: int,
    limit: int = 30,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    telemetries = (
        db.query(AstronautTelemetry)
        .filter(AstronautTelemetry.astronaut_id == astronaut_id)
        .order_by(AstronautTelemetry.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [AstronautTelemetryOut.from_orm(t) for t in reversed(telemetries)]

# 5. Live heartbeat / telemetry simulation step (Simulates real astronaut wearable sensors)
@router.post("/astronauts/{astronaut_id}/telemetry-tick", response_model=AstronautTelemetryOut)
def record_astronaut_telemetry_tick(
    astronaut_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    astro = db.query(Astronaut).filter(Astronaut.id == astronaut_id).first()
    if not astro:
        raise HTTPException(status_code=404, detail="Astronaut not found")

    last = (
        db.query(AstronautTelemetry)
        .filter(AstronautTelemetry.astronaut_id == astronaut_id)
        .order_by(AstronautTelemetry.timestamp.desc())
        .first()
    )

    prev_hr = last.heart_rate_bpm if last else 74.0
    # Jitter heart rate
    new_hr = round(max(58.0, min(145.0, prev_hr + (random.random() - 0.48) * 4.0)), 1)
    hr_status = "normal" if new_hr < 110 else "warning" if new_hr < 130 else "critical"

    new_tel = AstronautTelemetry(
        astronaut_id=astronaut_id,
        timestamp=datetime.utcnow(),
        heart_rate_bpm=new_hr,
        heart_rate_status=hr_status,
        stress_level=round(max(10.0, min(85.0, (last.stress_level if last else 25.0) + (random.random() - 0.5) * 3)), 1),
        alertness_level=round(max(60.0, min(99.0, (last.alertness_level if last else 92.0) + (random.random() - 0.5) * 2)), 1),
        cognitive_performance=round(max(70.0, min(99.0, (last.cognitive_performance if last else 95.0) + (random.random() - 0.5) * 1.5)), 1),
        mental_fatigue=round(max(5.0, min(65.0, (last.mental_fatigue if last else 18.0) + (random.random() - 0.5) * 2)), 1),
        eeg_alpha=round(9.5 + random.random() * 2.5, 2),
        eeg_beta=round(16.0 + random.random() * 5.0, 2),
        eeg_theta=round(4.0 + random.random() * 2.0, 2),
        eeg_signal_status="synchronized" if new_hr < 115 else "high_stress",
        movement_state="active_walk" if random.random() > 0.3 else "core_drilling",
        activity_level=round(40.0 + random.random() * 45.0, 1),
        steps_count=(last.steps_count if last else 4200) + random.randint(3, 15),
        suit_pressure_kpa=round(29.6 + (random.random() - 0.5) * 0.4, 2),
        oxygen_level_pct=round(max(92.0, (last.oxygen_level_pct if last else 98.5) - random.random() * 0.05), 1),
        oxygen_consumption_l_min=round(1.1 + (new_hr / 100.0) * 0.5, 2),
        suit_temp_c=round(21.2 + (random.random() - 0.5) * 0.6, 1),
        co2_level_mmhg=round(2.0 + random.random() * 0.5, 2),
        suit_integrity_status="sealed_nominal",
        body_temp_c=round(36.7 + (random.random() - 0.5) * 0.2, 1),
        overall_health_score=round(max(80.0, 100.0 - (new_hr > 115) * 10 - ((last.stress_level if last else 20) / 10)), 1),
        medical_warning="None - All Biometrics Nominal" if hr_status == "normal" else f"Elevated Heart Rate ({new_hr} BPM)",
        is_simulated=True
    )
    db.add(new_tel)

    # Check alert trigger
    if new_hr >= 125.0:
        alert = HealthAlert(
            astronaut_id=astronaut_id,
            timestamp=datetime.utcnow(),
            parameter="heart_rate",
            severity="warning" if new_hr < 135 else "critical",
            message=f"Tachycardia warning: {new_hr} BPM during EVA traverse.",
            value_recorded=new_hr,
            threshold_limit=120.0
        )
        db.add(alert)

    db.commit()
    db.refresh(new_tel)
    return AstronautTelemetryOut.from_orm(new_tel)

# 6. Mineral Discoveries CRUD
@router.get("/missions/{mission_id}/minerals", response_model=List[MineralDiscoveryOut])
def get_mission_minerals(
    mission_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    minerals = db.query(MineralDiscovery).filter(MineralDiscovery.mission_id == mission_id).all()
    return [MineralDiscoveryOut.from_orm(m) for m in minerals]

@router.post("/missions/{mission_id}/minerals", response_model=MineralDiscoveryOut)
def record_mineral_discovery(
    mission_id: int,
    req: MineralDiscoveryCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    m = db.query(Mission).filter(Mission.id == mission_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")

    discovery = MineralDiscovery(
        mission_id=mission_id,
        name=req.name,
        mineral_type=req.mineral_type,
        quantity_discovered_kg=req.quantity_discovered_kg,
        discovery_lat=req.discovery_lat,
        discovery_lon=req.discovery_lon,
        elevation_m=req.elevation_m or -2500.0,
        chemical_formula=req.chemical_formula,
        mineral_composition=req.mineral_composition,
        scientific_importance=req.scientific_importance,
        sample_image_url=req.sample_image_url,
        verification_status=req.verification_status or "verified_spectrometry",
        purity_pct=req.purity_pct or 85.0,
        discovered_by_astronaut=req.discovered_by_astronaut or admin["username"],
        is_simulated=True
    )
    db.add(discovery)
    db.flush()

    # Log discovery event
    ev = MissionEvent(
        mission_id=mission_id,
        event_type="mineral_discovery",
        title=f"Discovered: {discovery.name} ({discovery.mineral_type})",
        description=f"{discovery.quantity_discovered_kg} kg verified by {discovery.discovered_by_astronaut} at {discovery.discovery_lat}°N, {discovery.discovery_lon}°E.",
        severity="success",
        coordinates_lat=discovery.discovery_lat,
        coordinates_lon=discovery.discovery_lon
    )
    db.add(ev)
    db.commit()
    db.refresh(discovery)
    return MineralDiscoveryOut.from_orm(discovery)

# 7. Mission Events Timeline
@router.get("/missions/{mission_id}/events", response_model=List[MissionEventOut])
def get_mission_events(
    mission_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    events = (
        db.query(MissionEvent)
        .filter(MissionEvent.mission_id == mission_id)
        .order_by(MissionEvent.timestamp.desc())
        .all()
    )
    return [MissionEventOut.from_orm(e) for e in events]

@router.post("/missions/{mission_id}/events", response_model=MissionEventOut)
def record_mission_event(
    mission_id: int,
    req: MissionEventCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    ev = MissionEvent(
        mission_id=mission_id,
        astronaut_id=req.astronaut_id,
        event_type=req.event_type,
        title=req.title,
        description=req.description,
        severity=req.severity or "info",
        coordinates_lat=req.coordinates_lat,
        coordinates_lon=req.coordinates_lon
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return MissionEventOut.from_orm(ev)
