import pytest
from app.services.shared_collection import SharedCollectionService
from app.prisma_client import prisma as db


@pytest.mark.asyncio
async def test_track_visit_new_user():
    """Test tracking a visit for a new user"""
    # Create a test shared collection
    collection = await db.sharedcollection.create({
        "data": {
            "title": "Test Collection",
            "slug": "test-collection",
            "description": "Test description"
        }
    })
    
    try:
        # Track a visit
        is_new_visit = await SharedCollectionService.track_visit(
            shared_collection_id=collection.id,
            user_id=1,
            ip_address="127.0.0.1",
            user_agent="test-agent"
        )
        
        # Should be a new visit
        assert is_new_visit == True
        
        # Check that the view was recorded
        view_count = await SharedCollectionService.get_visit_count(collection.id)
        assert view_count == 1
        
        # Check that the collection view_count was updated
        updated_collection = await db.sharedcollection.find_unique(where={"id": collection.id})
        assert updated_collection.view_count == 1
        
    finally:
        # Cleanup
        await db.sharedcollectionview.delete_many(where={"shared_collection_id": collection.id})
        await db.sharedcollection.delete(where={"id": collection.id})


@pytest.mark.asyncio
async def test_track_visit_duplicate_user():
    """Test that the same user can't visit twice"""
    # Create a test shared collection
    collection = await db.sharedcollection.create({
        "data": {
            "title": "Test Collection",
            "slug": "test-collection",
            "description": "Test description"
        }
    })
    
    try:
        # Track first visit
        is_new_visit1 = await SharedCollectionService.track_visit(
            shared_collection_id=collection.id,
            user_id=1,
            ip_address="127.0.0.1",
            user_agent="test-agent"
        )
        
        # Track second visit (same user)
        is_new_visit2 = await SharedCollectionService.track_visit(
            shared_collection_id=collection.id,
            user_id=1,
            ip_address="127.0.0.1",
            user_agent="test-agent"
        )
        
        # First should be new, second should not
        assert is_new_visit1 == True
        assert is_new_visit2 == False
        
        # View count should still be 1
        view_count = await SharedCollectionService.get_visit_count(collection.id)
        assert view_count == 1
        
    finally:
        # Cleanup
        await db.sharedcollectionview.delete_many(where={"shared_collection_id": collection.id})
        await db.sharedcollection.delete(where={"id": collection.id})


@pytest.mark.asyncio
async def test_track_visit_anonymous_user():
    """Test tracking visits for anonymous users"""
    # Create a test shared collection
    collection = await db.sharedcollection.create({
        "data": {
            "title": "Test Collection",
            "slug": "test-collection",
            "description": "Test description"
        }
    })
    
    try:
        # Track visit for anonymous user
        is_new_visit = await SharedCollectionService.track_visit(
            shared_collection_id=collection.id,
            user_id=None,
            ip_address="127.0.0.1",
            user_agent="test-agent"
        )
        
        # Should be a new visit
        assert is_new_visit == True
        
        # Check that the view was recorded
        view_count = await SharedCollectionService.get_visit_count(collection.id)
        assert view_count == 1
        
    finally:
        # Cleanup
        await db.sharedcollectionview.delete_many(where={"shared_collection_id": collection.id})
        await db.sharedcollection.delete(where={"id": collection.id}) 