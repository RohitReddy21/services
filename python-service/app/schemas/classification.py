from typing import Literal

from pydantic import BaseModel, Field

RequirementType = Literal[
    "installation",
    "repair",
    "servicing",
    "maintenance",
    "replacement",
    "diagnostics",
    "emergency",
    "other",
]


class ServiceClassificationRequest(BaseModel):
    description: str = Field(..., min_length=3, max_length=2000)
    category_id: Literal["air-conditioning", "refrigeration", "electrical"] | None = Field(
        None, alias="categoryId"
    )

    model_config = {"populate_by_name": True}


class ClassificationCandidate(BaseModel):
    requirement: RequirementType
    confidence: float


class ServiceClassificationResponse(BaseModel):
    requirement: RequirementType
    confidence: float
    is_likely_emergency: bool = Field(..., serialization_alias="isLikelyEmergency")
    matched_keywords: list[str] = Field(..., serialization_alias="matchedKeywords")
    alternatives: list[ClassificationCandidate]
