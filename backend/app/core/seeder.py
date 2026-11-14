from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.models import (
    Mission,
    MissionTask,
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
    # Check if already seeded
    if db.query(Sensor).first():
        return

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
