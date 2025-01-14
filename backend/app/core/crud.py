from app.models.generic import Brand, Category, Collection
from app.core.cruds.collection import CollectionCRUD
from app.core.cruds.brand import BrandCRUD
from app.core.cruds.category import CategoryCRUD
from app.core.cruds.siteconfig import SiteConfigCRUD
from app.models.config import SiteConfig

brand = BrandCRUD(Brand)
category = CategoryCRUD(Category)
collection = CollectionCRUD(Collection)
siteconfig = SiteConfigCRUD(SiteConfig)
