from pydantic import BaseModel, Field, HttpUrl


class ImageAnalysisRequest(BaseModel):
    image_url: HttpUrl = Field(..., alias="imageUrl")

    model_config = {"populate_by_name": True}


class ImageAnalysisResponse(BaseModel):
    status: str
    reachable: bool
    content_type: str | None = Field(None, serialization_alias="contentType")
    size_bytes: int | None = Field(None, serialization_alias="sizeBytes")
    message: str
