"""Public storefront endpoints — no authentication, read-only."""

from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import DbSession
from app.models.workshop import Part
from app.schemas.workshop import PartOut

router = APIRouter(prefix="/shop", tags=["shop"])


@router.get("/parts", response_model=list[PartOut])
def shop_parts(db: DbSession, q: str | None = None, category: str | None = None):
    """In-stock parts for the public shop page."""
    stmt = select(Part).where(Part.quantity > 0).order_by(Part.category, Part.name)
    if q:
        stmt = stmt.where(Part.name.ilike(f"%{q}%") | Part.supplier.ilike(f"%{q}%"))
    if category:
        stmt = stmt.where(Part.category == category)
    return db.scalars(stmt).all()
