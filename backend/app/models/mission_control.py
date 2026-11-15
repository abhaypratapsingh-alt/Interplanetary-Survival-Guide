from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Astronaut(Base):
    __tablename__ = "astronauts"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    callsign = Column(String(50), nullable=True)
    role = Column(String(100), default="Mission Specialist") # Commander, Pilot, Flight Engineer, Astrobiologist, Geologist
    blood_type = Column(String(10), default="O+")
    avatar_url = Column(String(300), nullable=True)
    status = Column(String(30), default="nominal") # nominal, warning, critical, eva
    suit_id = Column(String(50), default="EVA-MK4-ALPHA")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mission = relationship("Mission", back_populates="astronauts")
    telemetries = relationship("AstronautTelemetry", back_populates="astronaut", cascade="all, delete-orphan")
    alerts = relationship("HealthAlert", back_populates="astronaut", cascade="all, delete-orphan")

class AstronautTelemetry(Base):
    __tablename__ = "astronaut_telemetry"

    id = Column(Integer, primary_key=True, index=True)
    astronaut_id = Column(Integer, ForeignKey("astronauts.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # A. Heart Rate
    heart_rate_bpm = Column(Float, default=72.0)
    heart_rate_status = Column(String(20), default="normal") # normal, warning, critical

    # B. Mental Condition
    stress_level = Column(Float, default=24.0) # 0-100%
    alertness_level = Column(Float, default=92.0) # 0-100%
    cognitive_performance = Column(Float, default=95.0) # 0-100%
    mental_fatigue = Column(Float, default=18.0) # 0-100%

    # C. Neural Activity (EEG)
    eeg_alpha = Column(Float, default=10.2) # Hz
    eeg_beta = Column(Float, default=18.5) # Hz
    eeg_theta = Column(Float, default=5.4) # Hz
    eeg_signal_status = Column(String(20), default="synchronized") # synchronized, high_stress, delta_slowdown

    # D. Body Movement & Activity
    movement_state = Column(String(30), default="active_walk") # resting, active_walk, core_drilling, rover_ingress, sleep
    activity_level = Column(Float, default=65.0) # 0-100%
    steps_count = Column(Integer, default=4280)

    # E. Space Suit Monitoring
    suit_pressure_kpa = Column(Float, default=29.6) # Nominal EVA suit pressure ~29.6 kPa (4.3 psi)
    oxygen_level_pct = Column(Float, default=98.5) # %
    oxygen_consumption_l_min = Column(Float, default=1.35) # Liters/min
    suit_temp_c = Column(Float, default=21.4) # °C
    co2_level_mmhg = Column(Float, default=2.1) # mmHg (<4 mmHg nominal)
    suit_integrity_status = Column(String(20), default="sealed_nominal") # sealed_nominal, micro_leak_warning, seal_breach

    # F. General Health
    body_temp_c = Column(Float, default=36.8) # °C
    overall_health_score = Column(Float, default=96.0) # 0-100
    medical_warning = Column(String(200), default="None - All Vitals Nominal")
    is_simulated = Column(Boolean, default=True)

    astronaut = relationship("Astronaut", back_populates="telemetries")

class MineralDiscovery(Base):
    __tablename__ = "mineral_discoveries"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    mineral_type = Column(String(80), nullable=False) # Clay, Carbonate, Silica, Basalt, Sulfate, Evaporite
    quantity_discovered_kg = Column(Float, default=1.25)
    discovery_lat = Column(Float, nullable=False)
    discovery_lon = Column(Float, nullable=False)
    elevation_m = Column(Float, default=-2540.0)
    discovery_time = Column(DateTime, default=datetime.utcnow)
    chemical_formula = Column(String(100), nullable=True)
    mineral_composition = Column(Text, nullable=True) # Percentages of elements/compounds
    scientific_importance = Column(Text, nullable=True)
    sample_image_url = Column(String(300), nullable=True)
    verification_status = Column(String(30), default="verified_spectrometry") # preliminary, verified_spectrometry, lab_confirmed, archived
    purity_pct = Column(Float, default=88.5)
    discovered_by_astronaut = Column(String(100), nullable=True)
    is_simulated = Column(Boolean, default=True)

    mission = relationship("Mission", back_populates="mineral_discoveries")

class MissionEvent(Base):
    __tablename__ = "mission_events"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False)
    astronaut_id = Column(Integer, ForeignKey("astronauts.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    event_type = Column(String(50), nullable=False) # creation, launch, landing, exploration, mineral_discovery, health_warning, emergency, completion
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(20), default="info") # info, warning, critical, success
    coordinates_lat = Column(Float, nullable=True)
    coordinates_lon = Column(Float, nullable=True)

    mission = relationship("Mission", back_populates="events")

class HealthAlert(Base):
    __tablename__ = "health_alerts"

    id = Column(Integer, primary_key=True, index=True)
    astronaut_id = Column(Integer, ForeignKey("astronauts.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    parameter = Column(String(50), nullable=False) # heart_rate, suit_pressure, co2_level, stress, hypothermia
    severity = Column(String(20), default="warning") # warning, critical, emergency
    message = Column(String(250), nullable=False)
    value_recorded = Column(Float, nullable=True)
    threshold_limit = Column(Float, nullable=True)
    is_resolved = Column(Boolean, default=False)

    astronaut = relationship("Astronaut", back_populates="alerts")
