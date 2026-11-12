"""Helpers for deciding which variants are still part of a product.

A variant is "removed" when its attributes no longer fit the product's saved
options (for example the admin deleted the choice "Red"). Removed variants stay
in the database so order and cart history keep working, but they must never be
shown or sold.
"""
from typing import Any, Iterable


def _norm(value: Any) -> str:
    return str(value).strip().casefold()


def _get(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def attributes_key(attributes: dict | None) -> tuple[tuple[str, str], ...]:
    """Case and whitespace insensitive identity of a combination."""
    return tuple(sorted((_norm(k), _norm(v)) for k, v in (attributes or {}).items()))


def variant_fits_options(attributes: dict | None, options: Iterable[Any] | None) -> bool:
    attributes = attributes or {}
    option_values: dict[str, set[str]] = {}
    for option in options or []:
        name = _get(option, "name")
        if name is None:
            continue
        option_values[_norm(name)] = {_norm(v) for v in (_get(option, "values") or [])}

    # Products without options (legacy or single-variant products) keep every variant.
    if not option_values:
        return True

    normalized = {_norm(k): _norm(v) for k, v in attributes.items()}
    if set(normalized) != set(option_values):
        return False
    return all(value in option_values[name] for name, value in normalized.items())


def _legacy_variant_attributes(variant: Any, options: Iterable[Any] | None) -> dict[str, str]:
    """Reconstruct option attributes for pre-attributes variants during migration."""
    legacy_fields = {
        "size": "size",
        "color": "color",
        "colour": "color",
        "age": "age",
        "width": "width",
        "waist": "width",
        "length": "length",
    }
    option_names = {_norm(_get(option, "name")): _get(option, "name") for option in options or []}
    attributes: dict[str, str] = {}
    for normalized_name, legacy_field in legacy_fields.items():
        option_name = option_names.get(normalized_name)
        value = _get(variant, legacy_field)
        if option_name and value is not None and str(value).strip():
            attributes[str(option_name)] = str(value).strip()
    return attributes


def live_variants(product: Any) -> list[Any]:
    """The variants of `product` that should be visible to admins and customers."""
    variants = _get(product, "variants") or []
    options = _get(product, "options") or []
    live = []
    for variant in variants:
        attributes = _get(variant, "attributes") or {}
        # Legacy variants may still have their values only in the retired columns.
        # Reconstruct only known legacy option names so removed/custom options remain excluded.
        if not attributes and options:
            attributes = _legacy_variant_attributes(variant, options)
        if variant_fits_options(attributes, options):
            live.append(variant)
    return live
