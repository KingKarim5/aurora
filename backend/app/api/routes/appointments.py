from datetime import datetime

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.workshop import Appointment, AppointmentStatus
from app.schemas.workshop import AppointmentCreate, AppointmentOut, AppointmentUpdate

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("", response_model=AppointmentOut, status_code=201)
def create_appointment(db: DbSession, _: CurrentUser, body: AppointmentCreate):
    if db.get(Customer, body.customer_id) is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    vehicle = db.get(Vehicle, body.vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.customer_id != body.customer_id:
        raise HTTPException(status_code=422, detail="Vehicle does not belong to this customer")
    appointment = Appointment(**body.model_dump())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("", response_model=list[AppointmentOut])
def list_appointments(
    db: DbSession,
    _: CurrentUser,
    status: AppointmentStatus | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    skip: int = 0,
    limit: int = 50,
):
    stmt = (
        select(Appointment)
        .order_by(Appointment.scheduled_at)
        .offset(skip)
        .limit(min(limit, 200))
    )
    if status:
        stmt = stmt.where(Appointment.status == status)
    if date_from:
        stmt = stmt.where(Appointment.scheduled_at >= date_from)
    if date_to:
        stmt = stmt.where(Appointment.scheduled_at <= date_to)
    return db.scalars(stmt).all()


@router.patch("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(
    db: DbSession, _: CurrentUser, appointment_id: int, body: AppointmentUpdate
):
    appointment = db.get(Appointment, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(appointment, key, value)
    db.commit()
    db.refresh(appointment)
    return appointment
