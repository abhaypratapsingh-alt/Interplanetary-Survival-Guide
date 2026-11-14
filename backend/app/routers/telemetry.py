import math
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.telemetry import TelemetryRecord
from app.schemas.telemetry import TelemetrySummaryOut

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.get("/summary", response_model=TelemetrySummaryOut)
def get_telemetry_summary(db: Session = Depends(get_db)):
    records = db.query(TelemetryRecord).order_by(TelemetryRecord.timestamp.desc()).limit(20).all()
    avg_snr = round(sum(r.snr_db for r in records) / len(records), 1) if records else 14.2
    total_downlink = round(sum(r.downlink_rate_kbps for r in records[:3]), 1) if records else 128.0

    return {
        "primary_station": records[0].station if records else "DSN Goldstone (DSS-14)",
        "overall_status": "nominal",
        "average_snr_db": avg_snr,
        "total_downlink_kbps": total_downlink,
        "packet_loss_rate": 0.000014,
        "orbital_relay_name": "Mars Reconnaissance Orbiter (MRO) Electra Relay",
        "records": records
    }

@router.get("/waveform")
def get_signal_waveform(points: int = 40):
    # Generates sinusoidal carrier waveform with modulated harmonics & noise
    t = datetime.utcnow().timestamp()
    waveform = []
    for i in range(points):
        x = i
        # Main carrier wave + secondary harmonic
        carrier = math.sin((x * 0.4) + (t * 2.5)) * 0.7
        harmonic = math.sin((x * 0.9) - (t * 1.5)) * 0.25
        noise = (math.sin(x * 12.3 + t) * 0.05)
        val = round(carrier + harmonic + noise, 3)
        waveform.append({"time": i, "amplitude": val, "carrier": round(carrier, 3)})

    return {
        "frequency_ghz": 8.42,
        "bandwidth_mhz": 4.5,
        "modulation": "BPSK / QPSK Carrier",
        "waveform": waveform
    }

@router.get("/radar")
def get_radar_sweep():
    # Simulated radar targets for Jezero Crater terrain
    targets = [
        {"id": "T-01", "azimuth_deg": 45, "distance_km": 1.2, "elevation_m": 45, "type": "Delta Scarp"},
        {"id": "T-02", "azimuth_deg": 135, "distance_km": 2.8, "elevation_m": -20, "type": "Kodiak Butte"},
        {"id": "T-03", "azimuth_deg": 220, "distance_km": 0.6, "elevation_m": 12, "type": "Boulder Outcrop"},
        {"id": "T-04", "azimuth_deg": 310, "distance_km": 4.5, "elevation_m": 350, "type": "Crater Rim Wall"},
    ]
    return {
        "radar_instrument": "RIMFAX (Radar Imager for Mars' Subsurface Experiment)",
        "pulse_frequency_mhz": 150,
        "max_depth_m": 15.0,
        "sweep_angle_deg": round((datetime.utcnow().timestamp() * 45) % 360, 1),
        "targets": targets
    }
