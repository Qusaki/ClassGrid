import pytest

from app.models import Item


@pytest.mark.asyncio
async def test_db_connection():
    # Initialize Beanie handled by conftest
    pass

    # Create an item
    item = Item(name="Test Item", price=10.0)
    await item.insert()

    # Retrieve the item
    retrieved_item = await Item.find_one(Item.name == "Test Item")
    assert retrieved_item is not None
    assert retrieved_item.name == "Test Item"
    assert retrieved_item.price == 10.0

    # Cleanup
    await retrieved_item.delete()
