from app.models.generic import ActivityLog, Address, Brand, Category, Collection, Product, Tag, User
from app.core.cruds.collection import CollectionCRUD
from app.core.cruds.brand import BrandCRUD
from app.core.cruds.category import CategoryCRUD
from app.core.cruds.siteconfig import SiteConfigCRUD
from app.models.config import SiteConfig
from app.core.cruds.tag import TagCRUD
from app.core.cruds.address import AddressCRUD
from app.core.cruds.product import ProductCRUD
from app.core.cruds.user import UserCRUD
from app.core.cruds.activities import ActivityCRUD

activities = ActivityCRUD(ActivityLog)
address = AddressCRUD(Address)
brand = BrandCRUD(Brand)
category = CategoryCRUD(Category)
collection = CollectionCRUD(Collection)
product = ProductCRUD(Product)
siteconfig = SiteConfigCRUD(SiteConfig)
tag = TagCRUD(Tag)
user = UserCRUD(User)