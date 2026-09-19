"""
Farm Router — Farmer land plot profiles and crop inventory stored in MongoDB.
"""

import logging
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel

from backend.database import get_db, to_object_id, format_doc
from backend.routers.auth import get_current_user

logger = logging.getLogger("farmwise.farm")
router = APIRouter(prefix="/api/farmer", tags=["Farmer Profile & Crops"])


# --- Pydantic Models ---

class FarmProfileRequest(BaseModel):
    name: str
    total_area: float
    state: Optional[str] = "Gujarat"
    district: Optional[str] = "Surat"
    soil_type: Optional[str] = "Loamy Alluvial Soil"
    irrigation_type: Optional[str] = "Drip Micro-irrigation"
    location: Optional[str] = ""


class CropCreateRequest(BaseModel):
    crop: str
    variety: Optional[str] = ""
    season: Optional[str] = "Kharif"
    sowingDate: Optional[str] = ""
    expectedHarvestDate: Optional[str] = ""
    area: float
    soilPh: Optional[float] = 6.5
    moistureTarget: Optional[float] = 65.0


# --- Endpoints ---

@router.get("/farm")
async def get_farm_profile(authorization: str = Header(default=""), db=Depends(get_db)):
    """Get farm infrastructure details for authenticated farmer."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = user["_id"]
    profile = await db.farm_profiles.find_one({"user_id": user_id})

    if not profile:
        # Return fallback default matching user data
        profile = {
            "user_id": user_id,
            "name": user.get("farm_name") or f"{user.get('name', 'Farmer')}'s Farm",
            "total_area": float(user.get("total_area") or 10.0) if str(user.get("total_area", "")).replace('.', '', 1).isdigit() else 10.0,
            "state": "Gujarat",
            "district": "Surat",
            "soil_type": "Loamy Alluvial Soil",
            "irrigation_type": "Drip Micro-irrigation",
            "location": user.get("location") or "Surat, Gujarat",
        }

    return format_doc(profile)


@router.put("/farm")
async def update_farm_profile(req: FarmProfileRequest, authorization: str = Header(default=""), db=Depends(get_db)):
    """Create or update farm infrastructure details for authenticated farmer."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = user["_id"]
    data = req.model_dump()
    data["user_id"] = user_id
    data["updated_at"] = datetime.now(timezone.utc)

    await db.farm_profiles.update_one(
        {"user_id": user_id},
        {"$set": data},
        upsert=True,
    )

    # Sync back to user profile for consistency
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"farm_name": req.name, "total_area": str(req.total_area), "location": req.location}}
    )

    updated = await db.farm_profiles.find_one({"user_id": user_id})
    return format_doc(updated)


@router.get("/crops")
async def get_farmer_crops(authorization: str = Header(default=""), db=Depends(get_db)):
    """Get active crops for authenticated farmer."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = user["_id"]
    cursor = db.crops.find({"user_id": user_id}).sort("created_at", -1)
    crop_docs = await cursor.to_list(length=100)

    formatted_crops = [format_doc(c) for c in crop_docs]
    return {"crops": formatted_crops, "total": len(formatted_crops)}


@router.post("/crops")
async def add_farmer_crop(req: CropCreateRequest, authorization: str = Header(default=""), db=Depends(get_db)):
    """Add a new crop to farmer's active inventory."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = user["_id"]
    crop_doc = req.model_dump()
    crop_doc["user_id"] = user_id
    crop_doc["created_at"] = datetime.now(timezone.utc)

    res = await db.crops.insert_one(crop_doc)
    crop_doc["_id"] = res.inserted_id

    return format_doc(crop_doc)


@router.delete("/crops/{crop_id}")
async def delete_farmer_crop(crop_id: str, authorization: str = Header(default=""), db=Depends(get_db)):
    """Delete a crop from farmer's active inventory (owner only)."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    obj_id = to_object_id(crop_id)
    if not obj_id:
        raise HTTPException(status_code=400, detail="Invalid crop ID format")

    result = await db.crops.delete_one({"_id": obj_id, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Crop not found or unauthorized")

    return {"status": "deleted", "crop_id": crop_id}
