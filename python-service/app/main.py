from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import availability, booking_assistance, classification, health, image_analysis

app = FastAPI(
    title="AGS Intelligence Service",
    description=(
        "Lightweight Python service for AGS: availability recommendations, "
        "service-request classification, image-analysis scaffolding, and "
        "booking assistance. Node remains the source of truth for bookings, "
        "availability, and users — this service never writes to the "
        "MongoDB database directly."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(availability.router)
app.include_router(classification.router)
app.include_router(image_analysis.router)
app.include_router(booking_assistance.router)
