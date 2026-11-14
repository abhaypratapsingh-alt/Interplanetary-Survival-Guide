from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HazardAnalyzeRequest(BaseModel):
    region: Optional[str] = "Jezero Crater"
    center_lat: float = 18.38
    center_lon: float = 77.58
    radius_km: float = 10.0
    slope_weight: float = 0.40
    obstacle_weight: float = 0.35
    terrain_weight: float = 0.25

class HazardObservationOut(BaseModel):
    id: int
    hazard_type: str
    region: str
    latitude: float
    longitude: float
    severity: str
    risk_score: float
    slope_angle_deg: Optional[float]
    boulder_density_m2: Optional[float]
    roughness_factor: Optional[float]
    confidence: float
    detected_by: str
    evidence_image_url: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class HazardSummaryOut(BaseModel):
    total_hazards: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    average_risk_score: float
    risk_formula: str = "Risk = 0.40 * SlopeRisk + 0.35 * ObstacleRisk + 0.25 * TerrainRisk"
    hazards: list[HazardObservationOut] = []
