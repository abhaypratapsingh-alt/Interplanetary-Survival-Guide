from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TelemetryRecordOut(BaseModel):
    id: int
    subsystem: str
    station: str
    signal_strength_dbm: float
    carrier_freq_ghz: float
    snr_db: float
    bit_error_rate: float
    uplink_rate_kbps: float
    downlink_rate_kbps: float
    buffer_utilization_pct: float
    orbit_anomaly_deg: float
    orbit_altitude_km: float
    status: str
    timestamp: datetime
    is_simulated: str

    class Config:
        from_attributes = True

class TelemetrySummaryOut(BaseModel):
    primary_station: str
    overall_status: str
    average_snr_db: float
    total_downlink_kbps: float
    packet_loss_rate: float
    orbital_relay_name: str = "Mars Reconnaissance Orbiter (MRO) Electra Relay"
    records: list[TelemetryRecordOut] = []
