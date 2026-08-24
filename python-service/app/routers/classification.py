from fastapi import APIRouter

from app.schemas.classification import ServiceClassificationRequest, ServiceClassificationResponse
from app.services.classification_service import classify

router = APIRouter(prefix="/service-classification", tags=["classification"])


@router.post("", response_model=ServiceClassificationResponse)
def classify_service(payload: ServiceClassificationRequest) -> ServiceClassificationResponse:
    requirement, confidence, matched_keywords, alternatives = classify(payload.description)

    return ServiceClassificationResponse(
        requirement=requirement,
        confidence=confidence,
        is_likely_emergency=requirement == "emergency",
        matched_keywords=matched_keywords,
        alternatives=alternatives,
    )
