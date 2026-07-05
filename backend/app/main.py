from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base, engine

# Import all models so SQLAlchemy registers them before create_all
from app.models import user, contact, sos_event  # noqa: F401

from app.services.osm_service import get_graph
from app.api import auth, routes, sos, contacts, ws as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── startup ──────────────────────────────────────────────
    Base.metadata.create_all(bind=engine)
    app.state.graph = get_graph()
    print("ViaHer backend ready. Road graph loaded.")
    yield
    # ── shutdown (nothing needed) ─────────────────────────────


app = FastAPI(title="ViaHer API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(routes.router)
app.include_router(sos.router)
app.include_router(contacts.router)
app.include_router(ws_router.router)


@app.get("/")
def root():
    return {"status": "ViaHer API running"}
