from fastapi import APIRouter

from app.schemas.booking_assistance import BookingAssistanceRequest, BookingAssistanceResponse
from app.services.classification_service import classify

router = APIRouter(prefix="/booking-assistance", tags=["booking-assistance"])

_TIPS: dict[str, list[str]] = {
    "emergency": [
        "Mention if there's any smell of burning, smoke, or a visible leak — this affects priority.",
        "Let us know if the unit is completely off or partially working.",
    ],
    "repair": [
        "Note any error codes shown on the display.",
        "A photo of the unit and any visible fault helps the engineer prepare.",
    ],
    "installation": [
        "Let us know the room size and whether there's an existing outdoor unit position.",
        "Photos of the installation location are helpful.",
    ],
    "servicing": [
        "Let us know when the unit was last serviced, if known.",
    ],
    "maintenance": [
        "Let us know if you're looking for a one-off visit or an ongoing plan — see our Care Plans.",
    ],
    "replacement": [
        "Let us know the age of the current unit and the refrigerant type if visible on the nameplate.",
    ],
    "diagnostics": [
        "Describe when the issue happens (e.g. only at certain times of day) — this speeds up diagnosis.",
    ],
    "other": [
        "The more detail you can share, the better we can prepare for the visit.",
    ],
}

_FOLLOW_UPS = [
    "What type of equipment is this for (e.g. wall mounted AC, cold room, fridge)?",
    "Is this for a home or a business?",
    "Do you have a preferred date or time for the visit?",
]


@router.post("", response_model=BookingAssistanceResponse)
def booking_assistance(payload: BookingAssistanceRequest) -> BookingAssistanceResponse:
    requirement, _confidence, _matched, _alternatives = classify(payload.message)

    return BookingAssistanceResponse(
        suggested_requirement=requirement,
        is_likely_emergency=requirement == "emergency",
        tips=_TIPS.get(requirement, _TIPS["other"]),
        follow_up_questions=_FOLLOW_UPS,
    )
