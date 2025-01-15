from app.core.cruds.base import BaseCRUD
from sqlmodel import Session

from app.models.config import SiteConfig, SiteConfigCreate, SiteConfigUpdate


class SiteConfigCRUD(BaseCRUD[SiteConfig, SiteConfigCreate, SiteConfigUpdate]):
    def configs(db: Session) -> SiteConfig | None:
        configs = db.query(SiteConfig).all()
        return {config.key: config.value for config in configs}
