from typing import Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.setting import AppSetting
from app.schemas.log import SettingUpdate, SettingOut

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=Dict[str, str])
def get_settings(db: Session = Depends(get_db)):
    settings_records = db.query(AppSetting).all()
    return {s.key: s.value for s in settings_records}

@router.put("", response_model=Dict[str, str])
def update_setting(
    setting_in: SettingUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    setting = db.query(AppSetting).filter(AppSetting.key == setting_in.key).first()
    if not setting:
        setting = AppSetting(key=setting_in.key, value=setting_in.value, description=setting_in.description)
        db.add(setting)
    else:
        setting.value = setting_in.value
        if setting_in.description:
            setting.description = setting_in.description

    db.commit()
    all_settings = db.query(AppSetting).all()
    return {s.key: s.value for s in all_settings}
