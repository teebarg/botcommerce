import time
import pytest
from app.core.cache import L1Cache

def test_get_returns_none_when_missing():
    cache = L1Cache(max_size=10, ttl=5.0)
    assert cache.get("missing") is None

def test_set_then_get_roundtrips():
    cache = L1Cache(max_size=10, ttl=5.0)
    cache.set("k", {"foo": "bar"})
    assert cache.get("k") == {"foo": "bar"}

def test_entry_expires_after_ttl():
    cache = L1Cache(max_size=10, ttl=0.1)
    cache.set("k", "v")
    assert cache.get("k") == "v"
    time.sleep(0.15)
    assert cache.get("k") is None  # expired, evicted on read

def test_lru_eviction_when_over_max_size():
    cache = L1Cache(max_size=3, ttl=60)
    cache.set("a", 1)
    cache.set("b", 2)
    cache.set("c", 3)
    cache.get("a")          # touch "a" so it's not LRU anymore
    cache.set("d", 4)       # should evict "b" (least recently used), not "a"
    assert cache.get("a") == 1
    assert cache.get("b") is None
    assert cache.get("d") == 4

def test_delete_removes_specific_keys():
    cache = L1Cache(max_size=10, ttl=60)
    cache.set("a", 1)
    cache.set("b", 2)
    cache.delete("a")
    assert cache.get("a") is None
    assert cache.get("b") == 2