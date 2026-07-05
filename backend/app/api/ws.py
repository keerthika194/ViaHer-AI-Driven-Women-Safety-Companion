from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.deviation_service import check_deviation
from app.ws.manager import manager

router = APIRouter(tags=["ws"])

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "location_update":
                result = check_deviation(data["lat"], data["lng"], data.get("route_coords", []))
                await websocket.send_json({"type": "deviation_status", **result})
                if result["deviated"]:
                    await manager.send_to_user(user_id, {"type": "deviation_alert", **result})
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
