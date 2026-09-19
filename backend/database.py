"""
FarmWise Database Layer — MongoDB async driver (Motor).
Manages connection, indexes, and document formatting.
"""

import logging
from typing import Optional, Any
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorClient

from backend.config import MONGODB_URI, MONGODB_DATABASE

logger = logging.getLogger("farmwise.database")

# Global client and database instances
client: Optional[AsyncIOMotorClient] = None
db = None


async def get_db():
    """FastAPI dependency yielding the MongoDB database instance."""
    global db
    if db is None:
        await init_db()
    return db


async def init_db():
    """Initialize MongoDB client connection and create collection indexes."""
    global client, db
    if client is None:
        logger.info(f"Connecting to MongoDB at {MONGODB_URI} (Database: {MONGODB_DATABASE})")
        client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
        db = client[MONGODB_DATABASE]

    # --- Create Indexes ---
    try:
        # 1. users: unique email
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username")

        # 2. farm_profiles: user_id
        await db.farm_profiles.create_index("user_id")

        # 3. crops: user_id
        await db.crops.create_index("user_id")

        # 4. predictions: user_id
        await db.predictions.create_index("user_id")

        # 5. crop_health: user_id
        await db.crop_health.create_index("user_id")

        # 6. market_data: user_id & cropName
        await db.market_data.create_index("user_id")
        await db.market_data.create_index("cropName")

        # 7. crop_listings: user_id (seller)
        await db.crop_listings.create_index("user_id")
        await db.crop_listings.create_index("farmer_id")
        await db.crop_listings.create_index("is_active")

        # 8. orders: user_id (customer), farmer_id, order_number (unique)
        await db.orders.create_index("user_id")
        await db.orders.create_index("customer_id")
        await db.orders.create_index("farmer_id")
        await db.orders.create_index("order_number", unique=True)

        # 9. order_items: order_id
        await db.order_items.create_index("order_id")
        await db.order_items.create_index("user_id")

        # 10. reviews: user_id (customer), farmer_id, order_id
        await db.reviews.create_index("user_id")
        await db.reviews.create_index("customer_id")
        await db.reviews.create_index("farmer_id")
        await db.reviews.create_index("order_id")

        logger.info("MongoDB connection initialized & collection indexes verified.")
    except Exception as e:
        logger.warning(f"Error creating MongoDB indexes (may already exist or server starting): {e}")


async def close_db():
    """Close MongoDB client connection on shutdown."""
    global client, db
    if client:
        client.close()
        client = None
        db = None
        logger.info("MongoDB connection closed.")


def to_object_id(val: Any) -> Optional[ObjectId]:
    """Convert string/ObjectId to ObjectId safely."""
    if isinstance(val, ObjectId):
        return val
    if not val or not isinstance(val, str):
        return None
    try:
        return ObjectId(val)
    except InvalidId:
        return None


def format_doc(doc: Optional[dict]) -> Optional[dict]:
    """
    Format a MongoDB document for JSON serialization:
    - Replaces '_id' ObjectId with string 'id' and 'id' string.
    - Converts any ObjectId reference fields (user_id, farmer_id, customer_id, order_id, listing_id) to str.
    """
    if doc is None:
        return None

    formatted = {}
    for key, value in doc.items():
        if key == "_id":
            formatted["id"] = str(value)
            formatted["_id"] = str(value)
        elif isinstance(value, ObjectId):
            formatted[key] = str(value)
        elif isinstance(value, list):
            formatted[key] = [format_doc(item) if isinstance(item, dict) else (str(item) if isinstance(item, ObjectId) else item) for item in value]
        elif isinstance(value, dict):
            formatted[key] = format_doc(value)
        else:
            formatted[key] = value

    if "password_hash" in formatted:
        formatted.pop("password_hash", None)

    return formatted
