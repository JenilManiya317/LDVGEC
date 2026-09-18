"""
Marketplace Router — Farmer crop listings, customer orders, and reviews.
"""

import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel

from backend.config import JWT_SECRET, JWT_ALGORITHM
from backend.database import get_db
from jose import jwt as jose_jwt

logger = logging.getLogger("farmwise.marketplace")
router = APIRouter(prefix="/api", tags=["Marketplace"])


# --- Helpers ---

def _extract_user_id(authorization: str) -> Optional[int]:
    """Extract user_id from Bearer token."""
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    try:
        payload = jose_jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except Exception:
        return None


# --- Pydantic Models ---

class CreateListingRequest(BaseModel):
    crop_name: str
    category: str = "Vegetables"
    variety: str = ""
    description: str = ""
    price_per_kg: float
    unit: str = "kg"
    available_stock_kg: float
    is_organic: bool = False
    harvest_date: str = ""
    image_url: str = ""


class UpdateListingRequest(BaseModel):
    crop_name: Optional[str] = None
    category: Optional[str] = None
    variety: Optional[str] = None
    description: Optional[str] = None
    price_per_kg: Optional[float] = None
    available_stock_kg: Optional[float] = None
    is_organic: Optional[bool] = None
    harvest_date: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class OrderItemInput(BaseModel):
    listing_id: int
    quantity_kg: float


class CreateOrderRequest(BaseModel):
    items: list[OrderItemInput]
    delivery_name: str
    delivery_phone: str
    delivery_address: str
    delivery_city: str
    delivery_state: str
    delivery_pincode: str
    payment_method: str = "Cash on Delivery"
    delivery_method: str = "Standard Delivery"


class UpdateOrderStatusRequest(BaseModel):
    current_status_index: int


class CreateReviewRequest(BaseModel):
    order_id: int
    rating: int
    comment: str = ""


# --- Listing Routes ---

@router.get("/marketplace/listings")
async def list_all_listings(
    category: str = "",
    search: str = "",
    limit: int = 50,
    db=Depends(get_db),
):
    """Browse all active crop listings."""
    query = """
        SELECT cl.*, u.name as farmer_name, u.farm_name, u.location as farmer_location,
               u.avatar as farmer_avatar, u.phone as farmer_phone, u.rating as farmer_rating,
               u.reviews_count as farmer_reviews_count
        FROM crop_listings cl
        JOIN users u ON cl.farmer_id = u.id
        WHERE cl.is_active = 1
    """
    params = []

    if category:
        query += " AND cl.category = ?"
        params.append(category)

    if search:
        query += " AND cl.crop_name LIKE ?"
        params.append(f"%{search}%")

    query += " ORDER BY cl.created_at DESC LIMIT ?"
    params.append(limit)

    async with db.execute(query, params) as cursor:
        rows = await cursor.fetchall()

    listings = []
    for row in rows:
        d = dict(row)
        d["is_organic"] = bool(d.get("is_organic", 0))
        d["is_active"] = bool(d.get("is_active", 1))
        listings.append(d)

    return {"listings": listings, "total": len(listings)}


@router.post("/marketplace/listings")
async def create_listing(
    req: CreateListingRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Farmer creates a new crop listing."""
    user_id = _extract_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    await db.execute(
        """INSERT INTO crop_listings
           (farmer_id, crop_name, category, variety, description, price_per_kg,
            unit, available_stock_kg, is_organic, harvest_date, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            user_id, req.crop_name, req.category, req.variety, req.description,
            req.price_per_kg, req.unit, req.available_stock_kg,
            1 if req.is_organic else 0, req.harvest_date, req.image_url,
        ),
    )
    await db.commit()

    # Return the created listing
    async with db.execute(
        "SELECT * FROM crop_listings WHERE farmer_id = ? ORDER BY id DESC LIMIT 1", (user_id,)
    ) as cursor:
        row = await cursor.fetchone()

    return {"status": "created", "listing": dict(row)}


@router.get("/marketplace/listings/{listing_id}")
async def get_listing(listing_id: int, db=Depends(get_db)):
    """Get a single listing by ID."""
    async with db.execute(
        """SELECT cl.*, u.name as farmer_name, u.farm_name, u.location as farmer_location,
                  u.avatar as farmer_avatar, u.phone as farmer_phone, u.rating as farmer_rating,
                  u.reviews_count as farmer_reviews_count
           FROM crop_listings cl JOIN users u ON cl.farmer_id = u.id WHERE cl.id = ?""",
        (listing_id,),
    ) as cursor:
        row = await cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Listing not found")

    d = dict(row)
    d["is_organic"] = bool(d.get("is_organic", 0))
    return d


@router.put("/marketplace/listings/{listing_id}")
async def update_listing(
    listing_id: int,
    req: UpdateListingRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Update a listing (farmer only)."""
    user_id = _extract_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify ownership
    async with db.execute(
        "SELECT farmer_id FROM crop_listings WHERE id = ?", (listing_id,)
    ) as cursor:
        row = await cursor.fetchone()
    if not row or dict(row)["farmer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")

    updates = {}
    for k, v in req.model_dump().items():
        if v is not None:
            if k == "is_organic":
                updates[k] = 1 if v else 0
            elif k == "is_active":
                updates[k] = 1 if v else 0
            else:
                updates[k] = v

    if updates:
        updates["updated_at"] = "CURRENT_TIMESTAMP"
        set_clause = ", ".join(f"{k} = ?" for k in updates.keys() if k != "updated_at")
        set_clause += ", updated_at = CURRENT_TIMESTAMP"
        values = [v for k, v in updates.items() if k != "updated_at"]
        values.append(listing_id)
        await db.execute(f"UPDATE crop_listings SET {set_clause} WHERE id = ?", values)
        await db.commit()

    return {"status": "updated"}


@router.delete("/marketplace/listings/{listing_id}")
async def delete_listing(
    listing_id: int,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Soft-delete a listing (set inactive)."""
    user_id = _extract_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    await db.execute(
        "UPDATE crop_listings SET is_active = 0 WHERE id = ? AND farmer_id = ?",
        (listing_id, user_id),
    )
    await db.commit()
    return {"status": "deleted"}


# --- Order Routes ---

@router.post("/orders")
async def create_order(
    req: CreateOrderRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Customer places a new order."""
    user_id = _extract_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    order_number = f"FW-{uuid.uuid4().hex[:8].upper()}"

    # Calculate totals from listing items
    subtotal = 0.0
    order_items_data = []
    farmer_id = None

    for item in req.items:
        async with db.execute(
            "SELECT * FROM crop_listings WHERE id = ? AND is_active = 1", (item.listing_id,)
        ) as cursor:
            listing = await cursor.fetchone()

        if not listing:
            raise HTTPException(status_code=404, detail=f"Listing {item.listing_id} not found")

        listing_dict = dict(listing)
        item_total = listing_dict["price_per_kg"] * item.quantity_kg
        subtotal += item_total
        farmer_id = listing_dict["farmer_id"]

        order_items_data.append({
            "listing_id": item.listing_id,
            "crop_name": listing_dict["crop_name"],
            "quantity_kg": item.quantity_kg,
            "price_per_kg": listing_dict["price_per_kg"],
            "total_price": item_total,
        })

    delivery_fee = 50 if subtotal < 500 else 0
    total = subtotal + delivery_fee

    await db.execute(
        """INSERT INTO orders
           (order_number, customer_id, farmer_id, subtotal, delivery_fee, total,
            payment_method, delivery_method, delivery_name, delivery_phone,
            delivery_address, delivery_city, delivery_state, delivery_pincode)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            order_number, user_id, farmer_id, subtotal, delivery_fee, total,
            req.payment_method, req.delivery_method, req.delivery_name, req.delivery_phone,
            req.delivery_address, req.delivery_city, req.delivery_state, req.delivery_pincode,
        ),
    )
    await db.commit()

    # Get order ID
    async with db.execute(
        "SELECT id FROM orders WHERE order_number = ?", (order_number,)
    ) as cursor:
        order_row = await cursor.fetchone()
    order_id = dict(order_row)["id"]

    # Insert order items
    for oi in order_items_data:
        await db.execute(
            """INSERT INTO order_items (order_id, listing_id, crop_name, quantity_kg, price_per_kg, total_price)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (order_id, oi["listing_id"], oi["crop_name"], oi["quantity_kg"], oi["price_per_kg"], oi["total_price"]),
        )
    await db.commit()

    return {
        "status": "created",
        "order_number": order_number,
        "order_id": order_id,
        "total": total,
    }


@router.get("/orders")
async def list_orders(
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Get all orders for the current user."""
    user_id = _extract_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    async with db.execute(
        """SELECT o.*, u.name as farmer_name, u.phone as farmer_phone
           FROM orders o JOIN users u ON o.farmer_id = u.id
           WHERE o.customer_id = ? OR o.farmer_id = ?
           ORDER BY o.created_at DESC""",
        (user_id, user_id),
    ) as cursor:
        rows = await cursor.fetchall()

    orders = []
    for row in rows:
        order = dict(row)
        # Get order items
        async with db.execute(
            "SELECT * FROM order_items WHERE order_id = ?", (order["id"],)
        ) as item_cursor:
            items = [dict(ir) for ir in await item_cursor.fetchall()]
        order["items"] = items
        orders.append(order)

    return {"orders": orders}


@router.get("/orders/{order_id}")
async def get_order(order_id: int, authorization: str = Header(default=""), db=Depends(get_db)):
    """Get order details."""
    async with db.execute(
        """SELECT o.*, u.name as farmer_name, u.phone as farmer_phone
           FROM orders o JOIN users u ON o.farmer_id = u.id WHERE o.id = ?""",
        (order_id,),
    ) as cursor:
        row = await cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    order = dict(row)
    async with db.execute(
        "SELECT * FROM order_items WHERE order_id = ?", (order_id,)
    ) as cursor:
        items = [dict(ir) for ir in await cursor.fetchall()]
    order["items"] = items

    return order


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    req: UpdateOrderStatusRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Farmer updates order status (0=Placed, 1=Paid, 2=Accepted, 3=Packed, 4=Out for delivery, 5=Delivered)."""
    user_id = _extract_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    await db.execute(
        "UPDATE orders SET current_status_index = ? WHERE id = ? AND farmer_id = ?",
        (req.current_status_index, order_id, user_id),
    )
    await db.commit()
    return {"status": "updated", "new_status_index": req.current_status_index}


# --- Review Routes ---

@router.post("/reviews")
async def create_review(
    req: CreateReviewRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Customer submits a review for a completed order."""
    user_id = _extract_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Get farmer_id from order
    async with db.execute("SELECT farmer_id FROM orders WHERE id = ?", (req.order_id,)) as cursor:
        order_row = await cursor.fetchone()
    if not order_row:
        raise HTTPException(status_code=404, detail="Order not found")

    farmer_id = dict(order_row)["farmer_id"]

    await db.execute(
        "INSERT INTO reviews (order_id, customer_id, farmer_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
        (req.order_id, user_id, farmer_id, req.rating, req.comment),
    )

    # Update farmer rating
    async with db.execute(
        "SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE farmer_id = ?",
        (farmer_id,),
    ) as cursor:
        stats = dict(await cursor.fetchone())

    await db.execute(
        "UPDATE users SET rating = ?, reviews_count = ? WHERE id = ?",
        (round(stats["avg_rating"], 1), stats["cnt"], farmer_id),
    )
    await db.commit()

    return {"status": "created", "rating": req.rating}
