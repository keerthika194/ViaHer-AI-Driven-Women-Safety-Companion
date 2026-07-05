import asyncio
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException
from app.schemas.route import RouteRequest, RouteCompareResponse
from app.services.routing_engine import compute_routes
from app.services.geocode_service import geocode_address

router = APIRouter(prefix="/routes", tags=["routes"])


@router.post("/compare", response_model=RouteCompareResponse)
async def compare_routes(payload: RouteRequest, request: Request):
    G = request.app.state.graph
    hour = payload.hour_override if payload.hour_override is not None else datetime.now().hour

    orig_lat, orig_lng = payload.origin_lat, payload.origin_lng
    dest_lat, dest_lng = payload.dest_lat, payload.dest_lng

    if orig_lat is None and payload.origin_address:
        orig_lat, orig_lng = await geocode_address(payload.origin_address)
    if dest_lat is None and payload.destination_address:
        dest_lat, dest_lng = await geocode_address(payload.destination_address)

    if orig_lat is None or dest_lat is None:
        raise HTTPException(400, "Provide either coordinates or addresses for origin and destination")

    try:
        # Run the CPU-heavy graph computation in a thread so the async
        # event loop stays free for other requests during computation.
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,  # uses default ThreadPoolExecutor
            compute_routes,
            G, orig_lat, orig_lng, dest_lat, dest_lng, hour,
        )
    except Exception as e:
        raise HTTPException(500, f"Routing failed: {e}")

    return result
