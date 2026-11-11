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


def live_variants(product: Any) -> list[Any]:
    """The variants of `product` that should be visible to admins and customers."""
    variants = _get(product, "variants") or []
    options = _get(product, "options") or []
    return [v for v in variants if variant_fits_options(_get(v, "attributes"), options)]
