from typing import Literal

from pydantic import BaseModel, Field

TimeOfDay = Literal["morning", "afternoon", "evening"]


class CandidateSlot(BaseModel):
    date: str = Field(..., description="ISO date, YYYY-MM-DD")
    slot_id: str = Field(..., alias="slotId")
    label: str
    period: Literal["Morning", "Afternoon", "Evening"]

    model_config = {"populate_by_name": True}


class RecommendAvailabilityRequest(BaseModel):
    candidate_slots: list[CandidateSlot] = Field(..., alias="candidateSlots", min_length=1)
    preferred_time_of_day: TimeOfDay | None = Field(None, alias="preferredTimeOfDay")
    is_emergency: bool = Field(False, alias="isEmergency")

    model_config = {"populate_by_name": True}


class RankedSlot(BaseModel):
    date: str
    slot_id: str = Field(..., serialization_alias="slotId")
    label: str
    score: float
    reason: str


class RecommendAvailabilityResponse(BaseModel):
    recommended: list[RankedSlot]
    summary: str
