from app.core.cruds.activities import ActivityCRUD
from app.core.cruds.address import AddressCRUD
from app.core.cruds.brand import BrandCRUD
from app.core.cruds.category import CategoryCRUD
from app.core.cruds.collection import CollectionCRUD
from app.core.cruds.product import ProductCRUD
from app.core.cruds.reviews import ReviewCRUD
from app.core.cruds.siteconfig import SiteConfigCRUD
from app.core.cruds.tag import TagCRUD
from app.core.cruds.user import UserCRUD
from app.models.config import SiteConfig
from app.models.product import Product
from app.models.reviews import Review
from app.models.tag import Tag
from app.models.user import User
from app.models.brand import Brand
from app.models.category import Category
from app.models.collection import Collection
from app.models.activities import ActivityLog
from app.models.address import Address


activities = ActivityCRUD(ActivityLog)
address = AddressCRUD(Address)
brand = BrandCRUD(Brand)
category = CategoryCRUD(Category)
collection = CollectionCRUD(Collection)
product = ProductCRUD(Product)
siteconfig = SiteConfigCRUD(SiteConfig)
review = ReviewCRUD(Review)
tag = TagCRUD(Tag)
user = UserCRUD(User)
