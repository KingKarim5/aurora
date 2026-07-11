from fastapi import APIRouter, HTTPException
from sqlalchemy import or_, select

from app.api.deps import CurrentUser, DbSession, ManagerOrAdmin
from app.models.workshop import Part
from app.schemas.workshop import PartCreate, PartOut, PartUpdate

router = APIRouter(prefix="/parts", tags=["parts"])


@router.post("", response_model=PartOut, status_code=201, dependencies=[ManagerOrAdmin])
def create_part(db: DbSession, body: PartCreate):
    if db.scalar(select(Part).where(Part.sku == body.sku)):
        raise HTTPException(status_code=409, detail="SKU already exists")
    part = Part(**body.model_dump())
    db.add(part)
    db.commit()
    db.refresh(part)
    return part


@router.get("", response_model=list[PartOut])
def list_parts(
    db: DbSession,
    _: CurrentUser,
    q: str | None = None,
    low_stock: bool = False,
    skip: int = 0,
    limit: int = 50,
):
    stmt = select(Part).order_by(Part.name).offset(skip).limit(min(limit, 200))
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(or_(Part.name.ilike(pattern), Part.sku.ilike(pattern)))
    if low_stock:
        stmt = stmt.where(Part.quantity <= Part.reorder_level)
    return db.scalars(stmt).all()


@router.get("/{part_id}", response_model=PartOut)
def get_part(db: DbSession, _: CurrentUser, part_id: int):
    part = db.get(Part, part_id)
    if part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    return part


@router.patch("/{part_id}", response_model=PartOut, dependencies=[ManagerOrAdmin])
def update_part(db: DbSession, part_id: int, body: PartUpdate):
    part = db.get(Part, part_id)
    if part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(part, key, value)
    db.commit()
    db.refresh(part)
    return part
