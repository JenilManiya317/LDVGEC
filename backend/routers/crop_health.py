"""
Crop Health Router — AI & Computer Vision Crop Disease Detection & Diagnostics
with MongoDB Diagnostic History Persistence.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Header

from backend.ml.crop_analyzer import crop_analyzer
from backend.database import get_db, format_doc
from backend.routers.auth import get_current_user

logger = logging.getLogger("farmwise.crop_health")
router = APIRouter(prefix="/api/crop-health", tags=["Crop Health"])


@router.post("/analyze")
async def analyze_crop_health(
    image: UploadFile = File(...),
    crop_name: Optional[str] = Form(None),
    growth_stage: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """
    Upload a crop image for real-time Computer Vision & AI pathology diagnostics.
    Saves analysis report to MongoDB when authenticated.
    """
    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/jpg", "application/octet-stream"}
    if image.content_type and image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image type: {image.content_type}. Supported: JPG, PNG, WebP"
        )

    # Read image bytes
    image_bytes = await image.read()

    # Validate size (15MB max)
    if len(image_bytes) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Maximum size is 15MB.")

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty image file provided.")

    try:
        result = await crop_analyzer.analyze_image(
            image_bytes=image_bytes,
            filename=image.filename or "crop.jpg",
            crop_hint=crop_name,
            growth_stage=growth_stage,
            notes=notes,
        )

        # Save to MongoDB crop_health collection if authenticated
        user = await get_current_user(authorization, db)
        if user:
            report_doc = {
                "user_id": user["_id"],
                "filename": image.filename or "crop.jpg",
                "crop_name": result.get("crop_name", crop_name),
                "analysis": result,
                "created_at": datetime.now(timezone.utc),
            }
            await db.crop_health.insert_one(report_doc)

        return {
            "status": "success",
            "analysis": result,
        }
    except Exception as e:
        logger.error(f"Crop health analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/history")
async def get_crop_health_history(authorization: str = Header(default=""), db=Depends(get_db)):
    """Retrieve crop health diagnostic history for authenticated user."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    cursor = db.crop_health.find({"user_id": user["_id"]}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    formatted = [format_doc(d) for d in docs]
    return {"reports": formatted, "total": len(formatted)}
