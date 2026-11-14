from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.core.database import Base

class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id = Column(Integer, primary_key=True, index=True)
    subsystem = Column(String(50), index=True) # comm_dsn, orbital_relay, power_mmrtg, thermal, attitude
    station = Column(String(50), default="DSN Goldstone (DSS-14)")
    signal_strength_dbm = Column(Float, default=-112.5) # e.g. -115 dBm
    carrier_freq_ghz = Column(Float, default=8.42) # X-band 8.4 GHz
    snr_db = Column(Float, default=14.2)
    bit_error_rate = Column(Float, default=0.000012)
    uplink_rate_kbps = Column(Float, default=2.0)
    downlink_rate_kbps = Column(Float, default=128.0)
    buffer_utilization_pct = Column(Float, default=42.0)
    orbit_anomaly_deg = Column(Float, default=124.5)
    orbit_altitude_km = Column(Float, default=320.0) # MRO orbital altitude
    status = Column(String(20), default="nominal")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    is_simulated = Column(String(10), default="true")
