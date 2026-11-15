from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.models import (
    Mission,
    MissionTask,
    Astronaut,
    AstronautTelemetry,
    MineralDiscovery,
    MissionEvent,
    HealthAlert,
    Sensor,
    SensorReading,
    CameraImage,
    ExplorationLocation,
    ScientificDataset,
    HazardObservation,
    TelemetryRecord,
    MissionLog,
    AppSetting,
)

def seed_database(db: Session):
    # Check if mission control already seeded
    if db.query(Astronaut).first():
        return

    # Check if basic tables already seeded
    base_seeded = db.query(Sensor).first() is not None
    if not base_seeded:
        print("[Seeder] Populating database with realistic NASA Mars telemetry & mission data...")

    # 1. Sensors
    sensors_data = [
        {
            "id": "MEDA-TEMP",
            "name": "Surface Atmospheric Temperature",
            "category": "atmospheric",
            "instrument": "MEDA (Mars Environmental Dynamics Analyzer)",
            "unit": "°C",
            "description": "Ambient air temperature measured at 1.5m above surface by rover mast thermocouple sensors.",
            "provenance": "NASA Mars 2020 Perseverance MEDA Data Archive",
            "min_nominal": -88.0,
            "max_nominal": -14.0,
            "current_value": -62.4,
            "status": "nominal"
        },
        {
            "id": "MEDA-PRES",
            "name": "Atmospheric Pressure",
            "category": "atmospheric",
            "instrument": "MEDA Pressure Sensor",
            "unit": "Pa",
            "description": "Barometric surface pressure showing daily thermal tides and seasonal CO2 sublimation cycles.",
            "provenance": "NASA Mars 2020 Perseverance MEDA Data Archive",
            "min_nominal": 650.0,
            "max_nominal": 820.0,
            "current_value": 718.5,
            "status": "nominal"
        },
        {
            "id": "RAD-FLUX",
            "name": "Galactic Cosmic Radiation & Solar Particle Flux",
            "category": "radiation",
            "instrument": "RAD (Radiation Assessment Detector)",
            "unit": "µSv/day",
            "description": "Dose equivalent rate for biologically relevant cosmic ionizing radiation on Martian surface.",
            "provenance": "NASA MSL / Mars 2020 RAD Science Team",
            "min_nominal": 180.0,
            "max_nominal": 450.0,
            "current_value": 248.0,
            "status": "nominal"
        },
        {
            "id": "DUST-OPT",
            "name": "Atmospheric Dust Optical Depth (Tau)",
            "category": "environmental",
            "instrument": "Mastcam-Z / MEDA TIRS",
            "unit": "tau",
            "description": "Atmospheric extinction column depth representing suspended atmospheric dust concentration.",
            "provenance": "NASA Mars 2020 Science Team Observations",
            "min_nominal": 0.2,
            "max_nominal": 2.5,
            "current_value": 0.62,
            "status": "nominal"
        },
        {
            "id": "MEDA-WIND",
            "name": "Surface Wind Velocity",
            "category": "atmospheric",
            "instrument": "MEDA Wind Sensors 1 & 2",
            "unit": "m/s",
            "description": "Horizontal surface wind velocity and gust tracking across Jezero crater floor.",
            "provenance": "NASA Perseverance MEDA Wind Sensor",
            "min_nominal": 0.0,
            "max_nominal": 28.0,
            "current_value": 7.8,
            "status": "nominal"
        },
        {
            "id": "PWR-SOLAR",
            "name": "Surface Solar Irradiance",
            "category": "power",
            "instrument": "MEDA Optical Radiation Sensor",
            "unit": "W/m²",
            "description": "Direct and diffuse solar insolation reaching the surface through the dust column.",
            "provenance": "NASA Mars Environmental Dynamics Analyzer",
            "min_nominal": 0.0,
            "max_nominal": 580.0,
            "current_value": 412.0,
            "status": "nominal"
        },
        {
            "id": "MMRTG-TEMP",
            "name": "MMRTG Thermal Core Temperature",
            "category": "mechanical",
            "instrument": "Multi-Mission Radioisotope Thermoelectric Generator",
            "unit": "°C",
            "description": "Internal temperature of the plutonium-238 dioxide heat source providing rover electrical power.",
            "provenance": "NASA JPL Rover Engineering Telemetry",
            "min_nominal": 160.0,
            "max_nominal": 210.0,
            "current_value": 184.2,
            "status": "nominal"
        },
        {
            "id": "MEDA-HUMID",
            "name": "Relative Humidity",
            "category": "atmospheric",
            "instrument": "MEDA Humidity Sensor (HS)",
            "unit": "%",
            "description": "Water vapor saturation percentage near surface during diurnal night freeze cycles.",
            "provenance": "NASA Perseverance MEDA Instrument Archive",
            "min_nominal": 0.0,
            "max_nominal": 95.0,
            "current_value": 8.4,
            "status": "nominal"
        }
    ]

    for s_info in sensors_data:
        sensor = Sensor(**s_info)
        db.add(sensor)

        # Generate 24 historical points for each sensor
        base_val = s_info["current_value"]
        now = datetime.utcnow()
        for i in range(24):
            t = now - timedelta(hours=(24 - i))
            jitter = (random.random() - 0.5) * (abs(base_val) * 0.08)
            val = round(base_val + jitter, 2)
            reading = SensorReading(
                sensor_id=s_info["id"],
                sol=1042,
                timestamp=t,
                value=val,
                status="nominal",
                is_simulated="true"
            )
            db.add(reading)

    # 2. Missions
    m1 = Mission(
        code="MARS-2026-JZ",
        name="Jezero Fan Delta Astrobiology Traverse",
        status="active",
        region="Jezero Crater (Western Delta)",
        sol_start=1000,
        sol_end=1150,
        start_date=datetime.utcnow() - timedelta(days=42),
        objectives="Characterize fine-grained sedimentary mudstones at the delta front, extract sealed core samples, and evaluate ancient lacustrine biosignatures.",
        scientific_targets="Kodiak Butte strata, Delta scarp clays, carbonate olivine boundary at Séítah.",
        notes="All sampling drill bit assemblies in nominal condition. Communication pass with MRO every Sol at 15:40 UTC.",
        progress_percent=68.5
    )
    m2 = Mission(
        code="PERSEVERANCE-RIM",
        name="Northwestern Crater Rim Ascent Campaign",
        status="active",
        region="Jezero Crater Rim Crest",
        sol_start=1151,
        sol_end=1300,
        start_date=datetime.utcnow() + timedelta(days=10),
        objectives="Ascend the 350-meter crater rim breach into the Nili Fossae regional bedrock, exposing pre-Noachian impact megabreccia.",
        scientific_targets="Isidis basin impact ejecta, ancient crustal basement rock units.",
        notes="Requires path planning through steep gradient slopes (>14 degrees) near Neretva Vallis.",
        progress_percent=15.0
    )
    m3 = Mission(
        code="INGENUITY-AIR-SCOUT",
        name="Aerial Pathfinding & Dune Field Reconnaissance",
        status="completed",
        region="South Séítah Dune Corridor",
        sol_start=850,
        sol_end=995,
        start_date=datetime.utcnow() - timedelta(days=150),
        end_date=datetime.utcnow() - timedelta(days=5),
        objectives="Scout trafficability corridors across ripple fields and high-friction boulder zones ahead of rover traverse.",
        scientific_targets="Séítah geological unit, ripple wavelength spacing analysis.",
        notes="Successfully completed 72 flights before retirement. Transferred terrain maps to autonomous ground navigation system.",
        progress_percent=100.0
    )
    db.add_all([m1, m2, m3])
    db.flush()

    # Tasks for Mission 1
    tasks_m1 = [
        MissionTask(
            mission_id=m1.id,
            title="Drill Core Extraction at 'Tenby' Delta Formation",
            description="Acquire 5cm hermetically sealed rock core from delta front sandstone outcrop using rotary percussive drill.",
            category="sampling",
            status="completed",
            priority="critical",
            progress_percent=100.0,
            target_lat=18.421,
            target_lon=77.385,
            due_sol=1020
        ),
        MissionTask(
            mission_id=m1.id,
            title="SuperCam Remote Raman Spectroscopy Survey",
            description="Fire pulsed laser at target outcrop 'Belva' to determine elemental composition and identify carbonate signatures.",
            category="analysis",
            status="completed",
            priority="high",
            progress_percent=100.0,
            target_lat=18.418,
            target_lon=77.392,
            due_sol=1035
        ),
        MissionTask(
            mission_id=m1.id,
            title="RIMFAX Ground-Penetrating Radar Subsurface Sounding",
            description="Execute continuous 15-meter deep radar profile along delta front margin to map buried sedimentary layers.",
            category="observation",
            status="in_progress",
            priority="high",
            progress_percent=75.0,
            target_lat=18.425,
            target_lon=77.378,
            due_sol=1050
        ),
        MissionTask(
            mission_id=m1.id,
            title="Mastcam-Z 360-Degree Stereo Gigapixel Panorama",
            description="Capture calibrated multi-spectral color panorama of Kodiak mesa and inlet canyon walls at local noon.",
            category="observation",
            status="pending",
            priority="medium",
            progress_percent=0.0,
            target_lat=18.430,
            target_lon=77.370,
            due_sol=1055
        )
    ]
    db.add_all(tasks_m1)

    # 3. Camera Images (Using real NASA Mars Rover imagery URLs from NASA JPL / Mars 2020 / MSSS)
    camera_images = [
        CameraImage(
            camera_name="MASTCAM-Z",
            camera_full_name="Mast Camera Zoom (Mastcam-Z Left)",
            rover="Perseverance",
            sol=1042,
            earth_date="2024-01-28",
            image_url="https://mars.nasa.gov/system/resources/detail_files/26075_PIA24424-web.jpg",
            thumbnail_url="https://mars.nasa.gov/system/resources/detail_files/26075_PIA24424-web.jpg",
            title="Jezero Western Delta Scarp Layering",
            description="High-resolution telephoto view of sedimentary delta topset and bottomset beds showing ancient river deposits.",
            target_feature="Delta Front Scarp",
            source_attribution="NASA/JPL-Caltech/ASU/MSSS",
            is_featured=1
        ),
        CameraImage(
            camera_name="HAZCAM_FRONT",
            camera_full_name="Front Hazard Avoidance Cameras (Hazcam Left)",
            rover="Perseverance",
            sol=1041,
            earth_date="2024-01-27",
            image_url="https://mars.nasa.gov/system/resources/detail_files/25893_PIA24419-web.jpg",
            thumbnail_url="https://mars.nasa.gov/system/resources/detail_files/25893_PIA24419-web.jpg",
            title="Front Drive Path & Boulder Field Clear View",
            description="Wide-angle stereoscopic view of the wheel tracks on basaltic regolith in front of the rover robotic arm.",
            target_feature="Traverse Path Regolith",
            source_attribution="NASA/JPL-Caltech",
            is_featured=1
        ),
        CameraImage(
            camera_name="NAVCAM_RIGHT",
            camera_full_name="Navigation Camera (Navcam Right)",
            rover="Perseverance",
            sol=1038,
            earth_date="2024-01-24",
            image_url="https://mars.nasa.gov/system/resources/detail_files/25841_PIA24483-web.jpg",
            thumbnail_url="https://mars.nasa.gov/system/resources/detail_files/25841_PIA24483-web.jpg",
            title="Distant Crater Rim Horizon at Jezero",
            description="Panoramic horizon view showing the northwestern impact rim crest rising above the floor.",
            target_feature="Northwestern Rim",
            source_attribution="NASA/JPL-Caltech",
            is_featured=0
        ),
        CameraImage(
            camera_name="SUPERCAM",
            camera_full_name="SuperCam Remote Micro-Imager (RMI)",
            rover="Perseverance",
            sol=1035,
            earth_date="2024-01-21",
            image_url="https://mars.nasa.gov/system/resources/detail_files/25732_PIA24481-web.jpg",
            thumbnail_url="https://mars.nasa.gov/system/resources/detail_files/25732_PIA24481-web.jpg",
            title="Kodiak Butte Cross-Bedding Close-up",
            description="Telescopic micro-image revealing inclined cross-bedded sandstone deposited in high-energy floodwater.",
            target_feature="Kodiak Butte",
            source_attribution="NASA/JPL-Caltech/LANL/CNES/CNRS",
            is_featured=1
        ),
        CameraImage(
            camera_name="WATSON",
            camera_full_name="Wide Angle Topographic Sensor for Operations (SHERLOC WATSON)",
            rover="Perseverance",
            sol=1030,
            earth_date="2024-01-16",
            image_url="https://mars.nasa.gov/system/resources/detail_files/25700_PIA24480-web.jpg",
            thumbnail_url="https://mars.nasa.gov/system/resources/detail_files/25700_PIA24480-web.jpg",
            title="Abrasion Patch Grain Texture in Séítah Bedrock",
            description="Microscopic inspection of mineral grain boundaries revealing olivine crystals altered by neutral water.",
            target_feature="Abraded Target 'Dourbes'",
            source_attribution="NASA/JPL-Caltech/MSSS",
            is_featured=0
        )
    ]
    db.add_all(camera_images)

    # 4. Locations
    locations = [
        ExplorationLocation(
            id="jezero-crater",
            name="Jezero Crater",
            feature_type="crater",
            latitude=18.38,
            longitude=77.58,
            altitude_m=-2500.0,
            diameter_km=45.0,
            description="Ancient Martian paleolake crater with a prominent river delta deposit. Landing site of NASA Perseverance Rover and Ingenuity Helicopter.",
            geological_context="Clay minerals formed in neutral pH water; prime astrobiological search terrain for fossilized microbial biosignatures.",
            mission_connection="NASA Mars 2020 (Perseverance & Ingenuity)",
            iau_id="IAU-020-JZ",
            dataset_coverage="HiRISE, CTX, MOLA, THEMIS, CRISM"
        ),
        ExplorationLocation(
            id="olympus-mons",
            name="Olympus Mons",
            feature_type="mountain",
            latitude=18.65,
            longitude=226.2,
            altitude_m=21900.0,
            diameter_km=600.0,
            description="The largest known shield volcano in the solar system, rising approximately 21.9 km above Mars datum.",
            geological_context="Formed by persistent basaltic lava flows over billions of years without plate tectonics.",
            iau_id="IAU-001-OLY",
            dataset_coverage="MOLA, Viking MDIM, THEMIS"
        ),
        ExplorationLocation(
            id="valles-marineris",
            name="Valles Marineris",
            feature_type="canyon",
            latitude=-13.9,
            longitude=300.8,
            altitude_m=-7000.0,
            diameter_km=4000.0,
            description="Vast canyon system stretching over 4,000 km along the Martian equator, up to 7 km deep.",
            geological_context="Tectonic rift in the Martian crust associated with the uplift of the Tharsis volcanic bulge.",
            iau_id="IAU-002-VM",
            dataset_coverage="MOLA, CTX, HRSC, Viking MDIM"
        ),
        ExplorationLocation(
            id="gale-crater",
            name="Gale Crater",
            feature_type="crater",
            latitude=-5.37,
            longitude=137.81,
            altitude_m=-4500.0,
            diameter_km=154.0,
            description="Landing site of NASA Curiosity Rover (Mars Science Laboratory). Houses Mount Sharp (Aeolis Mons) in the center.",
            geological_context="5.5 km layered sedimentary mound documenting Mars climate transition from wet to arid.",
            mission_connection="NASA MSL Curiosity Rover (2012-Present)",
            iau_id="IAU-003-GAL",
            dataset_coverage="HiRISE, CTX, MOLA, ChemCam, Mastcam"
        ),
        ExplorationLocation(
            id="octavia-butler-landing",
            name="Octavia E. Butler Landing Site",
            feature_type="landing_site",
            latitude=18.4447,
            longitude=77.4508,
            altitude_m=-2570.0,
            diameter_km=0.05,
            description="Touchdown point of NASA's Mars 2020 Perseverance rover on February 18, 2021 in Jezero Crater.",
            geological_context="Flat regolith plain adjacent to the western fan delta front deposits.",
            mission_connection="NASA Mars 2020 Perseverance Rover",
            iau_id="SITE-JZ-LANDING",
            dataset_coverage="HiRISE, CTX, Navcam, Hazcam"
        )
    ]
    db.add_all(locations)

    # 5. Scientific Datasets
    datasets = [
        ScientificDataset(
            id="nasa-viking-mdim21",
            name="Viking MDIM 2.1 Colorized Global Mosaic",
            layer_type="wmts_imagery",
            instrument="Viking Orbiter Cameras (VIS)",
            mission="Viking 1 & 2 Orbiters",
            resolution="232 m/pixel",
            crs="urn:ogc:def:crs:IAU2000::49918 (Equirectangular)",
            wmts_url="https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
            wmts_layer_name="Mars_Viking_MDIM21_ClrMosaic_global_232m",
            capabilities_url="https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/WMTSCapabilities.xml",
            source_agency="NASA / USGS Astrogeology Science Center",
            coverage_status="available",
            description="Global photorealistic orthorectified color basemap of Mars compiled from Viking missions.",
            default_opacity=1.0
        ),
        ScientificDataset(
            id="nasa-mola-color-relief",
            name="MGS MOLA Shaded Color Relief Elevation",
            layer_type="dem_elevation",
            instrument="MOLA (Mars Orbiter Laser Altimeter)",
            mission="Mars Global Surveyor",
            resolution="463 m/pixel (128 pix/deg)",
            crs="urn:ogc:def:crs:IAU2000::49918 (Equirectangular)",
            wmts_url="https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
            wmts_layer_name="Mars_MGS_MOLA_ClrShade_merge_global_463m",
            capabilities_url="https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/WMTSCapabilities.xml",
            source_agency="NASA Goddard Space Flight Center",
            coverage_status="available",
            description="Topographic elevation model referenced to the Mars Areoid geoid datum (-8.2km to +21.2km).",
            default_opacity=0.85
        ),
        ScientificDataset(
            id="nasa-ctx-jezero-mosaic",
            name="CTX Jezero Crater Orthorectified Mosaic",
            layer_type="wmts_imagery",
            instrument="CTX (Context Camera)",
            mission="Mars Reconnaissance Orbiter (MRO)",
            resolution="6 m/pixel",
            crs="urn:ogc:def:crs:IAU2000::49918",
            wmts_url="https://trek.nasa.gov/tiles/Mars/EQ/JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0/1.0.0/default/default028mm/{z}/{y}/{x}.png",
            wmts_layer_name="JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0",
            capabilities_url="https://trek.nasa.gov/tiles/Mars/EQ/JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0/1.0.0/WMTSCapabilities.xml",
            source_agency="NASA / JPL-Caltech / Malin Space Science Systems",
            coverage_status="available",
            description="High-resolution regional context mosaic over Jezero Crater and Nili Fossae.",
            default_opacity=1.0
        ),
        ScientificDataset(
            id="nasa-themis-day-ir",
            name="THEMIS Daytime Infrared Thermal Mosaic",
            layer_type="thermal_ir",
            instrument="THEMIS (Thermal Emission Imaging System)",
            mission="2001 Mars Odyssey",
            resolution="100 m/pixel",
            crs="urn:ogc:def:crs:IAU2000::49918",
            wmts_url="https://trek.nasa.gov/tiles/Mars/EQ/Mars_MO_THEMIS-IR-Day_mosaic_global_100m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
            wmts_layer_name="Mars_MO_THEMIS-IR-Day_mosaic_global_100m",
            source_agency="NASA / Arizona State University",
            coverage_status="available",
            description="Thermal inertia and surface physical properties indicating rock vs fine sand abundance.",
            default_opacity=0.7
        )
    ]
    db.add_all(datasets)

    # 6. Hazards (With calculated Risk = 0.40*Slope + 0.35*Obstacle + 0.25*Terrain)
    hazards = [
        HazardObservation(
            hazard_type="steep_slope",
            region="Jezero Crater (Delta Scarp)",
            latitude=18.423,
            longitude=77.382,
            severity="severe",
            slope_angle_deg=22.4,
            boulder_density_m2=0.04,
            roughness_factor=0.72,
            risk_score=round(0.40 * (22.4 / 30.0) + 0.35 * 0.4 + 0.25 * 0.72, 3), # ~0.619
            confidence=0.94,
            detected_by="HiRISE DTM Stereo Slope Analyzer",
            evidence_image_url="https://mars.nasa.gov/system/resources/detail_files/26075_PIA24424-web.jpg",
            notes="Steep cliff scarp along ancient delta deposit; exceeds maximum 15-degree safe rover traction threshold."
        ),
        HazardObservation(
            hazard_type="boulder_field",
            region="Jezero Crater (South Séítah Margin)",
            latitude=18.435,
            longitude=77.465,
            severity="high",
            slope_angle_deg=6.8,
            boulder_density_m2=0.88,
            roughness_factor=0.85,
            risk_score=round(0.40 * (6.8 / 30.0) + 0.35 * 0.88 + 0.25 * 0.85, 3), # ~0.611
            confidence=0.89,
            detected_by="Perseverance Hazcam / Navcam Point Cloud",
            evidence_image_url="https://mars.nasa.gov/system/resources/detail_files/25893_PIA24419-web.jpg",
            notes="Dense cluster of basaltic boulders exceeding 45cm diameter; high risk of chassis underbody impingement."
        ),
        HazardObservation(
            hazard_type="dune_slip",
            region="Jezero Crater (Neretva Entrance)",
            latitude=18.395,
            longitude=77.240,
            severity="moderate",
            slope_angle_deg=11.2,
            boulder_density_m2=0.08,
            roughness_factor=0.45,
            risk_score=round(0.40 * (11.2 / 30.0) + 0.35 * 0.08 + 0.25 * 0.45, 3), # ~0.290
            confidence=0.82,
            detected_by="Automated Wheel Sinkage & Slip Model",
            notes="Active transverse eolian megaripples with fine grain size; potential wheel slip exceeds 40%."
        ),
        HazardObservation(
            hazard_type="impact_crater",
            region="Jezero Crater Floor (Belva Crater)",
            latitude=18.510,
            longitude=77.360,
            severity="high",
            slope_angle_deg=18.5,
            boulder_density_m2=0.45,
            roughness_factor=0.68,
            risk_score=round(0.40 * (18.5 / 30.0) + 0.35 * 0.45 + 0.25 * 0.68, 3),
            confidence=0.96,
            detected_by="MRO CTX Jezero Mosaic / HiRISE DTM",
            notes="Subordinate impact crater 1km diameter with steep raised rim and ejecta blanket."
        )
    ]
    db.add_all(hazards)

    # 7. Telemetry Records
    now_time = datetime.utcnow()
    stations = ["DSN Goldstone (DSS-14)", "DSN Madrid (DSS-63)", "DSN Canberra (DSS-43)"]
    for i in range(12):
        rec = TelemetryRecord(
            subsystem="comm_dsn" if i % 2 == 0 else "orbital_relay",
            station=stations[i % len(stations)],
            signal_strength_dbm=round(-110.0 - random.random() * 8.0, 1),
            carrier_freq_ghz=8.42 if i % 2 == 0 else 0.401,
            snr_db=round(12.0 + random.random() * 6.0, 1),
            bit_error_rate=0.00001 + round(random.random() * 0.000008, 6),
            uplink_rate_kbps=2.0 if i % 2 == 0 else 8.0,
            downlink_rate_kbps=128.0 if i % 2 == 0 else 2048.0,
            buffer_utilization_pct=round(35.0 + random.random() * 20.0, 1),
            orbit_anomaly_deg=round((i * 30.0) % 360, 1),
            orbit_altitude_km=324.5,
            status="nominal",
            timestamp=now_time - timedelta(minutes=(12 - i) * 15),
            is_simulated="true"
        )
        db.add(rec)

    # 8. Mission Logs
    logs = [
        MissionLog(
            timestamp=now_time - timedelta(minutes=10),
            category="telemetry",
            severity="info",
            description="Deep Space Network Goldstone DSS-14 acquired carrier lock on X-band downlink (SNR: 15.4 dB).",
            mission_code="MARS-2026-JZ",
            data_source="DSN Real-Time Telemetry Monitor",
            user_action="Automatic Carrier Lock"
        ),
        MissionLog(
            timestamp=now_time - timedelta(minutes=25),
            category="science",
            severity="info",
            description="SuperCam laser spectroscopic burst completed on target 'Tenby-04' (30 shots fired, spectrum recorded).",
            mission_code="MARS-2026-JZ",
            data_source="SuperCam Science Team"
        ),
        MissionLog(
            timestamp=now_time - timedelta(minutes=55),
            category="hazard",
            severity="warning",
            description="Topographic hazard detector flagged 19.8-degree slope on delta scarp ascent approach.",
            mission_code="MARS-2026-JZ",
            data_source="AutoNav Hazard Engine",
            user_action="Trajectory Reroute Recommended"
        ),
        MissionLog(
            timestamp=now_time - timedelta(hours=2),
            category="navigation",
            severity="info",
            description="Autonomous ground drive completed: 84.6 meters traversed across delta regolith corridor.",
            mission_code="MARS-2026-JZ",
            data_source="Visual Odometry & IMU Subsystem"
        ),
        MissionLog(
            timestamp=now_time - timedelta(hours=4),
            category="system",
            severity="info",
            description="Daily MMRTG thermal dissipation and battery charge cycle verified within nominal margins.",
            mission_code="MARS-2026-JZ",
            data_source="Power Distribution Unit"
        )
    ]
    db.add_all(logs)

    # 9. Settings
    settings_items = [
        AppSetting(key="theme_accent", value="cyan", description="Primary UI mission control accent color"),
        AppSetting(key="coordinate_format", value="decimal", description="Display format for coordinates (decimal, dms, utm)"),
        AppSetting(key="default_region", value="jezero-crater", description="Default primary exploration target"),
        AppSetting(key="nasa_api_key", value="DEMO_KEY", description="NASA Open APIs API Key"),
        AppSetting(key="auto_refresh_sec", value="15", description="Telemetry polling interval in seconds"),
        AppSetting(key="demo_mode", value="true", description="Enable simulated telemetry when live Martian connection unavailable")
    ]
    db.add_all(settings_items)

    db.commit()
    print("[Seeder] Successfully populated database with mission records!")

    # 10. Seed Mission Control Astronauts, Telemetry, Minerals & Events
    seed_mission_control(db)

def seed_mission_control(db: Session):
    if db.query(Astronaut).first():
        return

    print("[Seeder] Populating Mission Control astronauts, health biometrics, and mineral discoveries...")
    
    # Fetch existing missions or create them
    m1 = db.query(Mission).filter(Mission.code == "MARS-2026-JZ").first()
    if not m1:
        m1 = Mission(
            code="MARS-2026-JZ",
            name="Jezero Fan Delta Astrobiology Expedition",
            status="active",
            region="Jezero Crater (Western Delta)",
            destination_planet="Mars",
            created_by_admin="abhay1307",
            target_coordinates_lat=18.38,
            target_coordinates_lon=77.58,
            duration_days=90,
            objectives="Human-assisted sampling of fine-grained delta mudstones and search for ancient fossilized biosignatures.",
            progress_percent=68.5,
            start_date=datetime.utcnow() - timedelta(days=42),
            last_telemetry_update=datetime.utcnow()
        )
        db.add(m1)
        db.flush()
    else:
        m1.created_by_admin = "abhay1307"
        m1.destination_planet = "Mars"
        m1.target_coordinates_lat = 18.38
        m1.target_coordinates_lon = 77.58
        m1.duration_days = 90
        m1.last_telemetry_update = datetime.utcnow()

    m2 = db.query(Mission).filter(Mission.code == "PERSEVERANCE-RIM").first()
    if m2:
        m2.created_by_admin = "abhay1307"
        m2.destination_planet = "Mars"
        m2.target_coordinates_lat = 18.45
        m2.target_coordinates_lon = 77.62
        m2.duration_days = 120
        m2.last_telemetry_update = datetime.utcnow()

    # Create Astronauts for Mission 1
    a1 = Astronaut(
        mission_id=m1.id,
        name="Cmdr. Abhay Pratap Singh",
        callsign="Pathfinder-1",
        role="Mission Commander & Astrobiologist",
        blood_type="O+",
        status="nominal",
        suit_id="EVA-MK4-CMD",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    )
    a2 = Astronaut(
        mission_id=m1.id,
        name="Dr. Elena Vance",
        callsign="Geology-Lead",
        role="Chief Planetary Geochemist",
        blood_type="A+",
        status="nominal",
        suit_id="EVA-MK4-GEO",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    )
    a3 = Astronaut(
        mission_id=m1.id,
        name="Lt. Marcus Chen",
        callsign="Vector-Zero",
        role="Flight Engineer & EVA Specialist",
        blood_type="B+",
        status="warning",
        suit_id="EVA-MK4-ENG",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    )
    db.add_all([a1, a2, a3])
    db.flush()

    # Seed Telemetry for each astronaut (historical 20 ticks)
    now = datetime.utcnow()
    astronaut_profiles = [
        (a1, 74.0, 22.0, 94.0, 96.0, 16.0, 29.6, 98.6, 1.25, 36.8, "Normal - All Vitals Nominal"),
        (a2, 82.0, 31.0, 89.0, 92.0, 24.0, 29.5, 97.8, 1.35, 36.9, "Normal - Core Drilling Operations"),
        (a3, 118.0, 68.0, 78.0, 81.0, 54.0, 29.4, 94.2, 1.85, 37.2, "Warning - High Exertion on Steep Scarp Traverse")
    ]

    for astro, base_hr, base_stress, base_alert, base_cog, base_fatigue, suit_p, o2_lvl, o2_cons, body_temp, med_warn in astronaut_profiles:
        for i in range(20):
            t = now - timedelta(minutes=(20 - i) * 3)
            hr = round(base_hr + (random.random() - 0.5) * 8.0, 1)
            hr_stat = "normal" if hr < 105 else "warning" if hr < 125 else "critical"
            tel = AstronautTelemetry(
                astronaut_id=astro.id,
                timestamp=t,
                heart_rate_bpm=hr,
                heart_rate_status=hr_stat,
                stress_level=round(base_stress + (random.random() - 0.5) * 5.0, 1),
                alertness_level=round(base_alert + (random.random() - 0.5) * 3.0, 1),
                cognitive_performance=round(base_cog + (random.random() - 0.5) * 2.5, 1),
                mental_fatigue=round(base_fatigue + (random.random() - 0.5) * 4.0, 1),
                eeg_alpha=round(10.2 + (random.random() - 0.5) * 1.5, 2),
                eeg_beta=round(18.5 + (random.random() - 0.5) * 2.5, 2),
                eeg_theta=round(5.4 + (random.random() - 0.5) * 1.0, 2),
                eeg_signal_status="synchronized" if hr < 115 else "high_stress",
                movement_state="active_walk" if i % 2 == 0 else "core_drilling",
                activity_level=round(50.0 + random.random() * 35.0, 1),
                steps_count=3500 + i * 45,
                suit_pressure_kpa=suit_p,
                oxygen_level_pct=round(o2_lvl - i * 0.05, 1),
                oxygen_consumption_l_min=o2_cons,
                suit_temp_c=21.4,
                co2_level_mmhg=round(2.1 + (random.random() - 0.5) * 0.3, 2),
                suit_integrity_status="sealed_nominal",
                body_temp_c=body_temp,
                overall_health_score=round(98.0 - (base_stress / 5.0) - (hr > 110) * 8.0, 1),
                medical_warning=med_warn,
                is_simulated=True
            )
            db.add(tel)

        if astro.status == "warning":
            al = HealthAlert(
                astronaut_id=astro.id,
                timestamp=now - timedelta(minutes=15),
                parameter="heart_rate",
                severity="warning",
                message=f"Tachycardia alert: Sustained 118 BPM during scarp boulder extraction.",
                value_recorded=118.0,
                threshold_limit=110.0,
                is_resolved=False
            )
            db.add(al)

    # Seed Mineral Discoveries
    minerals_data = [
        MineralDiscovery(
            mission_id=m1.id,
            name="Iron-Rich Smectite Clay",
            mineral_type="Phyllosilicate / Clay",
            quantity_discovered_kg=4.85,
            discovery_lat=18.412,
            discovery_lon=77.395,
            elevation_m=-2570.0,
            discovery_time=now - timedelta(days=12),
            chemical_formula="(Fe,Mg)3Si4O10(OH)2",
            mineral_composition="SiO2: 48.2%, Fe2O3: 24.6%, Al2O3: 11.2%, MgO: 6.4%, H2O: 9.6%",
            scientific_importance="Formed under neutral alkaline lake waters. Supreme biosignature preservation matrix capable of retaining organic carbon chains for billions of years.",
            sample_image_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
            verification_status="lab_confirmed",
            purity_pct=94.2,
            discovered_by_astronaut="Cmdr. Abhay Pratap Singh",
            is_simulated=True
        ),
        MineralDiscovery(
            mission_id=m1.id,
            name="Hydromagnesite (Marginal Carbonate)",
            mineral_type="Carbonate",
            quantity_discovered_kg=3.10,
            discovery_lat=18.438,
            discovery_lon=77.420,
            elevation_m=-2520.0,
            discovery_time=now - timedelta(days=6),
            chemical_formula="Mg5(CO3)4(OH)2·4H2O",
            mineral_composition="MgO: 43.1%, CO2: 36.4%, H2O: 20.5%",
            scientific_importance="Precipitated directly along ancient shoreline of Jezero paleolake. Traps microbial stromatolite textures and records ancient atmospheric CO2 pressure.",
            sample_image_url="https://images.unsplash.com/photo-1599818496337-34dc94d5ae21?w=400&auto=format&fit=crop&q=80",
            verification_status="verified_spectrometry",
            purity_pct=89.6,
            discovered_by_astronaut="Dr. Elena Vance",
            is_simulated=True
        ),
        MineralDiscovery(
            mission_id=m1.id,
            name="Hydrated Opaline Silica",
            mineral_type="Silica (Hydrated)",
            quantity_discovered_kg=1.85,
            discovery_lat=18.428,
            discovery_lon=77.382,
            elevation_m=-2550.0,
            discovery_time=now - timedelta(days=2),
            chemical_formula="SiO2·nH2O",
            mineral_composition="SiO2: 88.4%, H2O: 9.8%, Trace Fe: 1.8%",
            scientific_importance="Diagnostic of hydrothermal hot-spring discharge or deltaic sinter terraces. Premier target for micro-fossil entrapment.",
            sample_image_url="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80",
            verification_status="verified_spectrometry",
            purity_pct=91.4,
            discovered_by_astronaut="Cmdr. Abhay Pratap Singh",
            is_simulated=True
        ),
        MineralDiscovery(
            mission_id=m1.id,
            name="Olivine Cumulate Basalt",
            mineral_type="Igneous / Basalt",
            quantity_discovered_kg=6.40,
            discovery_lat=18.448,
            discovery_lon=77.460,
            elevation_m=-2590.0,
            discovery_time=now - timedelta(days=20),
            chemical_formula="(Mg,Fe)2SiO4",
            mineral_composition="Forsterite: 68%, Fayalite: 32%",
            scientific_importance="Crustal basement rock unit of Séítah floor. Provides radiometric age dating for the timing of Jezero impact basin formation.",
            sample_image_url="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
            verification_status="lab_confirmed",
            purity_pct=96.1,
            discovered_by_astronaut="Lt. Marcus Chen",
            is_simulated=True
        ),
        MineralDiscovery(
            mission_id=m1.id,
            name="Hydrothermal Gypsum Vein Outcrop",
            mineral_type="Sulfate",
            quantity_discovered_kg=2.45,
            discovery_lat=18.395,
            discovery_lon=77.340,
            elevation_m=-2490.0,
            discovery_time=now - timedelta(hours=18),
            chemical_formula="CaSO4·2H2O",
            mineral_composition="CaO: 32.5%, SO3: 46.5%, H2O: 21.0%",
            scientific_importance="Cross-cutting fracture veins showing subsurface water circulation occurring after the paleolake dried up.",
            sample_image_url="https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80",
            verification_status="verified_spectrometry",
            purity_pct=84.3,
            discovered_by_astronaut="Dr. Elena Vance",
            is_simulated=True
        )
    ]
    db.add_all(minerals_data)

    # Seed Timeline Events
    events_data = [
        MissionEvent(
            mission_id=m1.id,
            event_type="creation",
            title="Mission Authorized by Space Command",
            description="MARS-2026-JZ flight authorization signed by Lead Flight Director abhay1307.",
            severity="info",
            timestamp=now - timedelta(days=45),
            coordinates_lat=18.38,
            coordinates_lon=77.58
        ),
        MissionEvent(
            mission_id=m1.id,
            event_type="launch",
            title="Interplanetary Transfer Insertion (Earth Departure)",
            description="Starship Ares-3 trans-Mars injection burn executed with zero delta-v deviation.",
            severity="success",
            timestamp=now - timedelta(days=44)
        ),
        MissionEvent(
            mission_id=m1.id,
            event_type="landing",
            title="Touchdown at Octavia E. Butler Landing Corridor",
            description="Successful atmospheric entry, descent and powered landing on Jezero crater floor.",
            severity="success",
            timestamp=now - timedelta(days=42),
            coordinates_lat=18.4447,
            coordinates_lon=77.4508
        ),
        MissionEvent(
            mission_id=m1.id,
            astronaut_id=a1.id,
            event_type="exploration",
            title="First Crewed EVA Ingress onto Delta Front",
            description="Cmdr. Abhay Pratap Singh and Dr. Vance conducted 4.2-hour geological traverse.",
            severity="info",
            timestamp=now - timedelta(days=35),
            coordinates_lat=18.425,
            coordinates_lon=77.410
        ),
        MissionEvent(
            mission_id=m1.id,
            astronaut_id=a1.id,
            event_type="mineral_discovery",
            title="Discovery: 4.85 kg Iron-Rich Smectite Clay",
            description="Extracted sealed core sample from Tenby formation scarp. High biosignature potential.",
            severity="success",
            timestamp=now - timedelta(days=12),
            coordinates_lat=18.412,
            coordinates_lon=77.395
        ),
        MissionEvent(
            mission_id=m1.id,
            astronaut_id=a3.id,
            event_type="health_warning",
            title="Astronaut Biometric Warning: Elevated Heart Rate (118 BPM)",
            description="Lt. Chen registered high exertion during boulder extraction on 18-degree slope. Comm advised 10-minute rest stop.",
            severity="warning",
            timestamp=now - timedelta(minutes=25),
            coordinates_lat=18.435,
            coordinates_lon=77.465
        )
    ]
    db.add_all(events_data)
    db.commit()
    print("[Seeder] Successfully populated Mission Control astronaut telemetry and mineral discoveries!")
