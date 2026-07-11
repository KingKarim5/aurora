from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.customer import Customer
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.workshop import JobCard, JobCardItem, JobCardItemType, JobCardStatus, Part
from app.schemas.workshop import JobCardCreate, JobCardItemCreate, JobCardOut, JobCardUpdate
from app.services.numbering import next_job_card_number

router = APIRouter(prefix="/job-cards", tags=["job-cards"])

# Transitions a job card is allowed to make; anything else is a 409.
ALLOWED_TRANSITIONS: dict[JobCardStatus, set[JobCardStatus]] = {
    JobCardStatus.OPEN: {JobCardStatus.IN_PROGRESS, JobCardStatus.CANCELLED},
    JobCardStatus.IN_PROGRESS: {
        JobCardStatus.AWAITING_PARTS,
        JobCardStatus.COMPLETED,
        JobCardStatus.CANCELLED,
    },
    JobCardStatus.AWAITING_PARTS: {JobCardStatus.IN_PROGRESS, JobCardStatus.CANCELLED},
    JobCardStatus.COMPLETED: {JobCardStatus.INVOICED},
    JobCardStatus.INVOICED: set(),
    JobCardStatus.CANCELLED: set(),
}


def _get_job_card(db, job_card_id: int) -> JobCard:
    job_card = db.get(JobCard, job_card_id)
    if job_card is None:
        raise HTTPException(status_code=404, detail="Job card not found")
    return job_card


@router.post("", response_model=JobCardOut, status_code=201)
def create_job_card(db: DbSession, _: CurrentUser, body: JobCardCreate):
    if db.get(Customer, body.customer_id) is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    vehicle = db.get(Vehicle, body.vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.customer_id != body.customer_id:
        raise HTTPException(status_code=422, detail="Vehicle does not belong to this customer")
    if body.assigned_mechanic_id and db.get(User, body.assigned_mechanic_id) is None:
        raise HTTPException(status_code=404, detail="Mechanic not found")

    job_card = JobCard(number=next_job_card_number(db), **body.model_dump())
    if body.odometer_km > vehicle.mileage_km:
        vehicle.mileage_km = body.odometer_km
    db.add(job_card)
    db.commit()
    db.refresh(job_card)
    return job_card


@router.get("", response_model=list[JobCardOut])
def list_job_cards(
    db: DbSession,
    _: CurrentUser,
    status: JobCardStatus | None = None,
    vehicle_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
):
    stmt = select(JobCard).order_by(JobCard.id.desc()).offset(skip).limit(min(limit, 200))
    if status:
        stmt = stmt.where(JobCard.status == status)
    if vehicle_id:
        stmt = stmt.where(JobCard.vehicle_id == vehicle_id)
    return db.scalars(stmt).all()


@router.get("/{job_card_id}", response_model=JobCardOut)
def get_job_card(db: DbSession, _: CurrentUser, job_card_id: int):
    return _get_job_card(db, job_card_id)


@router.patch("/{job_card_id}", response_model=JobCardOut)
def update_job_card(db: DbSession, _: CurrentUser, job_card_id: int, body: JobCardUpdate):
    job_card = _get_job_card(db, job_card_id)
    data = body.model_dump(exclude_unset=True)

    new_status = data.pop("status", None)
    if new_status is not None and new_status != job_card.status:
        if new_status not in ALLOWED_TRANSITIONS[job_card.status]:
            raise HTTPException(
                status_code=409,
                detail=f"Cannot move job card from '{job_card.status.value}' "
                f"to '{new_status.value}'",
            )
        job_card.status = new_status
        if new_status == JobCardStatus.COMPLETED:
            job_card.completed_at = datetime.now(UTC)

    if "assigned_mechanic_id" in data and data["assigned_mechanic_id"] is not None:
        if db.get(User, data["assigned_mechanic_id"]) is None:
            raise HTTPException(status_code=404, detail="Mechanic not found")

    for key, value in data.items():
        setattr(job_card, key, value)
    db.commit()
    db.refresh(job_card)
    return job_card


@router.post("/{job_card_id}/items", response_model=JobCardOut, status_code=201)
def add_item(db: DbSession, _: CurrentUser, job_card_id: int, body: JobCardItemCreate):
    job_card = _get_job_card(db, job_card_id)
    if job_card.status in (JobCardStatus.INVOICED, JobCardStatus.CANCELLED):
        raise HTTPException(status_code=409, detail="Job card is closed")

    unit_price = body.unit_price
    if body.item_type == JobCardItemType.PART:
        if body.part_id is None:
            raise HTTPException(status_code=422, detail="part_id is required for part items")
        part = db.get(Part, body.part_id)
        if part is None:
            raise HTTPException(status_code=404, detail="Part not found")
        if part.quantity < body.quantity:
            raise HTTPException(
                status_code=409,
                detail=f"Insufficient stock for '{part.name}': {part.quantity} available",
            )
        part.quantity -= body.quantity
        if unit_price is None:
            unit_price = part.unit_price
    elif unit_price is None:
        raise HTTPException(status_code=422, detail="unit_price is required for labor items")

    item = JobCardItem(
        job_card_id=job_card.id,
        item_type=body.item_type,
        part_id=body.part_id,
        description=body.description,
        quantity=body.quantity,
        unit_price=unit_price,
    )
    db.add(item)
    db.commit()
    db.refresh(job_card)
    return job_card


@router.delete("/{job_card_id}/items/{item_id}", response_model=JobCardOut)
def remove_item(db: DbSession, _: CurrentUser, job_card_id: int, item_id: int):
    job_card = _get_job_card(db, job_card_id)
    if job_card.status in (JobCardStatus.INVOICED, JobCardStatus.CANCELLED):
        raise HTTPException(status_code=409, detail="Job card is closed")
    item = db.get(JobCardItem, item_id)
    if item is None or item.job_card_id != job_card.id:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.item_type == JobCardItemType.PART and item.part_id:
        part = db.get(Part, item.part_id)
        if part:
            part.quantity += item.quantity  # return stock
    db.delete(item)
    db.commit()
    db.refresh(job_card)
    return job_card
