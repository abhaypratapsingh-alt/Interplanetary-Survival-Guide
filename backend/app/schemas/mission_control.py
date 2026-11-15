from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Astronaut & Telemetry
class AstronautTelemetryOut(BaseModel):
    id: int
    astronaut_id: int
    timestamp: datetime
    heart_rate_bpm: float
    heart_rate_status: str
    stress_level: float
    alertness_level: float
    cognitive_performance: float
    mental_fatigue: float
    eeg_alpha: float
    eeg_beta: float
    eeg_theta: float
    eeg_signal_status: str
    movement_state: str
    activity_level: float
    steps_count: int
    suit_pressure_kpa: float
    oxygen_level_pct: float
    oxygen_consumption_l_min: float
    suit_temp_c: float
    co2_level_mmhg: float
    suit_integrity_status: str
    body_temp_c: float
    overall_health_score: float
    medical_warning: str
    is_simulated: bool = True

    class Config:
        from_attributes = True

class HealthAlertOut(BaseModel):
    id: int
    astronaut_id: int
    timestamp: datetime
    parameter: str
    severity: str
    message: str
    value_recorded: Optional[float]
    threshold_limit: Optional[float]
    is_resolved: bool

    class Config:
        from_attributes = True

class AstronautOut(BaseModel):
    id: int
    mission_id: int
    name: str
    callsign: Optional[str]
    role: str
    blood_type: str
    avatar_url: Optional[str]
    status: str
    suit_id: str
    latest_telemetry: Optional[AstronautTelemetryOut] = None
    alerts: List[HealthAlertOut] = []

    class Config:
        from_attributes = True

# Mineral Discovery
class MineralDiscoveryCreate(BaseModel):
    name: str
    mineral_type: str
    quantity_discovered_kg: float = 1.0
    discovery_lat: float
    discovery_lon: float
    elevation_m: Optional[float] = -2500.0
    chemical_formula: Optional[str] = None
    mineral_composition: Optional[str] = None
    scientific_importance: Optional[str] = None
    sample_image_url: Optional[str] = None
    verification_status: Optional[str] = "verified_spectrometry"
    purity_pct: Optional[float] = 85.0
    discovered_by_astronaut: Optional[str] = None

class MineralDiscoveryOut(BaseModel):
    id: int
    mission_id: int
    name: str
    mineral_type: str
    quantity_discovered_kg: float
    discovery_lat: float
    discovery_lon: float
    elevation_m: float
    discovery_time: datetime
    chemical_formula: Optional[str]
    mineral_composition: Optional[str]
    scientific_importance: Optional[str]
    sample_image_url: Optional[str]
    verification_status: str
    purity_pct: float
    discovered_by_astronaut: Optional[str]
    is_simulated: bool

    class Config:
        from_attributes = True

# Mission Events Timeline
class MissionEventCreate(BaseModel):
    event_type: str
    title: str
    description: Optional[str] = None
    severity: Optional[str] = "info"
    coordinates_lat: Optional[float] = None
    coordinates_lon: Optional[float] = None
    astronaut_id: Optional[int] = None

class MissionEventOut(BaseModel):
    id: int
    mission_id: int
    astronaut_id: Optional[int]
    timestamp: datetime
    event_type: str
    title: str
    description: Optional[str]
    severity: str
    coordinates_lat: Optional[float]
    coordinates_lon: Optional[float]

    class Config:
        from_attributes = True

# Admin Mission Details & Creation
class AdminMissionCreate(BaseModel):
    code: str
    name: str
    status: Optional[str] = "active"
    region: Optional[str] = "Jezero Crater"
    destination_planet: Optional[str] = "Mars"
    target_coordinates_lat: Optional[float] = 18.38
    target_coordinates_lon: Optional[float] = 77.58
    duration_days: Optional[int] = 60
    objectives: Optional[str] = None
    scientific_targets: Optional[str] = None
    notes: Optional[str] = None

class AdminMissionUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    region: Optional[str] = None
    destination_planet: Optional[str] = None
    target_coordinates_lat: Optional[float] = None
    target_coordinates_lon: Optional[float] = None
    duration_days: Optional[int] = None
    progress_percent: Optional[float] = None
    objectives: Optional[str] = None
    scientific_targets: Optional[str] = None
    notes: Optional[str] = None

class AdminMissionDetailOut(BaseModel):
    id: int
    code: str
    name: str
    status: str
    region: str
    destination_planet: str
    created_by_admin: str
    target_coordinates_lat: float
    target_coordinates_lon: float
    start_date: datetime
    end_date: Optional[datetime]
    duration_days: int
    last_telemetry_update: datetime
    objectives: Optional[str]
    scientific_targets: Optional[str]
    notes: Optional[str]
    progress_percent: float
    astronauts: List[AstronautOut] = []
    mineral_discoveries: List[MineralDiscoveryOut] = []
    events: List[MissionEventOut] = []

    class Config:
        from_attributes = True
