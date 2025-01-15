from app.models.generic import Brand, Category, Collection, Tag
from app.core.cruds.collection import CollectionCRUD
from app.core.cruds.brand import BrandCRUD
from app.core.cruds.category import CategoryCRUD
from app.core.cruds.siteconfig import SiteConfigCRUD
from app.models.config import SiteConfig
from app.core.cruds.tag import TagCRUD

brand = BrandCRUD(Brand)
category = CategoryCRUD(Category)
collection = CollectionCRUD(Collection)
siteconfig = SiteConfigCRUD(SiteConfig)
tag = TagCRUD(Tag)
