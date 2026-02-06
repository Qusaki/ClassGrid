from typing import Optional

from beanie import Document


class Item(Document):
    name: str
    description: Optional[str] = None
    price: float

    class Settings:
        name = "items"
