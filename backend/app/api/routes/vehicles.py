from fastapi import APIRouter, HTTPException
from sqlalchemy import or_, select

from app.api.deps import CurrentUser, DbSession
from app.models.customer import Customer
from app.models.vehicle import Vehicle, VehicleHealthSnapshot
from app.schemas.vehicle import (
    DigitalTwinOut,
    HealthSnapshotCreate,
    HealthSnapshotOut,
    VehicleCreate,
    VehicleOut,
    VehicleUpdate,
)
from app.services.digital_twin import build_digital_twin

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


def _get_vehicle(db, vehicle_id: int) -> Vehicle:
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("", response_model=VehicleOut, status_code=201)
def create_vehicle(db: DbSession, _: CurrentUser, body: VehicleCreate):
    if db.get(Customer, body.customer_id) is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    if body.vin and db.scalar(select(Vehicle).where(Vehicle.vin == body.vin)):
        raise HTTPException(status_code=409, detail="A vehicle with this VIN already exists")
    vehicle = Vehicle(**body.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("", response_model=list[VehicleOut])
def list_vehicles(
    db: DbSession, _: CurrentUser, q: str | None = None, skip: int = 0, limit: int = 50
):
    stmt = select(Vehicle).order_by(Vehicle.id.desc()).offset(skip).limit(min(limit, 200))
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                Vehicle.license_plate.ilike(pattern),
                Vehicle.make.ilike(pattern),
                Vehicle.model.ilike(pattern),
                Vehicle.vin.ilike(pattern),
            )
        )
    return db.scalars(stmt).all()


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(db: DbSession, _: CurrentUser, vehicle_id: int):
    return _get_vehicle(db, vehicle_id)


@router.patch("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(db: DbSession, _: CurrentUser, vehicle_id: int, body: VehicleUpdate):
    vehicle = _get_vehicle(db, vehicle_id)
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(vehicle, key, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.post(
    "/{vehicle_id}/health-snapshots", response_model=HealthSnapshotOut, status_code=201
)
def add_health_snapshot(
    db: DbSession, _: CurrentUser, vehicle_id: int, body: HealthSnapshotCreate
):
    vehicle = _get_vehicle(db, vehicle_id)
    snapshot = VehicleHealthSnapshot(vehicle_id=vehicle.id, **body.model_dump())
    if body.mileage_km > vehicle.mileage_km:
        vehicle.mileage_km = body.mileage_km
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


@router.get("/{vehicle_id}/health-snapshots", response_model=list[HealthSnapshotOut])
def list_health_snapshots(db: DbSession, _: CurrentUser, vehicle_id: int):
    _get_vehicle(db, vehicle_id)
    return db.scalars(
        select(VehicleHealthSnapshot)
        .where(VehicleHealthSnapshot.vehicle_id == vehicle_id)
        .order_by(VehicleHealthSnapshot.recorded_at)
    ).all()


@router.get("/{vehicle_id}/digital-twin", response_model=DigitalTwinOut)
def get_digital_twin(db: DbSession, _: CurrentUser, vehicle_id: int):
    vehicle = _get_vehicle(db, vehicle_id)
    snapshots = db.scalars(
        select(VehicleHealthSnapshot).where(VehicleHealthSnapshot.vehicle_id == vehicle_id)
    ).all()
    return build_digital_twin(vehicle, list(snapshots))
