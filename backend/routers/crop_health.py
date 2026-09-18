"""
Crop Health Router — AI-powered crop disease detection via image upload.
"""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.ml.crop_analyzer import crop_analyzer

logger = logging.getLogger("farmwise.crop_health")
router = APIRouter(prefix="/api/crop-health", tags=["Crop Health"])


@router.post("/analyze")
async def analyze_crop_health(image: UploadFile = File(...)):
    """
    Upload a crop image for AI-powered disease and health analysis.

    Accepts JPG, PNG, or WebP images up to 15MB.
    Returns health status, detected issues, and recommendations.
    """
    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
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
        raise HTTPException(status_code=400, detail="Empty image file")

    try:
        result = await crop_analyzer.analyze_image(image_bytes, image.filename or "crop.jpg")
        return {
            "status": "success",
            "analysis": result,
        }
    except Exception as e:
        logger.error(f"Crop health analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
