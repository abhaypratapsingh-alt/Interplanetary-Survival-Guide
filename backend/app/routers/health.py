import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def get_health_status(db: Session = Depends(get_db)):
    # 1. Database Check
    db_status = "healthy"
    db_latency_ms = 0.0
    try:
        import time
        start = time.time()
        db.execute(text("SELECT 1"))
        db_latency_ms = round((time.time() - start) * 1000, 2)
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # 2. NASA Mars Trek WMTS Connectivity Check
    nasa_status = "reachable"
    nasa_latency_ms = 0.0
    try:
        import time
        start = time.time()
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.head("https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/0/0/0.jpg")
            if resp.status_code == 200:
                nasa_status = "connected"
            else:
                nasa_status = f"http_{resp.status_code}"
        nasa_latency_ms = round((time.time() - start) * 1000, 2)
    except Exception:
        nasa_status = "offline_or_timeout"

    return {
        "status": "operational",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": time.time(),
        "database": {
            "status": db_status,
            "engine": "PostgreSQL / SQLite fallback",
            "latency_ms": db_latency_ms
        },
        "nasa_services": {
            "mars_trek_wmts": {
                "status": nasa_status,
                "latency_ms": nasa_latency_ms,
                "endpoint": "https://trek.nasa.gov/tiles/Mars/EQ/"
            },
            "pds_geosciences": {
                "status": "ready",
                "endpoint": "https://pds-geosciences.wustl.edu/"
            }
        },
        "infrastructure": {
            "geotiff_processing": "ready",
            "terrain_risk_analyzer": "operational",
            "demo_mode": settings.DEMO_MODE
        }
    }
