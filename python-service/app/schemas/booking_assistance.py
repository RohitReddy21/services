from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.classification import RequirementType


class BookingAssistanceRequest(BaseModel):
    message: str = Field(..., min_length=3, max_length=2000)
    category_id: Literal["air-conditioning", "refrigeration"] | None = Field(
        None, alias="categoryId"
    )

    model_config = {"populate_by_name": True}


class BookingAssistanceResponse(BaseModel):
    suggested_requirement: RequirementType | None = Field(
        None, serialization_alias="suggestedRequirement"
    )
    is_likely_emergency: bool = Field(False, serialization_alias="isLikelyEmergency")
    tips: list[str]
    follow_up_questions: list[str] = Field(..., serialization_alias="followUpQuestions")
