import httpx
from fastapi import APIRouter

from app.schemas.image_analysis import ImageAnalysisRequest, ImageAnalysisResponse

router = APIRouter(prefix="/image-analysis", tags=["image-analysis"])


@router.post("", response_model=ImageAnalysisResponse)
async def analyze_image(payload: ImageAnalysisRequest) -> ImageAnalysisResponse:
    """
    Placeholder endpoint for future computer-vision fault detection (e.g.
    reading an error code off a photo, spotting a leak or ice build-up).
    No vision model is connected yet, so this only confirms the image is
    reachable and reports basic metadata — the contract is stable so a real
    model can be dropped in later without the frontend/backend changing.
    """
    async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
        try:
            response = await client.head(str(payload.image_url))
            if response.status_code >= 400 or "content-length" not in response.headers:
                response = await client.get(str(payload.image_url))
        except httpx.HTTPError:
            return ImageAnalysisResponse(
                status="unreachable",
                reachable=False,
                content_type=None,
                size_bytes=None,
                message="Could not reach the provided image URL.",
            )

    if response.status_code >= 400:
        return ImageAnalysisResponse(
            status="unreachable",
            reachable=False,
            content_type=None,
            size_bytes=None,
            message=f"Image URL returned HTTP {response.status_code}.",
        )

    content_length = response.headers.get("content-length")

    return ImageAnalysisResponse(
        status="pending_model_integration",
        reachable=True,
        content_type=response.headers.get("content-type"),
        size_bytes=int(content_length) if content_length else None,
        message=(
            "Image is reachable. Automated fault/equipment detection isn't "
            "connected yet — an engineer will review uploaded photos manually."
        ),
    )
