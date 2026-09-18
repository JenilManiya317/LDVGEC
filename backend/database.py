"""
FarmWise Database Layer.
SQLite database with async access via aiosqlite.
"""

import aiosqlite
from backend.config import DB_PATH

DATABASE_URL = str(DB_PATH)


async def get_db():
    """Dependency that yields an async SQLite connection."""
    db = await aiosqlite.connect(DATABASE_URL)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()


async def init_db():
    """Create all tables if they don't exist."""
    async with aiosqlite.connect(DATABASE_URL) as db:
        await db.executescript(SCHEMA_SQL)
        await db.commit()


SCHEMA_SQL = """
-- Users table (farmers and customers)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('farmer', 'customer')),
    phone TEXT DEFAULT '',
    location TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    farm_name TEXT DEFAULT '',
    total_area TEXT DEFAULT '',
    rating REAL DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farm profiles
CREATE TABLE IF NOT EXISTS farm_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    total_area REAL DEFAULT 0,
    state TEXT DEFAULT '',
    district TEXT DEFAULT '',
    soil_type TEXT DEFAULT '',
    irrigation_type TEXT DEFAULT '',
    location TEXT DEFAULT '',
    active_crops TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop marketplace listings
CREATE TABLE IF NOT EXISTS crop_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id INTEGER NOT NULL REFERENCES users(id),
    crop_name TEXT NOT NULL,
    category TEXT DEFAULT 'Vegetables',
    variety TEXT DEFAULT '',
    description TEXT DEFAULT '',
    price_per_kg REAL NOT NULL,
    unit TEXT DEFAULT 'kg',
    available_stock_kg REAL NOT NULL,
    is_organic INTEGER DEFAULT 0,
    harvest_date TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL REFERENCES users(id),
    farmer_id INTEGER NOT NULL REFERENCES users(id),
    subtotal REAL NOT NULL,
    delivery_fee REAL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT DEFAULT 'Cash on Delivery',
    payment_status TEXT DEFAULT 'Pending',
    delivery_method TEXT DEFAULT 'Standard Delivery',
    delivery_name TEXT DEFAULT '',
    delivery_phone TEXT DEFAULT '',
    delivery_address TEXT DEFAULT '',
    delivery_city TEXT DEFAULT '',
    delivery_state TEXT DEFAULT '',
    delivery_pincode TEXT DEFAULT '',
    current_status_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    listing_id INTEGER NOT NULL REFERENCES crop_listings(id),
    crop_name TEXT NOT NULL,
    quantity_kg REAL NOT NULL,
    price_per_kg REAL NOT NULL,
    total_price REAL NOT NULL
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    customer_id INTEGER NOT NULL REFERENCES users(id),
    farmer_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""
