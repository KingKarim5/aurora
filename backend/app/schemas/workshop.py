from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.workshop import AppointmentStatus, JobCardItemType, JobCardStatus


class PartCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=100)
    quantity: int = Field(default=0, ge=0)
    unit_price: Decimal = Field(ge=0)
    reorder_level: int = Field(default=2, ge=0)
    supplier: str | None = Field(default=None, max_length=255)


class PartUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    category: str | None = None
    quantity: int | None = Field(default=None, ge=0)
    unit_price: Decimal | None = Field(default=None, ge=0)
    reorder_level: int | None = Field(default=None, ge=0)
    supplier: str | None = None


class PartOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    category: str
    quantity: int
    unit_price: Decimal
    reorder_level: int
    supplier: str | None


class JobCardItemCreate(BaseModel):
    item_type: JobCardItemType
    part_id: int | None = None
    description: str = Field(min_length=1, max_length=500)
    quantity: int = Field(default=1, ge=1)
    unit_price: Decimal | None = Field(default=None, ge=0)  # defaults to part price for parts


class JobCardItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_type: JobCardItemType
    part_id: int | None
    description: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class JobCardCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    complaint: str = Field(min_length=1, max_length=2000)
    odometer_km: int = Field(ge=0)
    assigned_mechanic_id: int | None = None


class JobCardUpdate(BaseModel):
    status: JobCardStatus | None = None
    diagnosis: str | None = Field(default=None, max_length=2000)
    assigned_mechanic_id: int | None = None


class JobCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: str
    customer_id: int
    vehicle_id: int
    assigned_mechanic_id: int | None
    status: JobCardStatus
    complaint: str
    diagnosis: str | None
    odometer_km: int
    created_at: datetime
    completed_at: datetime | None
    items: list[JobCardItemOut]
    total: Decimal


class AppointmentCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    scheduled_at: datetime
    service_type: str = Field(min_length=1, max_length=255)
    notes: str | None = Field(default=None, max_length=1000)


class AppointmentUpdate(BaseModel):
    scheduled_at: datetime | None = None
    status: AppointmentStatus | None = None
    notes: str | None = None


class AppointmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    vehicle_id: int
    scheduled_at: datetime
    service_type: str
    status: AppointmentStatus
    notes: str | None
