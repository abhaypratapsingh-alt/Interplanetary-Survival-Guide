from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_current_admin
from app.schemas.log import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Supported admin accounts
ADMIN_ACCOUNTS = {
    "abhay1307": {
        "password": "Abhay@0980",
        "email": "abhaypratapsingh@gmail.com",
        "name": "Abhay Pratap Singh",
        "role": "Lead Flight Director & Chief Astrobiologist"
    },
    "flight-director": {
        "password": "PathfinderMars2026!",
        "email": "flight-ops@nasa.gov",
        "name": "NASA Flight Operations",
        "role": "Mission Flight Director"
    }
}

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    user_match = None
    if req.username in ADMIN_ACCOUNTS and ADMIN_ACCOUNTS[req.username]["password"] == req.password:
        user_match = ADMIN_ACCOUNTS[req.username]
    elif req.username == settings.ADMIN_USERNAME and req.password == settings.ADMIN_PASSWORD:
        user_match = {
            "email": settings.ADMIN_EMAIL,
            "name": req.username,
            "role": "admin"
        }

    if not user_match:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mission flight-director credentials. Authorized admin access required."
        )

    access_token = create_access_token(
        data={"sub": req.username, "role": "admin", "email": user_match["email"]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": req.username,
        "email": user_match["email"],
        "role": "admin"
    }

@router.get("/me")
def get_current_user_info(current_admin: dict = Depends(get_current_admin)):
    uname = current_admin["username"]
    account_info = ADMIN_ACCOUNTS.get(uname, {
        "email": settings.ADMIN_EMAIL if uname == settings.ADMIN_USERNAME else "admin@mars.pathfinder",
        "name": uname,
        "role": "Administrator"
    })
    return {
        "username": uname,
        "email": account_info.get("email"),
        "name": account_info.get("name"),
        "role": current_admin.get("role", "admin"),
        "designation": account_info.get("role", "Mission Director"),
        "status": "authenticated",
        "privileges": "full_mission_control_write"
    }
