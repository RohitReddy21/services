from fastapi import APIRouter

from app.schemas.availability import RecommendAvailabilityRequest, RecommendAvailabilityResponse
from app.services.recommendation_service import rank_slots

router = APIRouter(prefix="/availability", tags=["availability"])


@router.post("/recommend", response_model=RecommendAvailabilityResponse)
def recommend_availability(payload: RecommendAvailabilityRequest) -> RecommendAvailabilityResponse:
    ranked = rank_slots(
        payload.candidate_slots,
        payload.preferred_time_of_day,
        payload.is_emergency,
    )

    top = ranked[0] if ranked else None
    summary = (
        f"Recommending {top.label} on {top.date} ({top.reason})."
        if top
        else "No candidate slots were provided."
    )

    return RecommendAvailabilityResponse(recommended=ranked, summary=summary)
