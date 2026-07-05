import httpx
from app.core.config import settings

async def geocode_address(address: str) -> tuple[float, float]:
    query = address if settings.CITY_NAME.split(",")[0].lower() in address.lower() else f"{address}, {settings.CITY_NAME}"
    headers = {"User-Agent": settings.NOMINATIM_USER_AGENT}
    params = {"q": query, "format": "json", "limit": 1}
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{settings.NOMINATIM_URL}/search", params=params, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        if not data:
            raise ValueError(f"Could not geocode address: {query}. Try a more specific place name.")
        return float(data[0]["lat"]), float(data[0]["lon"])
