from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.vehicle import FuelType


class VehicleCreate(BaseModel):
    customer_id: int
    vin: str | None = Field(default=None, min_length=11, max_length=17)
    license_plate: str = Field(min_length=1, max_length=20)
    make: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    year: int = Field(ge=1950, le=2100)
    fuel_type: FuelType = FuelType.PETROL
    mileage_km: int = Field(default=0, ge=0)


class VehicleUpdate(BaseModel):
    license_plate: str | None = Field(default=None, min_length=1, max_length=20)
    mileage_km: int | None = Field(default=None, ge=0)
    fuel_type: FuelType | None = None


class VehicleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    vin: str | None
    license_plate: str
    make: str
    model: str
    year: int
    fuel_type: FuelType
    mileage_km: int
    created_at: datetime


class HealthSnapshotCreate(BaseModel):
    mileage_km: int = Field(ge=0)
    battery_health: float = Field(ge=0, le=100)
    brake_health: float = Field(ge=0, le=100)
    tire_health: float = Field(ge=0, le=100)
    oil_life: float = Field(ge=0, le=100)
    notes: str | None = Field(default=None, max_length=1000)


class HealthSnapshotOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int
    recorded_at: datetime
    mileage_km: int
    battery_health: float
    brake_health: float
    tire_health: float
    oil_life: float
    notes: str | None


class ComponentTwin(BaseModel):
    component: str
    score: float
    status: str  # good | attention | critical
    prediction: str | None = None


class DigitalTwinOut(BaseModel):
    vehicle_id: int
    overall_health: float | None
    status: str
    components: list[ComponentTwin]
    snapshot_count: int
    last_updated: datetime | None
