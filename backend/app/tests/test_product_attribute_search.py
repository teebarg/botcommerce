from types import SimpleNamespace

from app.services.product import ProductService, _decode_facet_token, _facet_token


def _variant(*, inventory, price, attributes=None, size=None, color=None, age=None, width=None, length=None):
    return SimpleNamespace(
        id=inventory + int(price),
        sku="SKU",
        product_id=1,
        price=price,
        old_price=None,
        inventory=inventory,
        size=size,
        color=color,
        age=age,
        width=width,
        length=length,
        attributes=attributes or {},
        status="IN_STOCK" if inventory else "OUT_OF_STOCK",
    )


def _product(variants, options=None):
    return SimpleNamespace(
        id=1,
        name="Test product",
        slug="test-product",
        description="Description",
        sku="TEST",
        active=True,
        is_new=False,
        options=options or [],
        categories=[],
        collections=[],
        images=[],
        variants=variants,
    )


def test_facet_tokens_are_case_insensitive():
    assert _facet_token("Size", "M") == _facet_token("size", "m")
    assert _decode_facet_token(_facet_token("Size", "M")) == ("Size", "M")


def test_search_document_uses_in_stock_attributes_and_legacy_fallback():
    service = ProductService.__new__(ProductService)
    product = _product([
        _variant(inventory=2, price=3000, attributes={"Size": "M", "Colour": "Red", "Age": "4-5 years"}),
        _variant(inventory=1, price=9000, attributes={"Size": "L", "Colour": "Blue", "Age": "4-5 years"}),
        _variant(inventory=0, price=1000, attributes={"Size": "S", "Colour": "Green", "Age": "4-5 years"}),
    ], options=[
        {"name": "Size", "values": ["M", "L", "S"]},
        {"name": "Colour", "values": ["Red", "Blue", "Green"]},
        {"name": "Age", "values": ["4-5 years"]},
    ])

    document = service.product_to_search_document(product)

    assert set(document["sizes"]) == {"M", "L"}
    assert set(document["colors"]) == {"Red", "Blue"}
    assert document["ages"] == ["4-5 years"]
    assert document["min_price"] == 3000
    assert document["max_price"] == 9000
    assert document["in_stock"] is True
    assert _facet_token("Size", "S") not in document["attribute_facets"]


def test_search_document_falls_back_to_legacy_columns():
    service = ProductService.__new__(ProductService)
    product = _product([
        _variant(inventory=1, price=5000, size="M", color="Black", age="8-9 years", width=32, length=34),
    ], options=[
        {"name": "Size", "values": ["M"]},
        {"name": "Color", "values": ["Black"]},
        {"name": "Age", "values": ["8-9 years"]},
        {"name": "Width", "values": ["32"]},
        {"name": "Length", "values": ["34"]},
    ])

    document = service.product_to_search_document(product)

    assert document["sizes"] == ["M"]
    assert document["colors"] == ["Black"]
    assert document["ages"] == ["8-9 years"]
    assert document["widths"] == [32]
    assert document["lengths"] == [34]
    assert _facet_token("Size", "M") in document["attribute_facets"]
    assert _facet_token("Length", "34") in document["attribute_facets"]


def test_price_filter_uses_overlapping_range_and_attribute_filters_are_and_or():
    service = ProductService.__new__(ProductService)
    filters = service._build_search_filters_list({
        "min_price": 1000,
        "max_price": 5000,
        "active": True,
        "attribute_filters": '{"Size":["M", "L"],"Colour":["Red"]}',
    })

    assert "max_price >= 1000" in filters
    assert "min_price <= 5000" in filters
    assert any('attribute_facets IN [' in item and _facet_token("Size", "M") in item and _facet_token("Size", "L") in item for item in filters)
    assert any('attribute_facets IN [' in item and _facet_token("Colour", "Red") in item for item in filters)
