import time

from fastapi import APIRouter

router = APIRouter(tags=["health"])
_started_at = time.time()


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "uptimeSeconds": round(time.time() - _started_at, 1)}
