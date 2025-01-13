from typing import Optional
from sqlalchemy.orm import Session
from sqlmodel import  select
from app.models.config import SiteConfig, SiteConfigCreate, SiteConfigUpdate

def configs(db: Session) -> Optional[SiteConfig]:
    configs = db.query(SiteConfig).all()
    return {config.key: config.value for config in configs}


def all(db: Session) -> Optional[SiteConfig]:
    return db.query(SiteConfig).all()

def get(db: Session, id: str) -> Optional[SiteConfig]:
    return db.get(SiteConfig, id)

def get_by_key(
    db: Session, value: str | int, key: str = "key"
) -> Optional[SiteConfig]:
    statement = select(SiteConfig).where(getattr(SiteConfig, key) == value)
    return db.exec(statement).first()

def create(db: Session, obj_in: SiteConfigCreate) -> SiteConfig:
    db_obj = SiteConfig.model_validate(obj_in)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, db_obj: SiteConfig, obj_in: SiteConfigUpdate) -> SiteConfig:
    # update_data = obj_in.dict(exclude_unset=True)
    
    # for field, value in update_data.items():
    #     if value is not None:
    #         setattr(db_obj, field, value)
    update_data = obj_in.model_dump(exclude_unset=True)
    db_obj.sqlmodel_update(update_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, *, id: int) -> SiteConfig:
    db_obj = db.get(SiteConfig, id)
    db.delete(db_obj)
    db.commit()
    return db_obj
    