from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.deps import StaffOnly
from app.api.routes import (
    appointments,
    auth,
    customers,
    dashboard,
    diagnostics,
    invoices,
    job_cards,
    parts,
    vehicles,
)
from app.core.config import get_settings
from app.db.base import Base
from app.db.seed import seed_initial_data
from app.db.session import SessionLocal, engine

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Development convenience only. In production (Docker, Vercel) the schema is
    # managed by `alembic upgrade head` and seeded once via `python -m app.db.seed`,
    # keeping serverless cold starts free of DB setup work.
    if settings.environment == "development":
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            seed_initial_data(db)
    yield


app = FastAPI(
    title=f"{settings.app_name} API",
    description="Automotive Unified Resource, Operations, Repair & Analytics platform.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_v1_prefix)

# Everything operational is staff-only; customer accounts stop at auth.
for router in (
    customers.router,
    vehicles.router,
    job_cards.router,
    parts.router,
    invoices.router,
    appointments.router,
    diagnostics.router,
    dashboard.router,
):
    app.include_router(router, prefix=settings.api_v1_prefix, dependencies=[StaffOnly])


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "app": settings.app_name, "environment": settings.environment}
