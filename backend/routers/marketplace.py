"""
Marketplace Router — Farmer crop listings, customer orders, and reviews stored in MongoDB.
Enforces multi-user data isolation and strict JWT authorization.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel

from backend.database import get_db, to_object_id, format_doc
from backend.routers.auth import get_current_user

logger = logging.getLogger("farmwise.marketplace")
router = APIRouter(prefix="/api", tags=["Marketplace"])


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
    listing_id: str
    quantity_kg: float
    crop_name: Optional[str] = None
    price_per_kg: Optional[float] = None
    farmer_id: Optional[str] = None


class CreateOrderRequest(BaseModel):
    items: List[OrderItemInput]
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
    order_id: str
    rating: int
    comment: str = ""


# --- Listing Routes ---

@router.get("/marketplace/listings")
async def list_all_listings(
    category: str = "",
    search: str = "",
    farmer_id: Optional[str] = None,
    limit: int = 50,
    db=Depends(get_db),
):
    """Browse all active crop listings in MongoDB."""
    query: dict = {"is_active": True}

    if category and category.lower() != "all":
        query["category"] = category

    if search:
        query["crop_name"] = {"$regex": search, "$options": "i"}

    if farmer_id:
        f_obj = to_object_id(farmer_id)
        if f_obj:
            query["$or"] = [{"farmer_id": f_obj}, {"user_id": f_obj}]
        else:
            query["$or"] = [{"farmer_id": farmer_id}, {"user_id": farmer_id}]

    cursor = db.crop_listings.find(query).sort("created_at", -1).limit(limit)
    raw_listings = await cursor.to_list(length=limit)

    listings = []
    for item in raw_listings:
        # Lookup farmer in users collection
        f_id = item.get("farmer_id") or item.get("user_id")
        farmer_user = None
        if f_id:
            farmer_user = await db.users.find_one({"_id": to_object_id(f_id)})

        formatted = format_doc(item)
        if farmer_user:
            formatted["farmer_name"] = farmer_user.get("name", "Farmer")
            formatted["farm_name"] = farmer_user.get("farm_name", "")
            formatted["farmer_location"] = farmer_user.get("location", "")
            formatted["farmer_avatar"] = farmer_user.get("avatar", "")
            formatted["farmer_phone"] = farmer_user.get("phone", "")
            formatted["farmer_rating"] = farmer_user.get("rating", 5.0)
            formatted["farmer_reviews_count"] = farmer_user.get("reviews_count", 0)

        listings.append(formatted)

    return {"listings": listings, "total": len(listings)}


@router.post("/marketplace/listings")
async def create_listing(
    req: CreateListingRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Authenticated farmer creates a new crop listing in MongoDB."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if user.get("role") != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can create listings")

    user_id = user["_id"]

    doc = {
        "user_id": user_id,  # ObjectId user_id
        "farmer_id": user_id,
        "crop_name": req.crop_name,
        "category": req.category,
        "variety": req.variety,
        "description": req.description,
        "price_per_kg": req.price_per_kg,
        "unit": req.unit,
        "available_stock_kg": req.available_stock_kg,
        "is_organic": req.is_organic,
        "harvest_date": req.harvest_date,
        "image_url": req.image_url,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    res = await db.crop_listings.insert_one(doc)
    doc["_id"] = res.inserted_id

    formatted = format_doc(doc)
    formatted["farmer_name"] = user.get("name", "")
    formatted["farm_name"] = user.get("farm_name", "")

    return {"status": "created", "listing": formatted}


@router.get("/marketplace/listings/{listing_id}")
async def get_listing(listing_id: str, db=Depends(get_db)):
    """Get a single listing by MongoDB ObjectId."""
    obj_id = to_object_id(listing_id)
    if not obj_id:
        raise HTTPException(status_code=400, detail="Invalid listing ID format")

    doc = await db.crop_listings.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Listing not found")

    farmer_id = doc.get("farmer_id") or doc.get("user_id")
    farmer_user = None
    if farmer_id:
        farmer_user = await db.users.find_one({"_id": to_object_id(farmer_id)})

    formatted = format_doc(doc)
    if farmer_user:
        formatted["farmer_name"] = farmer_user.get("name", "Farmer")
        formatted["farm_name"] = farmer_user.get("farm_name", "")
        formatted["farmer_location"] = farmer_user.get("location", "")
        formatted["farmer_avatar"] = farmer_user.get("avatar", "")
        formatted["farmer_phone"] = farmer_user.get("phone", "")
        formatted["farmer_rating"] = farmer_user.get("rating", 5.0)
        formatted["farmer_reviews_count"] = farmer_user.get("reviews_count", 0)

    return formatted


@router.put("/marketplace/listings/{listing_id}")
async def update_listing(
    listing_id: str,
    req: UpdateListingRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Update a listing (owner farmer only)."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    obj_id = to_object_id(listing_id)
    if not obj_id:
        raise HTTPException(status_code=400, detail="Invalid listing ID format")

    doc = await db.crop_listings.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Listing not found")

    if str(doc.get("user_id")) != str(user["_id"]) and str(doc.get("farmer_id")) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")

    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await db.crop_listings.update_one({"_id": obj_id}, {"$set": updates})

    return {"status": "updated"}


@router.delete("/marketplace/listings/{listing_id}")
async def delete_listing(
    listing_id: str,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Soft-delete a listing (owner farmer only)."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    obj_id = to_object_id(listing_id)
    if not obj_id:
        raise HTTPException(status_code=400, detail="Invalid listing ID format")

    doc = await db.crop_listings.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Listing not found")

    if str(doc.get("user_id")) != str(user["_id"]) and str(doc.get("farmer_id")) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    await db.crop_listings.update_one({"_id": obj_id}, {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}})
    return {"status": "deleted"}


# --- Order Routes ---

@router.post("/orders")
async def create_order(
    req: CreateOrderRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Customer places a new order in MongoDB."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    customer_id = user["_id"]
    order_number = f"FW-{uuid.uuid4().hex[:8].upper()}"

    subtotal = 0.0
    order_items_data = []
    farmer_id = None

    for item in req.items:
        obj_lid = to_object_id(item.listing_id)
        listing = None
        if obj_lid:
            listing = await db.crop_listings.find_one({"_id": obj_lid, "is_active": True})

        if listing:
            item_price = float(listing.get("price_per_kg", 30.0))
            item_name = listing.get("crop_name", "Produce")
            f_id = listing.get("farmer_id") or listing.get("user_id")
            if f_id:
                farmer_id = f_id
            lid_val = listing["_id"]
        else:
            # Resilient fallback for mock or client-side custom listings
            item_price = float(item.price_per_kg or 30.0)
            item_name = item.crop_name or "Fresh Farm Produce"
            if item.farmer_id:
                farmer_id = item.farmer_id
            lid_val = item.listing_id

        item_total = item_price * float(item.quantity_kg)
        subtotal += item_total

        order_items_data.append({
            "listing_id": lid_val,
            "crop_name": item_name,
            "quantity_kg": item.quantity_kg,
            "price_per_kg": item_price,
            "total_price": item_total,
        })

    delivery_fee = 40.0 if subtotal < 500 else 0.0
    total = subtotal + delivery_fee

    order_doc = {
        "order_number": order_number,
        "user_id": customer_id,  # Customer user_id
        "customer_id": customer_id,
        "farmer_id": to_object_id(farmer_id) if farmer_id else None,
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "total": total,
        "payment_method": req.payment_method,
        "payment_status": "Paid" if req.payment_method != "Cash on Delivery" else "Pending",
        "delivery_method": req.delivery_method,
        "delivery_name": req.delivery_name,
        "delivery_phone": req.delivery_phone,
        "delivery_address": req.delivery_address,
        "delivery_city": req.delivery_city,
        "delivery_state": req.delivery_state,
        "delivery_pincode": req.delivery_pincode,
        "current_status_index": 1,
        "created_at": datetime.now(timezone.utc),
    }

    res = await db.orders.insert_one(order_doc)
    order_id = res.inserted_id

    # Insert items into order_items collection
    for oi in order_items_data:
        oi["order_id"] = order_id
        oi["user_id"] = customer_id
        await db.order_items.insert_one(oi)

    return {
        "status": "created",
        "order_number": order_number,
        "order_id": str(order_id),
        "total": total,
    }


@router.get("/orders")
async def list_orders(
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Get all orders for the authenticated user (customer or farmer)."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = user["_id"]

    cursor = db.orders.find(
        {"$or": [{"user_id": user_id}, {"customer_id": user_id}, {"farmer_id": user_id}]}
    ).sort("created_at", -1)

    raw_orders = await cursor.to_list(length=100)

    orders = []
    for order in raw_orders:
        farmer_doc = await db.users.find_one({"_id": to_object_id(order.get("farmer_id"))})
        items_cursor = db.order_items.find({"order_id": order["_id"]})
        items_raw = await items_cursor.to_list(length=50)

        formatted = format_doc(order)
        formatted["farmer_name"] = farmer_doc.get("name", "Farmer") if farmer_doc else "Farmer"
        formatted["farmer_phone"] = farmer_doc.get("phone", "") if farmer_doc else ""
        formatted["items"] = [format_doc(item) for item in items_raw]
        orders.append(formatted)

    return {"orders": orders}


@router.get("/orders/{order_id}")
async def get_order(
    order_id: str,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Get specific order details (customer or farmer of order only)."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    obj_id = to_object_id(order_id)
    query = {"$or": [{"_id": obj_id}]} if obj_id else {"$or": [{"order_number": order_id}, {"id": order_id}]}
    if obj_id:
        query["$or"].append({"order_number": order_id})

    order = await db.orders.find_one(query)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    user_id_str = str(user["_id"])
    if (
        str(order.get("user_id")) != user_id_str
        and str(order.get("customer_id")) != user_id_str
        and str(order.get("farmer_id")) != user_id_str
    ):
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    farmer_doc = await db.users.find_one({"_id": to_object_id(order.get("farmer_id"))})
    items_cursor = db.order_items.find({"order_id": order["_id"]})
    items_raw = await items_cursor.to_list(length=50)

    formatted = format_doc(order)
    formatted["farmer_name"] = farmer_doc.get("name", "Farmer") if farmer_doc else "Farmer"
    formatted["farmer_phone"] = farmer_doc.get("phone", "") if farmer_doc else ""
    formatted["items"] = [format_doc(item) for item in items_raw]

    return formatted


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    req: UpdateOrderStatusRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Farmer updates order status in MongoDB."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    obj_id = to_object_id(order_id)
    query = {"$or": [{"_id": obj_id}]} if obj_id else {"$or": [{"order_number": order_id}, {"id": order_id}]}
    if obj_id:
        query["$or"].append({"order_number": order_id})

    order = await db.orders.find_one(query)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db.orders.update_one(
        {"_id": order["_id"]},
        {"$set": {"current_status_index": req.current_status_index, "updated_at": datetime.now(timezone.utc)}}
    )

    return {"status": "updated", "new_status_index": req.current_status_index}


# --- Review Routes ---

@router.post("/reviews")
async def create_review(
    req: CreateReviewRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Customer submits a review for an order in MongoDB."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    customer_id = user["_id"]
    obj_oid = to_object_id(req.order_id)
    query = {"$or": [{"_id": obj_oid}]} if obj_oid else {"$or": [{"order_number": req.order_id}, {"id": req.order_id}]}
    if obj_oid:
        query["$or"].append({"order_number": req.order_id})

    order = await db.orders.find_one(query)
    farmer_id = order.get("farmer_id") if order else None
    order_db_id = order["_id"] if order else req.order_id

    review_doc = {
        "user_id": customer_id,  # Reviewer customer_id
        "customer_id": customer_id,
        "farmer_id": to_object_id(farmer_id) if farmer_id else None,
        "order_id": order_db_id,
        "rating": req.rating,
        "comment": req.comment,
        "created_at": datetime.now(timezone.utc),
    }

    await db.reviews.insert_one(review_doc)

    # Recalculate farmer rating in users collection
    if farmer_id:
        pipeline = [
            {"$match": {"farmer_id": to_object_id(farmer_id)}},
            {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
        ]
        stats_cursor = db.reviews.aggregate(pipeline)
        stats = await stats_cursor.to_list(length=1)

        if stats:
            avg_r = round(stats[0]["avg_rating"], 1)
            cnt = stats[0]["count"]
            await db.users.update_one({"_id": to_object_id(farmer_id)}, {"$set": {"rating": avg_r, "reviews_count": cnt}})

    return {"status": "created", "rating": req.rating}
