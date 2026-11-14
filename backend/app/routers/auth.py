from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_current_admin
from app.schemas.log import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    # Verify administrator username and password
    if req.username != settings.ADMIN_USERNAME or req.password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mission flight-director credentials. Check ADMIN_USERNAME / ADMIN_PASSWORD in environment."
        )

    access_token = create_access_token(
        data={"sub": req.username, "role": "admin"},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": req.username,
        "role": "admin"
    }

@router.get("/me")
def get_current_user_info(current_admin: dict = Depends(get_current_admin)):
    return {
        "username": current_admin["username"],
        "role": current_admin["role"],
        "status": "authenticated",
        "privileges": "full_mission_control_write"
    }
