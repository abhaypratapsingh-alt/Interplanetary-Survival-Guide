from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.hazard import HazardObservation
from app.schemas.hazard import HazardSummaryOut, HazardAnalyzeRequest, HazardObservationOut

router = APIRouter(prefix="/hazards", tags=["Hazards"])

@router.get("", response_model=HazardSummaryOut)
def get_hazards(
    severity: Optional[str] = None,
    hazard_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(HazardObservation)
    if severity and severity != "all":
        query = query.filter(HazardObservation.severity == severity)
    if hazard_type and hazard_type != "all":
        query = query.filter(HazardObservation.hazard_type == hazard_type)

    hazards = query.order_by(HazardObservation.risk_score.desc()).all()
    total = len(hazards)
    high_count = sum(1 for h in hazards if h.severity in ("high", "severe"))
    mod_count = sum(1 for h in hazards if h.severity == "moderate")
    low_count = sum(1 for h in hazards if h.severity == "low")
    avg_score = round(sum(h.risk_score for h in hazards) / total, 3) if total > 0 else 0.0

    return {
        "total_hazards": total,
        "high_risk_count": high_count,
        "moderate_risk_count": mod_count,
        "low_risk_count": low_count,
        "average_risk_score": avg_score,
        "risk_formula": "Risk = 0.40 * SlopeRisk + 0.35 * ObstacleRisk + 0.25 * TerrainRisk",
        "hazards": hazards
    }

@router.post("/analyze")
def run_hazard_analysis(
    req: HazardAnalyzeRequest,
    db: Session = Depends(get_db)
):
    # Modular terrain risk analysis simulation
    # Normalized:
    # slope_risk = min(1.0, slope_angle / 30.0)
    # obstacle_risk = min(1.0, boulder_density / 1.0)
    # terrain_risk = roughness_factor
    # Risk = req.slope_weight * slope_risk + req.obstacle_weight * obstacle_risk + req.terrain_weight * terrain_risk
    
    # Return simulated scan results for targeted coordinates
    scanned_points = [
        {
            "id": 101,
            "hazard_type": "steep_slope",
            "region": req.region,
            "latitude": req.center_lat + 0.005,
            "longitude": req.center_lon - 0.004,
            "severity": "high",
            "risk_score": round(req.slope_weight * 0.75 + req.obstacle_weight * 0.4 + req.terrain_weight * 0.6, 3),
            "slope_angle_deg": 22.5,
            "confidence": 0.92,
            "detected_by": "Mars Pathfinder AI Topographic Gradient Model"
        },
        {
            "id": 102,
            "hazard_type": "surface_roughness",
            "region": req.region,
            "latitude": req.center_lat - 0.003,
            "longitude": req.center_lon + 0.006,
            "severity": "moderate",
            "risk_score": round(req.slope_weight * 0.25 + req.obstacle_weight * 0.3 + req.terrain_weight * 0.7, 3),
            "slope_angle_deg": 7.5,
            "confidence": 0.88,
            "detected_by": "Mars Pathfinder AI Surface Texture Model"
        }
    ]

    return {
        "status": "completed",
        "timestamp": "2024-01-28T14:30:00Z",
        "model": "Analytical DEM Slope & Eolian Roughness Model (v2.1)",
        "formula": f"Risk = {req.slope_weight} * Slope + {req.obstacle_weight} * Obstacle + {req.terrain_weight} * Terrain",
        "results": scanned_points,
        "notes": "Simulated AI analysis prototype. For production operations, integrate calibrated HiRISE stereo DTMs."
    }
