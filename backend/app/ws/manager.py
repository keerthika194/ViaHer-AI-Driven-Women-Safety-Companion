from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active and websocket in self.active[user_id]:
            self.active[user_id].remove(websocket)

    async def send_to_user(self, user_id: str, message: dict):
        for ws in self.active.get(user_id, []):
            await ws.send_json(message)

manager = ConnectionManager()
