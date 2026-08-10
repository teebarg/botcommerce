from enum import Enum


class ShopSettingsType(str, Enum):
    FEATURE = "FEATURE"
    SHOP_DETAIL = "SHOP_DETAIL"
    CUSTOM = "CUSTOM"